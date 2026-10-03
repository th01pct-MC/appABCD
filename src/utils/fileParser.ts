import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { Question, ParsedQuestionResult, QuestionType, AnswerDetectionMethod, VerificationStatus } from '../types/quiz';

interface FormattedRun {
  text: string;
  isRed: boolean;
  isUnderlined: boolean;
  isBold: boolean;
}

interface FormattedParagraph {
  text: string;
  runs: FormattedRun[];
  hasRed: boolean;
  hasUnderline: boolean;
}

// Check if a hex color or color name is considered "Red" in Microsoft Word / Office
export function isRedColor(colorVal: string | null | undefined): boolean {
  if (!colorVal) return false;
  const c = colorVal.trim().toUpperCase().replace('#', '');
  
  // Direct named or theme colors
  if (['RED', 'DARKRED', 'FIREBRICK', 'CRIMSON', 'ACCENT2'].includes(c)) return true;
  
  // Standard Word red hex codes: FF0000, C00000, DC2626, E11D48, B91C1C, EF4444
  if (c === 'FF0000' || c === 'C00000' || c === 'DC2626' || c === 'EF4444' || c === 'B91C1C' || c === '991B1B') {
    return true;
  }
  
  // RGB hex analysis: 6 hex characters
  if (/^[0-9A-F]{6}$/i.test(c)) {
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    // Red dominant: R is high (> 170) while Green and Blue are low (< 110), with clear separation
    if (r > 160 && g < 110 && b < 110 && (r - g > 60) && (r - b > 60)) {
      return true;
    }
  }

  return false;
}

// Parse Word Document XML from ArrayBuffer
export async function parseDocxFile(fileBuffer: ArrayBuffer): Promise<ParsedQuestionResult> {
  const zip = await JSZip.loadAsync(fileBuffer);
  const docXmlFile = zip.file('word/document.xml');
  if (!docXmlFile) {
    throw new Error('File DOCX không hợp lệ: Không tìm thấy nội dung word/document.xml');
  }

  const xmlText = await docXmlFile.async('text');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

  // Extract all paragraphs
  const pNodes = xmlDoc.getElementsByTagName('w:p');
  const formattedParagraphs: FormattedParagraph[] = [];

  for (let i = 0; i < pNodes.length; i++) {
    const pNode = pNodes[i];
    const runs: FormattedRun[] = [];
    let pFullText = '';
    let pHasRed = false;
    let pHasUnderline = false;

    const rNodes = pNode.getElementsByTagName('w:r');
    for (let j = 0; j < rNodes.length; j++) {
      const rNode = rNodes[j];
      const rPr = rNode.getElementsByTagName('w:rPr')[0];

      let isRed = false;
      let isUnderlined = false;
      let isBold = false;

      if (rPr) {
        // Color check
        const colorNode = rPr.getElementsByTagName('w:color')[0];
        if (colorNode) {
          const val = colorNode.getAttribute('w:val');
          if (isRedColor(val)) {
            isRed = true;
          }
        }

        // Underline check
        const uNode = rPr.getElementsByTagName('w:u')[0];
        if (uNode) {
          const uVal = uNode.getAttribute('w:val');
          if (uVal && uVal !== 'none' && uVal !== 'false') {
            isUnderlined = true;
          } else if (!uVal) {
            isUnderlined = true;
          }
        }

        // Bold check
        const bNode = rPr.getElementsByTagName('w:b')[0];
        if (bNode) {
          const bVal = bNode.getAttribute('w:val');
          if (bVal !== '0' && bVal !== 'false' && bVal !== 'none') {
            isBold = true;
          }
        }
      }

      // Text nodes within run (w:t)
      const tNodes = rNode.getElementsByTagName('w:t');
      let runText = '';
      for (let k = 0; k < tNodes.length; k++) {
        runText += tNodes[k].textContent || '';
      }

      if (runText) {
        runs.push({
          text: runText,
          isRed,
          isUnderlined,
          isBold,
        });
        pFullText += runText;
        if (isRed) pHasRed = true;
        if (isUnderlined) pHasUnderline = true;
      }
    }

    const trimmed = pFullText.trim();
    if (trimmed.length > 0) {
      formattedParagraphs.push({
        text: trimmed,
        runs,
        hasRed: pHasRed,
        hasUnderline: pHasUnderline,
      });
    }
  }

  return processFormattedParagraphs(formattedParagraphs);
}

