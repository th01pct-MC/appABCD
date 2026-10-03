import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Layers, 
  School,
  X
} from 'lucide-react';
import { ClientQuizQuestion, StudentAnswerRecord } from '../types/quiz';
import { Timer } from './Timer';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { TrueFalseQuestion } from './TrueFalseQuestion';
import { QuestionNavigation } from './QuestionNavigation';
import { SubmitConfirmation } from './SubmitConfirmation';
import { StudentResult } from './StudentResult';
import { api } from '../services/api';

interface QuizPageProps {
  quiz: {
    id: string;
    title: string;
    teacherName: string;
    durationMinutes: number;
    warnTabSwitch: boolean;
    trackTabSwitchCount: boolean;
  };
  attemptId: string;
  questionList: ClientQuizQuestion[];
  studentName: string;
  studentClass: string;
  startedAt: string;
  logoUrl?: string;
  schoolName?: string;
  onReturnHome?: () => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({
  quiz,
  attemptId,
  questionList,
  studentName,
  studentClass,
  startedAt,
  logoUrl,
  schoolName,
  onReturnHome,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [qId: string]: StudentAnswerRecord }>({});
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [saveStatusMap, setSaveStatusMap] = useState<{ [qId: string]: 'saved' | 'saving' | 'error' }>({});
  
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);

