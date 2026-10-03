import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { Question } from '../types/quiz';

export const INITIAL_SEED_QUESTIONS: Question[] = [
  {
    id: 'seed_mc_1',
    type: 'multiple_choice',
    content: 'Thủ đô của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam là thành phố nào?',
    options: {
      A: 'Hà Nội',
      B: 'Đà Nẵng',
      C: 'Huế',
      D: 'TP. Hồ Chí Minh',
    },
    correctAnswer: 'A',
    answerDetectionMethod: 'red_text',
    verificationStatus: 'verified',
    detectionDetails: 'Nhận diện từ chữ màu đỏ (#FF0000) tại phương án A',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed_mc_2',
    type: 'multiple_choice',
    content: 'Công thức hóa học của phân tử nước là gì?',
    options: {
      A: 'CO₂',
      B: 'NaCl',
      C: 'H₂O',
      D: 'O₂',
    },
    correctAnswer: 'C',
    answerDetectionMethod: 'underline',
    verificationStatus: 'verified',
    detectionDetails: 'Nhận diện từ gạch chân tại phương án C',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed_mc_3',
    type: 'multiple_choice',
    content: 'Trong hệ Mặt Trời, hành tinh nào nằm gần Mặt Trời nhất?',
    options: {
      A: 'Sao Hỏa (Mars)',
      B: 'Sao Thủy (Mercury)',
      C: 'Sao Kim (Venus)',
      D: 'Trái Đất (Earth)',
    },
    correctAnswer: 'B',
    answerDetectionMethod: 'explicit_answer',
    verificationStatus: 'verified',
    detectionDetails: 'Nhận diện từ mục ghi rõ "Đáp án: B"',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed_mc_4',
    type: 'multiple_choice',
    content: 'Tác phẩm "Truyện Kiều" được sáng tác bởi đại thi hào nào của dân tộc Việt Nam?',
    options: {
      A: 'Nguyễn Du',
      B: 'Nguyễn Trãi',
      C: 'Hồ Xuân Hương',
      D: 'Đoàn Thị Điểm',
    },
    correctAnswer: 'A',
    answerDetectionMethod: 'red_text',
    verificationStatus: 'verified',
    detectionDetails: 'Nhận diện từ chữ màu đỏ (#C00000) tại phương án A',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed_mc_5',
    type: 'multiple_choice',
    content: 'Đỉnh núi Phan Xi Păng (Fansipan) được mệnh danh là "Nóc nhà Đông Dương" nằm ở tỉnh nào của Việt Nam?',
    options: {
      A: 'Hà Giang',
      B: 'Yên Bái',
      C: 'Lào Cai',
      D: 'Sơn La',
    },
    correctAnswer: 'C',
    answerDetectionMethod: 'red_text',
    verificationStatus: 'verified',
    detectionDetails: 'Nhận diện từ chữ màu đỏ tại phương án C',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed_mc_6',
    type: 'multiple_choice',
    content: 'Theo định luật II Newton trong Vật lý, công thức nào sau đây là chính xác?',
    options: {
      A: 'F = m / a',
      B: 'F = m · a',
      C: 'a = F · m',
      D: 'F = a / m',
    },
    correctAnswer: 'B',
    answerDetectionMethod: 'underline',
    verificationStatus: 'verified',
    detectionDetails: 'Nhận diện từ gạch chân tại phương án B',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed_tf_1',
    type: 'true_false',
    content: 'Xét tính đúng hoặc sai của các nhận định địa lý sau đây về đất nước Việt Nam:',
    statements: {
      a: 'Việt Nam nằm ở khu vực Đông Nam Á.',
      b: 'Thủ đô Hà Nội nằm ở miền Nam của Việt Nam.',
      c: 'Việt Nam có đường biên giới trên đất liền giáp với Trung Quốc.',
      d: 'Việt Nam là quốc gia nội địa, hoàn toàn không giáp biển.',
    },
    statementAnswers: {
      a: true,
      b: false,
      c: true,
      d: false,
    },
    answerDetectionMethod: 'explicit_answer',
    verificationStatus: 'verified',
    detectionDetails: 'Đã xác định đầy đủ đáp án cho 4 mệnh đề: a-Đ, b-S, c-Đ, d-S',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed_tf_2',
    type: 'true_false',
    content: 'Xét tính đúng hoặc sai của các phát biểu sau về khoa học máy tính và mạng Internet:',
    statements: {
      a: 'RAM là bộ nhớ tạm thời, dữ liệu sẽ mất khi tắt nguồn máy tính.',
      b: 'Giao thức HTTPS có tính bảo mật cao hơn HTTP nhờ mã hóa SSL/TLS.',
      c: 'Một byte trong máy tính tiêu chuẩn bao gồm 16 bit.',
      d: 'Hệ điều hành Linux là phần mềm mã nguồn mở.',
    },
    statementAnswers: {
      a: true,
      b: true,
      c: false,
      d: true,
    },
    answerDetectionMethod: 'explicit_answer',
    verificationStatus: 'verified',
    detectionDetails: 'Đã xác định đầy đủ đáp án cho 4 mệnh đề: a-Đ, b-Đ, c-S, d-Đ',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seed_mc_review_1',
    type: 'multiple_choice',
    content: 'Vận tốc của ánh sáng trong chân không xấp xỉ bằng bao nhiêu? [Ví dụ câu cần kiểm tra]',
    options: {
      A: '300.000 km/s',
      B: '150.000 km/s',
      C: '30.000 km/s',
      D: '3.000.000 km/s',
    },
    correctAnswer: 'A',
    answerDetectionMethod: 'explicit_answer',
    verificationStatus: 'needs_review',
    detectionDetails: 'Phát hiện mâu thuẫn: Thầy/Cô cần xác nhận đáp án trước khi xuất đề thi.',
    reviewReason: 'Mâu thuẫn: Trong văn bản ghi "Đáp án: B" nhưng phương án A lại được tô đỏ (#FF0000).',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper to create a realistic .docx with red text and underline XML runs for live testing!
export async function generateSampleDocx(): Promise<Blob> {
  const zip = new JSZip();

  // Standard Word document XML structure with runs containing <w:color w:val="FF0000"/> and <w:u w:val="single"/>
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <!-- Câu 1: Chữ màu đỏ tại đáp án A -->
    <w:p>
      <w:r><w:rPr><w:b/></w:rPr><w:t>Câu 1: Thủ đô của Việt Nam là?</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:color w:val="FF0000"/><w:b/></w:rPr><w:t>A. Hà Nội</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>B. Đà Nẵng</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>C. Huế</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>D. TP. Hồ Chí Minh</w:t></w:r>
    </w:p>

    <!-- Câu 2: Gạch chân tại đáp án C -->
    <w:p>
      <w:r><w:rPr><w:b/></w:rPr><w:t>Câu 2: Công thức hóa học của nước là gì?</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>A. CO2</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>B. NaCl</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:u w:val="single"/><w:b/></w:rPr><w:t>C. H2O</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>D. O2</w:t></w:r>
    </w:p>

    <!-- Câu 3: Mâu thuẫn (cần kiểm tra) -->
    <w:p>
      <w:r><w:rPr><w:b/></w:rPr><w:t>Câu 3: Đỉnh núi Fansipan nằm ở tỉnh nào?</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>A. Hà Giang</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>B. Yên Bái</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:rPr><w:color w:val="C00000"/></w:rPr><w:t>C. Lào Cai</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>D. Lai Châu</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>Đáp án: B</w:t></w:r>
    </w:p>

    <!-- Câu 4: Đúng / Sai đa mệnh đề -->
    <w:p>
      <w:r><w:rPr><w:b/></w:rPr><w:t>Câu 4: Xét tính đúng hoặc sai của các nhận định địa lý Việt Nam sau:</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>a. Việt Nam nằm ở Đông Nam Á. (Đúng)</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>b. Hà Nội nằm ở miền Nam Việt Nam. (Sai)</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>c. Việt Nam giáp Trung Quốc. (Đúng)</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>d. Việt Nam không giáp biển. (Sai)</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>Đáp án: a - Đúng, b - Sai, c - Đúng, d - Sai</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  zip.file('[Content_Types].xml', contentTypesXml);
  zip.file('_rels/.rels', relsXml);
  zip.file('word/document.xml', documentXml);

  return await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

// Generate sample Excel template
export function generateSampleExcel(): Blob {
  const wsData = [
    ['Nội dung câu hỏi', 'Phương án A / Mệnh đề a', 'Phương án B / Mệnh đề b', 'Phương án C / Mệnh đề c', 'Phương án D / Mệnh đề d', 'Đáp án đúng', 'Loại câu'],
    ['Thủ đô của Việt Nam là gì?', 'Hà Nội', 'Đà Nẵng', 'Huế', 'TP. Hồ Chí Minh', 'A', 'Trắc nghiệm'],
    ['Công thức hóa học của nước là gì?', 'CO2', 'NaCl', 'H2O', 'O2', 'C', 'Trắc nghiệm'],
    ['Hành tinh nào gần Mặt Trời nhất?', 'Sao Hỏa', 'Sao Thủy', 'Sao Kim', 'Trái Đất', 'B', 'Trắc nghiệm'],
    ['Xét tính đúng sai về địa lý Việt Nam:', 'Việt Nam ở Đông Nam Á', 'Hà Nội ở miền Nam', 'Việt Nam giáp Trung Quốc', 'Việt Nam không giáp biển', 'a:đ, b:s, c:đ, d:s', 'Đúng/Sai'],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'NganHangCauHoi');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