// Core Question Builder from extracted paragraphs with run formatting
function processFormattedParagraphs(paragraphs: FormattedParagraph[]): ParsedQuestionResult {
  const rawQuestions: Array<{
    headerText: string;
    lines: FormattedParagraph[];
  }> = [];

  let currentBlock: { headerText: string; lines: FormattedParagraph[] } | null = null;

  // Regex to detect start of a question
  const questionStartRegex = /^(?:Câu|Bài|Question)\s*(\d+)[\s.:\-)]+/i;

  for (const p of paragraphs) {
    if (questionStartRegex.test(p.text)) {
      if (currentBlock) {
        rawQuestions.push(currentBlock);
      }
      currentBlock = {
        headerText: p.text,
        lines: [p],
      };
    } else {
      if (currentBlock) {
        currentBlock.lines.push(p);
      } else {
        // If file doesn't start with "Câu 1", initialize first block
        currentBlock = {
          headerText: p.text,
          lines: [p],
        };
      }
    }
  }
  if (currentBlock) {
    rawQuestions.push(currentBlock);
  }

  const parsedQuestions: Question[] = [];

  for (let idx = 0; idx < rawQuestions.length; idx++) {
    const block = rawQuestions[idx];
    const q = parseSingleQuestionBlock(block.lines, idx + 1);
    if (q) {
      parsedQuestions.push(q);
    }
  }

  // Summary counts
  const multipleChoiceCount = parsedQuestions.filter((q) => q.type === 'multiple_choice').length;
  const trueFalseCount = parsedQuestions.filter((q) => q.type === 'true_false').length;
  const verifiedCount = parsedQuestions.filter((q) => q.verificationStatus === 'verified').length;
  const needsReviewCount = parsedQuestions.filter((q) => q.verificationStatus === 'needs_review').length;

  return {
    total: parsedQuestions.length,
    multipleChoiceCount,
    trueFalseCount,
    verifiedCount,
    needsReviewCount,
    questions: parsedQuestions,
  };
}

function parseSingleQuestionBlock(lines: FormattedParagraph[], questionIndex: number): Question | null {
  if (lines.length === 0) return null;

  const fullText = lines.map((l) => l.text).join('\n');
  
  // Check if this is a True/False question
  // Signs:
  // 1. Explicit mention of "Đúng/Sai" or "Đúng hay Sai"
  // 2. Contains statements: a., b., c., d. with True/False answers
  const isTrueFalseType = 
    /đúng\s*[\/\-]\s*sai/i.test(fullText) || 
    /(?:mệnh đề|khẳng định|nhận định|phát biểu).*(?:đúng|sai)/i.test(fullText) ||
    (/(?:\n|^|\s)[a-d]\s*[\.:\-)].*(?:đúng|sai)/i.test(fullText) && !/^[A-D]\s*[\.:\-)].*/m.test(fullText));

  if (isTrueFalseType) {
    return parseTrueFalseQuestion(lines, questionIndex);
  } else {
    return parseMultipleChoiceQuestion(lines, questionIndex);
  }
}