  // Anti-cheat tab tracking
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);

  // Autosave local cache recovery
  const localCacheKey = `attempt_${attemptId}_answers`;

  useEffect(() => {
    // Restore from localStorage if present
    const cached = localStorage.getItem(localCacheKey);
    if (cached) {
      try {
        setAnswers(JSON.parse(cached));
      } catch (e) {
        console.error('Error reading local cache:', e);
      }
    }
  }, [localCacheKey]);

  // Tab switch listener
  useEffect(() => {
    if (!quiz.warnTabSwitch && !quiz.trackTabSwitchCount) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !submissionResult) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          api.trackTabSwitch(attemptId);
          if (quiz.warnTabSwitch) {
            setShowTabWarning(true);
          }
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [quiz.warnTabSwitch, quiz.trackTabSwitchCount, attemptId, submissionResult]);

  // Current Question
  const currentQuestion = questionList[currentIndex];

  // Helper to check if question has been answered
  const isQuestionAnswered = (q: ClientQuizQuestion) => {
    const ans = answers[q.id];
    if (!ans) return false;
    if (q.type === 'multiple_choice') {
      return Boolean(ans.selectedAnswer);
    } else {
      const stmtKeys = Object.keys(q.statements || {});
      const userStmts = ans.statementAnswers || {};
      return stmtKeys.length > 0 && stmtKeys.every((k) => userStmts[k] !== undefined);
    }
  };

  const unansweredCount = questionList.length - questionList.filter(isQuestionAnswered).length;

  // Handle student selecting MC option
  // CRITICAL REQUIREMENT: Backend evaluates & saves immediately
  const handleSelectMcAnswer = async (selectedOption: string) => {
    if (!currentQuestion) return;

    const qId = currentQuestion.id;
    const newRecord: StudentAnswerRecord = {
      questionId: qId,
      questionType: 'multiple_choice',
      selectedAnswer: selectedOption,
      answeredAt: new Date().toISOString(),
    };

    // Update local state immediately
    const nextAnswers = { ...answers, [qId]: newRecord };
    setAnswers(nextAnswers);
    localStorage.setItem(localCacheKey, JSON.stringify(nextAnswers));
    setSaveStatusMap((prev) => ({ ...prev, [qId]: 'saving' }));

    // Send to backend for instant grading & autosave
    try {
      await api.submitAnswer({
        attemptId,
        questionId: qId,
        selectedAnswer: selectedOption,
      });
      setSaveStatusMap((prev) => ({ ...prev, [qId]: 'saved' }));
    } catch (err) {
      console.error('Lỗi autosave:', err);
      setSaveStatusMap((prev) => ({ ...prev, [qId]: 'error' }));
    }
  };

  // Handle student selecting True/False for a statement
  const handleSelectStatementAnswer = async (stmtKey: string, value: boolean) => {
    if (!currentQuestion) return;

    const qId = currentQuestion.id;
    const currentStmtAnswers = answers[qId]?.statementAnswers || {};
    const updatedStmtAnswers = {
      ...currentStmtAnswers,
      [stmtKey]: value,
    };

    const newRecord: StudentAnswerRecord = {
      questionId: qId,
      questionType: 'true_false',
      statementAnswers: updatedStmtAnswers,
      answeredAt: new Date().toISOString(),
    };

    const nextAnswers = { ...answers, [qId]: newRecord };
    setAnswers(nextAnswers);
    localStorage.setItem(localCacheKey, JSON.stringify(nextAnswers));
    setSaveStatusMap((prev) => ({ ...prev, [qId]: 'saving' }));

    // Send to backend for instant statement grading & autosave
    try {
      await api.submitAnswer({
        attemptId,
        questionId: qId,
        statementAnswers: updatedStmtAnswers,
      });
      setSaveStatusMap((prev) => ({ ...prev, [qId]: 'saved' }));
    } catch (err) {
      console.error('Lỗi autosave:', err);
      setSaveStatusMap((prev) => ({ ...prev, [qId]: 'error' }));
    }
  };

  // Toggle flag
  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    const qId = currentQuestion.id;
    setFlaggedIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
      } else {
        next.add(qId);
      }
      return next;
    });
  };

  // Handle Final Submission (either manual or timer expiry)
  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.submitQuiz(attemptId);
      localStorage.removeItem(localCacheKey);
      setSubmissionResult(response.result);
      setIsSubmitModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi nộp bài');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If test has already been submitted, render result page
  if (submissionResult) {
    return (
      <StudentResult
        result={submissionResult}
        logoUrl={logoUrl}
        teacherName={quiz.teacherName}
        schoolName={schoolName}
        onReturnHome={onReturnHome}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Sticky Header (Section 13) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Quiz Info */}
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="w-10 h-10 object-contain rounded-xl p-1 bg-white border border-slate-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                <School className="w-5 h-5" />
              </div>
            )}
            <div>
              <h1 className="text-xs sm:text-sm font-extrabold text-slate-800 leading-tight truncate max-w-xs sm:max-w-md">
                {quiz.title}
              </h1>
              <div className="text-[11px] text-slate-500 font-medium">
                {studentName} &bull; Lớp <strong className="text-slate-700">{studentClass}</strong>
              </div>
            </div>
          </div>

          {/* Timer & Submit CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Timer
              initialMinutes={quiz.durationMinutes}
              startedAt={startedAt}
              onTimeUp={() => {
                // Auto-submit when time is up
                handleSubmitQuiz();
              }}
            />

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">NỘP BÀI</span>
              <span className="sm:hidden">Nộp</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tab Switch Warning Modal */}
      {showTabWarning && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-amber-300 text-center animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Cảnh báo: Bạn vừa rời khỏi màn hình làm bài!
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Hệ thống đã ghi nhận <strong>{tabSwitchCount}</strong> lần bạn chuyển tab hoặc rời ứng dụng. Hành vi này sẽ được lưu vào biên bản nộp bài của giáo viên.
            </p>
            <button
              type="button"
              onClick={() => setShowTabWarning(false)}
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer"
            >
              Tôi Đã Hiểu, Quay Lại Làm Bài
            </button>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Current Question */}
        <div className="lg:col-span-8 space-y-4">
          {currentQuestion && (
            <>
              {currentQuestion.type === 'multiple_choice' ? (
                <MultipleChoiceQuestion
                  question={currentQuestion}
                  questionIndex={currentIndex}
                  totalQuestions={questionList.length}
                  selectedAnswer={answers[currentQuestion.id]?.selectedAnswer}
                  isFlagged={flaggedIds.has(currentQuestion.id)}
                  onSelectAnswer={handleSelectMcAnswer}
                  onToggleFlag={handleToggleFlag}
                  saveStatus={saveStatusMap[currentQuestion.id] || 'saved'}
                />
              ) : (
                <TrueFalseQuestion
                  question={currentQuestion}
                  questionIndex={currentIndex}
                  totalQuestions={questionList.length}
                  statementAnswers={answers[currentQuestion.id]?.statementAnswers}
                  isFlagged={flaggedIds.has(currentQuestion.id)}
                  onSelectStatementAnswer={handleSelectStatementAnswer}
                  onToggleFlag={handleToggleFlag}
                  saveStatus={saveStatusMap[currentQuestion.id] || 'saved'}
                />
              )}

              {/* Prev / Next controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-bold text-xs transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Câu trước</span>
                </button>

                <div className="text-xs font-semibold text-slate-500">
                  Câu {currentIndex + 1} / {questionList.length}
                </div>

                {currentIndex < questionList.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => Math.min(questionList.length - 1, prev + 1))}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                  >
                    <span>Câu tiếp theo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>NỘP BÀI THI</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Column: Navigation Grid */}
        <aside className="lg:col-span-4 sticky top-20">
          <QuestionNavigation
            questions={questionList}
            currentIndex={currentIndex}
            answers={answers}
            flaggedQuestionIds={flaggedIds}
            onSelectIndex={(index) => setCurrentIndex(index)}
          />

          <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2">
            <div className="font-bold text-slate-700">Thông tin bài làm:</div>
            <div className="text-slate-600 flex justify-between">
              <span>Học sinh:</span>
              <strong className="text-slate-900">{studentName}</strong>
            </div>
            <div className="text-slate-600 flex justify-between">
              <span>Lớp:</span>
              <strong className="text-slate-900">{studentClass}</strong>
            </div>
            <div className="text-slate-600 flex justify-between">
              <span>Số câu chưa trả lời:</span>
              <strong className={unansweredCount > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                {unansweredCount} câu
              </strong>
            </div>
          </div>
        </aside>
      </main>

      {/* Submit Confirmation Modal */}
      <SubmitConfirmation
        isOpen={isSubmitModalOpen}
        unansweredCount={unansweredCount}
        totalQuestions={questionList.length}
        isSubmitting={isSubmitting}
        onCancel={() => setIsSubmitModalOpen(false)}
        onConfirm={handleSubmitQuiz}
      />
    </div>
  );
};