// -------------------------------------------------------------
// MULTIPLE CHOICE PARSER WITH RED TEXT & UNDERLINE DETECTION
// -------------------------------------------------------------
function parseMultipleChoiceQuestion(lines: FormattedParagraph[], questionIndex: number): Question {
  let contentLines: string[] = [];
  const optionsMap: { [key: string]: string } = {};
  const optionCandidates: {
    [key: string]: { isRed: boolean; isUnderline: boolean; text: string };
  } = {};

  let explicitAnswer: string | null = null;
  const explicitAnswerRegex = /(?:Đáp án|Đ\/A|Key|Answer)[\s:：\-]*([A-D])/i;

  const optionLineRegex = /^([A-D])[\s.:\-)](.*)/i;
  // In-line multi-option check: e.g. "A. Hà Nội   B. Đà Nẵng   C. Huế   D. HCM"
  const multiOptionInLineRegex = /([A-D])[\s.:\-)]\s*([^A-D\n]+)/g;

  for (const line of lines) {
    // Check for explicit answer line first
    const explicitMatch = line.text.match(explicitAnswerRegex);
    if (explicitMatch) {
      explicitAnswer = explicitMatch[1].toUpperCase();
      continue;
    }

    const singleMatch = line.text.match(optionLineRegex);
    if (singleMatch) {
      const optKey = singleMatch[1].toUpperCase();
      const optBody = singleMatch[2].trim();
      optionsMap[optKey] = optBody;

      // Check runs in this paragraph for red or underline
      let hasRedInOption = false;
      let hasUnderlineInOption = false;

      for (const run of line.runs) {
        if (run.isRed && run.text.trim().length > 0) {
          hasRedInOption = true;
        }
        if (run.isUnderlined && run.text.trim().length > 0) {
          hasUnderlineInOption = true;
        }
      }

      optionCandidates[optKey] = {
        isRed: hasRedInOption,
        isUnderline: hasUnderlineInOption,
        text: optBody,
      };
    } else {
      // Check if line contains inline multiple options: A. ... B. ...
      let matchedCount = 0;
      let match;
      const inlineFound: Array<{ key: string; text: string }> = [];
      while ((match = multiOptionInLineRegex.exec(line.text)) !== null) {
        inlineFound.push({
          key: match[1].toUpperCase(),
          text: match[2].trim(),
        });
        matchedCount++;
      }

      if (matchedCount >= 2) {
        for (const item of inlineFound) {
          optionsMap[item.key] = item.text;
          // Check runs that match this text
          let hasRed = false;
          let hasUnderline = false;
          for (const run of line.runs) {
            if (run.text.includes(item.text) || item.text.includes(run.text)) {
              if (run.isRed) hasRed = true;
              if (run.isUnderlined) hasUnderline = true;
            }
          }
          optionCandidates[item.key] = {
            isRed: hasRed,
            isUnderline: hasUnderline,
            text: item.text,
          };
        }
      } else {
        // Part of question content
        contentLines.push(line.text);
      }
    }
  }

  // Ensure default A, B, C, D options exist
  const finalOptions: { [key: string]: string } = {
    A: optionsMap['A'] || '',
    B: optionsMap['B'] || '',
    C: optionsMap['C'] || '',
    D: optionsMap['D'] || '',
  };

  // If content has "Câu X: ...", clean it up for presentation
  let cleanedContent = contentLines.join('\n').trim();
  cleanedContent = cleanedContent.replace(/^(?:Câu|Bài|Question)\s*\d+[\s.:\-)]*/i, '').trim();
  if (!cleanedContent) {
    cleanedContent = `Câu hỏi ${questionIndex}`;
  }

  // DETECTION LOGIC:
  // 1. Gather all candidates from red text or underline
  const redCandidates: string[] = [];
  const underlineCandidates: string[] = [];

  ['A', 'B', 'C', 'D'].forEach((key) => {
    const candidate = optionCandidates[key];
    if (candidate) {
      if (candidate.isRed) redCandidates.push(key);
      if (candidate.isUnderline) underlineCandidates.push(key);
    }
  });

  const formattedCandidates = Array.from(new Set([...redCandidates, ...underlineCandidates]));

  let detectedAnswer: string | undefined = undefined;
  let detectionMethod: AnswerDetectionMethod = 'explicit_answer';
  let verificationStatus: VerificationStatus = 'verified';
  let detectionDetails = '';
  let reviewReason = '';

  // Case 1: Exactly 1 formatted candidate
  if (formattedCandidates.length === 1) {
    const cand = formattedCandidates[0];
    const isRed = redCandidates.includes(cand);
    const isUnder = underlineCandidates.includes(cand);

    detectedAnswer = cand;
    detectionMethod = isRed ? 'red_text' : 'underline';
    detectionDetails = isRed
      ? `Nhận diện từ chữ màu đỏ tại phương án ${cand}`
      : `Nhận diện từ gạch chân tại phương án ${cand}`;

    // If explicit answer is ALSO present, check for agreement
    if (explicitAnswer) {
      if (explicitAnswer !== cand) {
        // CONFLICT!
        verificationStatus = 'needs_review';
        reviewReason = `Mâu thuẫn: Đáp án ghi rõ là "${explicitAnswer}" nhưng phương án "${cand}" lại được ${isRed ? 'tô đỏ' : 'gạch chân'}.`;
        detectedAnswer = cand; // suggest candidate but require review
      } else {
        detectionDetails += ` (Khớp hoàn toàn với "Đáp án: ${explicitAnswer}")`;
      }
    }
  } 
  // Case 2: No formatted candidate (0 found)
  else if (formattedCandidates.length === 0) {
    if (explicitAnswer && ['A', 'B', 'C', 'D'].includes(explicitAnswer)) {
      detectedAnswer = explicitAnswer;
      detectionMethod = 'explicit_answer';
      detectionDetails = `Nhận diện từ mục ghi rõ "Đáp án: ${explicitAnswer}"`;
      verificationStatus = 'verified';
    } else {
      verificationStatus = 'needs_review';
      reviewReason = 'Không phát hiện chữ màu đỏ, gạch chân hoặc đáp án ghi rõ trong câu hỏi.';
      detectionMethod = 'explicit_answer';
      detectedAnswer = 'A'; // default fallback for admin review
    }
  } 
  // Case 3: More than 1 candidate (> 1 found)
  else {
    verificationStatus = 'needs_review';
    reviewReason = `Phát hiện nhiều hơn 1 phương án được đánh dấu (${formattedCandidates.join(', ')}).`;
    detectedAnswer = formattedCandidates[0];
    detectionMethod = redCandidates.length > 0 ? 'red_text' : 'underline';
    detectionDetails = `Cần xác nhận giữa các phương án: ${formattedCandidates.join(', ')}`;
  }

  return {
    id: `q_mc_${Date.now()}_${questionIndex}_${Math.random().toString(36).substring(2, 6)}`,
    type: 'multiple_choice',
    content: cleanedContent,
    options: finalOptions,
    correctAnswer: detectedAnswer,
    answerDetectionMethod: detectionMethod,
    verificationStatus,
    detectionDetails,
    reviewReason: reviewReason || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// TRUE / FALSE MULTI-STATEMENT PARSER
// -------------------------------------------------------------
function parseTrueFalseQuestion(lines: FormattedParagraph[], questionIndex: number): Question {
  const contentLines: string[] = [];
  const statements: { [key: string]: string } = {
    a: '',
    b: '',
    c: '',
    d: '',
  };
  const statementAnswers: { [key: string]: boolean } = {
    a: true,
    b: false,
    c: true,
    d: false,
  };
  const statementDetected: { [key: string]: boolean } = {
    a: false,
    b: false,
    c: false,
    d: false,
  };

  const statementRegex = /^([a-d])[\s.:\-)](.*)/i;
  const explicitStmtAnswerRegex = /([a-d])\s*[:=\-]\s*(đúng|sai|đ|s|true|false)/gi;

  // Track explicit block answers e.g. "Đáp án: a - Đúng, b - Sai, c - Đúng, d - Sai"
  const fullText = lines.map((l) => l.text).join('\n');
  let match;
  while ((match = explicitStmtAnswerRegex.exec(fullText)) !== null) {
    const key = match[1].toLowerCase();
    const valStr = match[2].toLowerCase();
    const isTrue = valStr === 'đúng' || valStr === 'đ' || valStr === 'true';
    if (['a', 'b', 'c', 'd'].includes(key)) {
      statementAnswers[key] = isTrue;
      statementDetected[key] = true;
    }
  }

  for (const line of lines) {
    const stmtMatch = line.text.match(statementRegex);
    if (stmtMatch) {
      const key = stmtMatch[1].toLowerCase();
      let text = stmtMatch[2].trim();

      // Check if statement text itself specifies "(Đúng)" or "(Sai)" at end
      const inlineResultMatch = text.match(/[\(\-\[]\s*(đúng|sai|đ|s)\s*[\)\]]$/i);
      if (inlineResultMatch) {
        const valStr = inlineResultMatch[1].toLowerCase();
        const isTrue = valStr === 'đúng' || valStr === 'đ';
        statementAnswers[key] = isTrue;
        statementDetected[key] = true;
        text = text.replace(/[\(\-\[]\s*(đúng|sai|đ|s)\s*[\)\]]$/i, '').trim();
      } else {
        // Check for formatting (red text or underline)
        let hasRed = false;
        let hasUnderline = false;
        for (const run of line.runs) {
          if (run.isRed && run.text.trim().length > 0) hasRed = true;
          if (run.isUnderlined && run.text.trim().length > 0) hasUnderline = true;
        }

        // If formatted as red or underlined and not yet explicitly set
        if ((hasRed || hasUnderline) && !statementDetected[key]) {
          // If statement is highlighted, marked as True by convention
          statementAnswers[key] = true;
          statementDetected[key] = true;
        }
      }

      statements[key] = text;
    } else {
      // Content lines
      if (!/đáp án/i.test(line.text)) {
        contentLines.push(line.text);
      }
    }
  }

  let cleanedContent = contentLines.join('\n').trim();
  cleanedContent = cleanedContent.replace(/^(?:Câu|Bài|Question)\s*\d+[\s.:\-)]*/i, '').trim();
  if (!cleanedContent) {
    cleanedContent = `Câu hỏi Đúng/Sai ${questionIndex}`;
  }

  // Verification status
  const allDetected = ['a', 'b', 'c', 'd'].every((k) => statementDetected[k] && statements[k]);
  const verificationStatus: VerificationStatus = allDetected ? 'verified' : 'needs_review';
  const reviewReason = allDetected
    ? undefined
    : 'Cần kiểm tra: Chưa xác định chắc chắn đáp án đúng/sai cho một số mệnh đề (a, b, c, d). Vui lòng xác nhận trước khi lưu.';

  return {
    id: `q_tf_${Date.now()}_${questionIndex}_${Math.random().toString(36).substring(2, 6)}`,
    type: 'true_false',
    content: cleanedContent,
    statements,
    statementAnswers,
    answerDetectionMethod: allDetected ? 'explicit_answer' : 'admin_confirmed',
    verificationStatus,
    detectionDetails: allDetected
      ? 'Đã xác định đầy đủ đáp án cho 4 mệnh đề a, b, c, d'
      : 'Cần Admin xác nhận Đúng/Sai cho từng mệnh đề',
    reviewReason,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// EXCEL & CSV PARSER
// -------------------------------------------------------------
export async function parseExcelOrCsvFile(fileBuffer: ArrayBuffer): Promise<ParsedQuestionResult> {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (rows.length < 2) {
    throw new Error('File Excel/CSV không có dữ liệu hoặc thiếu dòng tiêu đề.');
  }

  // Detect header row index
  let headerIndex = 0;
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const rowStr = rows[i].join(' ').toLowerCase();
    if (rowStr.includes('câu hỏi') || rowStr.includes('nội dung') || rowStr.includes('đáp án')) {
      headerIndex = i;
      break;
    }
  }

  const headers = rows[headerIndex].map((h: any) => String(h).trim().toLowerCase());
  const questions: Question[] = [];

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || !row[0]) continue;

    // Detect type
    const rowText = row.join(' ').toLowerCase();
    const isTrueFalse = rowText.includes('đúng/sai') || rowText.includes('true_false');

    if (isTrueFalse) {
      // True/False row
      const content = String(row[0] || '').trim();
      const stmtA = String(row[1] || '').trim();
      const stmtB = String(row[2] || '').trim();
      const stmtC = String(row[3] || '').trim();
      const stmtD = String(row[4] || '').trim();
      const rawAns = String(row[5] || '').toLowerCase(); // e.g. "a:đ, b:s, c:đ, d:s" or "đ-s-đ-s"

      const statementAnswers: { [key: string]: boolean } = {
        a: rawAns.includes('a:đ') || rawAns.includes('a:t') || rawAns.includes('đ'),
        b: rawAns.includes('b:đ') || rawAns.includes('b:t'),
        c: rawAns.includes('c:đ') || rawAns.includes('c:t'),
        d: rawAns.includes('d:đ') || rawAns.includes('d:t'),
      };

      questions.push({
        id: `q_tf_excel_${Date.now()}_${i}`,
        type: 'true_false',
        content: content || `Câu hỏi Đúng/Sai ${i}`,
        statements: {
          a: stmtA || 'Mệnh đề a',
          b: stmtB || 'Mệnh đề b',
          c: stmtC || 'Mệnh đề c',
          d: stmtD || 'Mệnh đề d',
        },
        statementAnswers,
        answerDetectionMethod: 'explicit_answer',
        verificationStatus: 'verified',
        detectionDetails: 'Đọc từ bảng tính Excel/CSV',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Multiple Choice row
      const content = String(row[0] || '').trim();
      const optA = String(row[1] || '').trim();
      const optB = String(row[2] || '').trim();
      const optC = String(row[3] || '').trim();
      const optD = String(row[4] || '').trim();
      const rawAns = String(row[5] || '').toUpperCase().trim();

      const validAns = ['A', 'B', 'C', 'D'].includes(rawAns) ? rawAns : 'A';
      const isVerified = ['A', 'B', 'C', 'D'].includes(rawAns);

      questions.push({
        id: `q_mc_excel_${Date.now()}_${i}`,
        type: 'multiple_choice',
        content: content || `Câu hỏi trắc nghiệm ${i}`,
        options: {
          A: optA,
          B: optB,
          C: optC,
          D: optD,
        },
        correctAnswer: validAns,
        answerDetectionMethod: isVerified ? 'explicit_answer' : 'admin_confirmed',
        verificationStatus: isVerified ? 'verified' : 'needs_review',
        detectionDetails: isVerified ? `Đọc từ cột đáp án đúng: ${validAns}` : 'Cần kiểm tra lại đáp án',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  const multipleChoiceCount = questions.filter((q) => q.type === 'multiple_choice').length;
  const trueFalseCount = questions.filter((q) => q.type === 'true_false').length;
  const verifiedCount = questions.filter((q) => q.verificationStatus === 'verified').length;
  const needsReviewCount = questions.filter((q) => q.verificationStatus === 'needs_review').length;

  return {
    total: questions.length,
    multipleChoiceCount,
    trueFalseCount,
    verifiedCount,
    needsReviewCount,
    questions,
  };
}

// -------------------------------------------------------------
// PLAIN TEXT PARSER
// -------------------------------------------------------------
export function parsePlainTextFile(text: string): ParsedQuestionResult {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const formattedParagraphs: FormattedParagraph[] = [];

  for (const block of paragraphs) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      formattedParagraphs.push({
        text: line,
        runs: [{ text: line, isRed: false, isUnderlined: false, isBold: false }],
        hasRed: false,
        hasUnderline: false,
      });
    }
  }

  return processFormattedParagraphs(formattedParagraphs);
}
