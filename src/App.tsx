import React, { useState, useEffect, useRef } from "react";
import { 
  PLACEMENT_QUESTIONS, 
  SUBJECTS_LIST 
} from "./questions";
import { 
  Question, 
  QuizMode, 
  Subject, 
  UserStats 
} from "./types";
import { 
  Database, 
  Cpu, 
  Network, 
  Binary, 
  GraduationCap, 
  Puzzle, 
  Play, 
  Check, 
  X, 
  ChevronRight, 
  RotateCcw, 
  Award, 
  Clock, 
  BookOpen, 
  AlertTriangle, 
  Lightbulb, 
  Sparkles, 
  Layers, 
  Code2,
  BookMarked,
  TrendingUp,
  BrainCircuit,
  CornerDownRight,
  ChevronLeft
} from "lucide-react";

// Helper function to render styled code lines
const CodeHighlighter: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const highlightLine = (line: string) => {
    // Basic C++, Java, and SQL token highlight
    let formatted = line;

    // Comments
    if (line.trim().startsWith("//") || line.trim().startsWith("--") || line.trim().startsWith("#")) {
      return <span className="text-emerald-500 italic">{line}</span>;
    }

    // SQL Highlighting
    if (language === "sql") {
      formatted = line
        .replace(/\b(SELECT|FROM|WHERE|GROUP BY|HAVING|COUNT)\b/g, '<span class="text-cyan-400 font-semibold">$1</span>')
        .replace(/\b(employees)\b/g, '<span class="text-amber-300">$1</span>')
        .replace(/\b(\d+)\b/g, '<span class="text-purple-400">$1</span>');
    } 
    // Java & C++ Highlighting
    else {
      formatted = line
        .replace(/\b(int|void|class|new|if|else|for|return)\b/g, '<span class="text-[#00f0ff] font-semibold">$1</span>')
        .replace(/\b(System\.out\.println|max)\b/g, '<span class="text-teal-400 font-medium">$1</span>')
        .replace(/\b(\d+)\b/g, '<span class="text-[#d896ff]">$1</span>')
        .replace(/(["'].*?["'])/g, '<span class="text-green-300">$1</span>');
    }

    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <div className="w-full bg-[#050915] text-[#e2e8f0] p-4 rounded-xl border border-blue-900/30 overflow-x-auto text-[13px] leading-relaxed font-mono relative group">
      {/* Visual window buttons */}
      <div className="absolute top-3 right-3 flex space-x-1.5 opacity-60">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
      </div>
      <div className="text-right text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2 pb-1 border-b border-slate-900">
        {language || "source"} Code
      </div>
      <table className="w-full border-collapse">
        <tbody>
          {code.split("\n").map((line, idx) => (
            <tr key={idx} className="hover:bg-slate-900/35 transition-colors">
              <td className="w-8 pr-3 text-right text-slate-600 font-mono text-[11px] select-none border-r border-slate-900">
                {idx + 1}
              </td>
              <td className="pl-4 font-mono whitespace-pre text-left">
                {highlightLine(line)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function App() {
  // --- States ---
  const [screen, setScreen] = useState<"welcome" | "quiz" | "results">("welcome");
  const [quizMode, setQuizMode] = useState<QuizMode>("mock");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");
  const [quizLength, setQuizLength] = useState<number>(10);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  
  // Practice Mode interactive states
  const [practiceAnswered, setPracticeAnswered] = useState<boolean>(false);
  const [tempPracticeSelection, setTempPracticeSelection] = useState<number | null>(null);

  // Timer states (Signature component is timed per question in Mock Exam Mode)
  const [timerLeft, setTimerLeft] = useState<number>(25); // 25s per question
  const [timerPulse, setTimerPulse] = useState<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const SECONDS_PER_QUESTION = 25;

  // Local storage statistics
  const [userStats, setUserStats] = useState<UserStats>({
    completedQuizzes: 0,
    totalQuestionsAnswered: 0,
    overallAccuracy: 80, // initial default placeholder representing basic benchmarks
    subjectScores: {},
    mockHighScore: 0,
    perfectScores: 0
  });

  // Mistakes Only helper state (Revision session)
  const [isRevisionSession, setIsRevisionSession] = useState<boolean>(false);
  const [pastMistakesIds, setPastMistakesIds] = useState<number[]>([]);

  // Load stats from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("placement_quiz_stats");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserStats(parsed);
      } catch (e) {
        console.error("Error parsing statistics", e);
      }
    }
  }, []);

  // Timer effect for Mock Mode
  useEffect(() => {
    if (screen === "quiz" && quizMode === "mock") {
      // Clear any older timers
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      
      setTimerLeft(SECONDS_PER_QUESTION);
      setTimerPulse(false);

      timerIntervalRef.current = setInterval(() => {
        setTimerLeft((prev) => {
          if (prev <= 1) {
            handleTimeOut();
            return 0;
          }
          if (prev <= 6) {
            setTimerPulse(t => !t);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [screen, currentQuestionIdx, quizMode]);

  // Handle Mock Mode timeout for current question
  const handleTimeOut = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    // Auto-record unanswered (-1)
    const currentQuestion = selectedQuestions[currentQuestionIdx];
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: -1
    }));

    // Proceed to next or submit
    setTimeout(() => {
      if (currentQuestionIdx < selectedQuestions.length - 1) {
        setCurrentQuestionIdx(idx => idx + 1);
      } else {
        handleFinishQuiz({
          ...userAnswers,
          [currentQuestion.id]: -1
        });
      }
    }, 1200);
  };

  // Fisher-Yates shuffle helper
  const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Start standard quiz
  const handleStartQuiz = (customFilteredQuestions?: Question[], revisionLabel: boolean = false) => {
    let sourceQuestions = PLACEMENT_QUESTIONS;
    
    // If it's a specific subject
    if (customFilteredQuestions) {
      sourceQuestions = customFilteredQuestions;
    } else if (selectedSubjectId !== "all") {
      sourceQuestions = PLACEMENT_QUESTIONS.filter(q => q.subject === selectedSubjectId);
    }

    // Shuffle questions
    const shuffled = shuffleArray(sourceQuestions);
    // Limit to choice length
    const limit = Math.min(shuffled.length, quizLength);
    const finalSet = shuffled.slice(0, limit);

    setSelectedQuestions(finalSet);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setPracticeAnswered(false);
    setTempPracticeSelection(null);
    setIsRevisionSession(revisionLabel);
    setScreen("quiz");
  };

  // Triggered when revision session is launched
  const handleStartRevisionOfMistakes = (missedIds: number[]) => {
    const missedQuestions = PLACEMENT_QUESTIONS.filter(q => missedIds.includes(q.id));
    if (missedQuestions.length === 0) return;
    
    setSelectedQuestions(missedQuestions);
    setQuizLength(missedQuestions.length);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setPracticeAnswered(false);
    setTempPracticeSelection(null);
    setIsRevisionSession(true);
    setScreen("quiz");
  };

  // Handle choice selection
  const handleSelectOption = (optionIndex: number) => {
    const currentQuestion = selectedQuestions[currentQuestionIdx];

    if (quizMode === "practice") {
      if (practiceAnswered) return; // cannot change after reveal
      setTempPracticeSelection(optionIndex);
      setPracticeAnswered(true);
      setUserAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: optionIndex
      }));
    } else {
      // Mock Exam Mode simply sets dynamic selection
      setUserAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: optionIndex
      }));
    }
  };

  // Move to next question or end
  const handleNextQuestion = () => {
    setPracticeAnswered(false);
    setTempPracticeSelection(null);

    if (currentQuestionIdx < selectedQuestions.length - 1) {
      setCurrentQuestionIdx(idx => idx + 1);
    } else {
      handleFinishQuiz(userAnswers);
    }
  };

  // Finalize stats computation and wrap up
  const handleFinishQuiz = (finalAnswers: Record<number, number>) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    // Calculate score
    let correctCount = 0;
    const subjectBreakdown: Record<string, { correct: number; total: number }> = {};

    selectedQuestions.forEach((q) => {
      const ans = finalAnswers[q.id];
      const isCorrect = ans === q.correctOptionIndex;
      
      if (isCorrect) {
        correctCount++;
      }

      // Track by subject
      if (!subjectBreakdown[q.subject]) {
        subjectBreakdown[q.subject] = { correct: 0, total: 0 };
      }
      subjectBreakdown[q.subject].total += 1;
      if (isCorrect) {
        subjectBreakdown[q.subject].correct += 1;
      }
    });

    const finalPct = Math.round((correctCount / selectedQuestions.length) * 100);

    // Update user stats in localStorage
    const workingStats = { ...userStats };
    workingStats.completedQuizzes += 1;
    workingStats.totalQuestionsAnswered += selectedQuestions.length;
    
    // Accumulate total calculations
    const curPerfect = finalPct === 100 ? 1 : 0;
    workingStats.perfectScores = (workingStats.perfectScores || 0) + curPerfect;

    if (quizMode === "mock" && finalPct > workingStats.mockHighScore) {
      workingStats.mockHighScore = finalPct;
    }

    // Merge subject level history
    selectedQuestions.forEach((q) => {
      const isAnsCorrect = finalAnswers[q.id] === q.correctOptionIndex;
      if (!workingStats.subjectScores) workingStats.subjectScores = {};
      if (!workingStats.subjectScores[q.subject]) {
        workingStats.subjectScores[q.subject] = { correct: 0, total: 0 };
      }
      workingStats.subjectScores[q.subject].total += 1;
      if (isAnsCorrect) {
        workingStats.subjectScores[q.subject].correct += 1;
      }
    });

    // Compute aggregate ratio for historical accuracy representation
    let totalCorrectPast = 0;
    let totalTotalPast = 0;
    Object.values(workingStats.subjectScores).forEach((item) => {
      totalCorrectPast += item.correct;
      totalTotalPast += item.total;
    });
    if (totalTotalPast > 0) {
      workingStats.overallAccuracy = Math.round((totalCorrectPast / totalTotalPast) * 100);
    }

    localStorage.setItem("placement_quiz_stats", JSON.stringify(workingStats));
    setUserStats(workingStats);
    setScreen("results");
  };

  // Return to selecting state cleanly
  const handleResetToDashboard = () => {
    setScreen("welcome");
    setIsRevisionSession(false);
  };

  // Subject icon helper mapping
  const renderSubjectIcon = (iconName: string, sizeClass = "w-5 h-5") => {
    switch (iconName) {
      case "Binary": return <Binary className={`${sizeClass} text-[#00f0ff]`} />;
      case "Cpu": return <Cpu className={`${sizeClass} text-[#00f0ff]`} />;
      case "Database": return <Database className={`${sizeClass} text-[#00f0ff]`} />;
      case "Network": return <Network className={`${sizeClass} text-[#00f0ff]`} />;
      case "Puzzle": return <Puzzle className={`${sizeClass} text-[#00f0ff]`} />;
      case "GraduationCap": return <GraduationCap className={`${sizeClass} text-[#00f0ff]`} />;
      default: return <BookOpen className={`${sizeClass} text-blue-400`} />;
    }
  };

  // Compute stats diagnostic feedback
  const getFeedbackCategory = (pct: number) => {
    if (pct >= 90) return {
      title: "PREMIUM GRADE — FAANG CAPABLE",
      color: "text-green-400 border-green-500/30 bg-green-950/20",
      icon: <Sparkles className="w-6 h-6 text-green-400" />,
      desc: "Outstanding performance! Your cognitive accuracy, network protocol understanding, and sorting limits bounds are at master tier. Highly qualified for premium product-based profiles."
    };
    if (pct >= 75) return {
      title: "TIER-1 PRODUCT CORE",
      color: "text-blue-400 border-blue-500/30 bg-blue-950/20",
      icon: <Award className="w-6 h-6 text-blue-400" />,
      desc: "Excellent capability. Solid comprehension on design principles, OS scheduling, and queries. Keep practicing hard to fully secure high level recruitment packages."
    };
    if (pct >= 50) return {
      title: "TECH SYSTEM ASSOCIATE LEVEL",
      color: "text-yellow-400 border-yellow-500/30 bg-yellow-950/20",
      icon: <TrendingUp className="w-6 h-6 text-yellow-400" />,
      desc: "Healthy awareness, but gaps in virtual scheduling or complex dynamic state arrays can reduce success. Revise and double click error explanations to level up."
    };
    return {
      title: "CS TRAINEE DEVELOPMENT STAGE",
      color: "text-red-400 border-red-500/30 bg-red-950/20",
      icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
      desc: "Steady progress! Computer science frameworks can feel dense. We recommend playing in Practice Mode to view immediate reasoning guides for each scenario."
    };
  };

  // Questions answered details for mistakes analysis
  const missedQuestionsListSet = selectedQuestions.filter(
    q => userAnswers[q.id] !== q.correctOptionIndex
  );

  return (
    <div id="quiz-root-wrapper" className="min-h-screen bg-[#070b19] font-sans text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {/* Dynamic Grid Pattern Header background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(15,32,100,0.35),rgba(0,0,0,0))] pointer-events-none" />

      {/* Modern High-End Floating Navbar */}
      <nav id="app-navbar" className="relative z-20 border-b border-blue-900/30 bg-slate-950/80 backdrop-blur-md px-4 py-3.5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-mono text-xs text-[#00f0ff] uppercase tracking-widest block font-bold leading-none">PLACEMENT SUITE</span>
              <span className="font-sans font-extrabold text-white text-lg tracking-tight">CS & Tech Accelerator</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-slate-900/60 border border-blue-900/50 rounded-lg px-3 py-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono text-slate-400 font-medium">SERVER LINK STABLE</span>
            </div>
            
            {screen !== "welcome" && (
              <button 
                onClick={handleResetToDashboard}
                className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-blue-900/30 hover:border-blue-500/40 rounded-lg px-3 py-1.5 text-xs font-mono transition-all flex items-center"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> EXIT
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT STALKER WITH BOUNDS */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8 relative z-10 flex flex-col justify-center">
        
        {/* =========================================================================
             1. WELCOME / DASHBOARD SCEEN
           ========================================================================= */}
        {screen === "welcome" && (
          <div id="welcome-container" className="space-y-8 animate-fade-in">
            
            {/* Header Showcase Banner */}
            <div className="text-center md:text-left md:flex md:items-center md:justify-between bg-gradient-to-br from-[#0c1432] via-[#091026] to-[#040818] rounded-3xl p-6 md:p-10 border border-blue-900/40 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-4 md:max-w-2xl relative z-10">
                <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950 text-[#00f0ff] bg-opacity-60 border border-blue-800/40 font-mono text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-[#00f0ff]" />
                  <span>2026 Core Syllabus Ready</span>
                </span>
                <h1 className="text-3xl md:text-5xl font-black text-white leading-none tracking-tight">
                  Accelerate Your Tech <br />
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-[#00f0ff] bg-clip-text text-transparent">
                    Placement Assessment
                  </span>
                </h1>
                <p className="text-slate-400 font-sans text-sm md:text-base leading-relaxed">
                  Engineered specifically for engineering graduates and placement candidates aiming for senior engineering roles. Sharpen your knowledge with real evaluation standards.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="flex items-center space-x-2 font-mono text-xs text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-blue-950">
                    <span className="text-[#00f0ff] font-bold">25s</span> <span>circular clock duration</span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono text-xs text-slate-400 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-blue-950">
                    <span className="text-[#00f0ff] font-bold">5</span> <span>placement domains</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 md:mt-0 p-6 bg-slate-950/70 border border-blue-900/40 rounded-2xl md:w-80 space-y-4 shadow-xl">
                <h3 className="font-mono text-slate-300 text-xs font-bold tracking-wider uppercase border-b border-blue-950 pb-2">
                  YOUR COMPILATION TRACKER
                </h3>
                
                <div id="stats-summary-panel" className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0b1022] p-2.5 rounded-lg border border-blue-950 text-center">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Quizzes Done</span>
                    <span className="font-mono text-xl text-white font-bold leading-none">{userStats.completedQuizzes}</span>
                  </div>
                  <div className="bg-[#0b1022] p-2.5 rounded-lg border border-blue-950 text-center">
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">Accuracy</span>
                    <span className="font-mono text-xl text-[#00f0ff] font-bold leading-none">{userStats.overallAccuracy}%</span>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-400">Mock High-score</span>
                    <span className="text-white font-bold">{userStats.mockHighScore || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5">
                    <div 
                      className="bg-[#00f0ff] h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${userStats.mockHighScore || 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400">Perfect Clears</span>
                  <span className="text-yellow-400 font-bold">{userStats.perfectScores || 0} ✨</span>
                </div>
              </div>
            </div>

            {/* Quiz Setup Controls (Mode, Size, Subject) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Subject Choices Grid */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Select Placement Domain</h2>
                    <p className="text-xs text-slate-400">Target a single CS topic or run a combined Mock Exam across all domains.</p>
                  </div>
                  
                  {/* Slider configuration for quiz length */}
                  <div className="flex items-center space-x-3 bg-slate-900/50 border border-blue-900/30 rounded-xl px-4 py-2 w-full sm:w-auto">
                    <span className="font-mono text-xs text-slate-400 whitespace-nowrap">SIZE: <span className="text-[#00f0ff] font-bold font-mono text-sm">{quizLength}</span> Qs</span>
                    <input 
                      type="range" 
                      min="5" 
                      max="20" 
                      step="5" 
                      value={quizLength} 
                      onChange={(e) => setQuizLength(Number(e.target.value))}
                      className="w-24 accent-[#00f0ff] cursor-ew-resize h-1 bg-blue-950 rounded-lg appearance-none"
                    />
                  </div>
                </div>

                <div id="subject-cards-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SUBJECTS_LIST.map((subject) => {
                    const isSelected = selectedSubjectId === subject.id;
                    return (
                      <button
                        key={subject.id}
                        id={`subject-card-${subject.id}`}
                        onClick={() => setSelectedSubjectId(subject.id)}
                        className={`text-left p-5 rounded-2xl border transition-all relative overflow-hidden group ${
                          isSelected 
                            ? "bg-slate-900/70 border-[#00f0ff] ring-1 ring-[#00f0ff]/30 shadow-[0_0_20px_rgba(0,240,255,0.06)]" 
                            : "bg-[#0b1022]/45 border-blue-900/30 hover:border-blue-500/40 hover:bg-[#0d152d]"
                        }`}
                      >
                        {/* Selected accent blur */}
                        {isSelected && (
                          <div className="absolute -top-3 -right-3 w-12 h-12 bg-[#00f0ff]/10 rounded-full blur-xl" />
                        )}
                        
                        <div className="flex items-start space-x-4">
                          <div className={`p-2.5 rounded-xl ${isSelected ? "bg-blue-950 border border-[#00f0ff]/50" : "bg-slate-900 border border-blue-900/40"} group-hover:scale-110 transition-transform`}>
                            {renderSubjectIcon(subject.icon, "w-6 h-6")}
                          </div>
                          
                          <div className="space-y-1">
                            <h3 className="font-bold text-white text-sm group-hover:text-[#00f0ff] transition-colors">{subject.name}</h3>
                            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{subject.description}</p>
                            
                            <div className="flex items-center space-x-3 pt-2 font-mono text-[10px]">
                              <span className="text-slate-500">POOL: <span className="text-slate-300 font-bold font-mono">{subject.questionCount} Qs</span></span>
                              <span className="text-slate-600">•</span>
                              <span className="text-slate-500">FOCUS: <span className="text-cyan-400 font-bold font-mono">{subject.featuredTopic}</span></span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Mode Choice & Fire Launch Button */}
              <div id="mode-launch-control-panel" className="lg:col-span-4 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Choose Evaluation Mode</h2>
                  <p className="text-xs text-slate-400">Different constraints tailored for education and testing.</p>
                </div>

                <div className="bg-[#0b1022]/65 border border-blue-900/40 rounded-3xl p-6 space-y-6 shadow-xl">
                  {/* Mode Selector Buttons */}
                  <div className="flex grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-blue-950">
                    <button
                      id="mode-toggle-mock"
                      onClick={() => setQuizMode("mock")}
                      className={`py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase font-mono transition-all flex flex-col justify-center items-center gap-1 ${
                        quizMode === "mock"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>Mock Exam</span>
                    </button>
                    <button
                      id="mode-toggle-practice"
                      onClick={() => setQuizMode("practice")}
                      className={`py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase font-mono transition-all flex flex-col justify-center items-center gap-1 ${
                        quizMode === "practice"
                          ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Practice</span>
                    </button>
                  </div>

                  {/* Mode Info Description */}
                  <div className="min-h-[140px] bg-slate-950/50 rounded-2xl p-4 border border-blue-950 flex flex-col justify-between text-xs space-y-3">
                    {quizMode === "mock" ? (
                      <>
                        <div id="mode-desc-mock" className="space-y-2">
                          <div className="flex items-center space-x-2 text-[#00f0ff] font-bold">
                            <Clock className="w-4 h-4" />
                            <span className="font-mono tracking-wider">MOCK RULES: STRICT TIMER</span>
                          </div>
                          <p className="text-slate-400 leading-normal font-sans">
                            Each question has an individual <strong>25-second animated circular timer</strong> limit. If the countdown runs out, the test proceeds automatically. Answers are locked instantly and revealed only in the diagnostic breakdown at the end.
                          </p>
                        </div>
                        <div className="text-[10px] text-yellow-500 font-mono flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> High Placement Relevance
                        </div>
                      </>
                    ) : (
                      <>
                        <div id="mode-desc-practice" className="space-y-2">
                          <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                            <BookOpen className="w-4 h-4" />
                            <span className="font-mono tracking-wider">PRACTICE RULES: GUIDED LEARN</span>
                          </div>
                          <p className="text-slate-400 leading-normal font-sans">
                            No timer constraints! Choose answers and get <strong>immediate validation feedback and complete structured code explanations</strong>. Excellent mode to review database normalization logic, operating system paging equations, and recursive code routes.
                          </p>
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5" /> Uncapped preparation helper
                        </div>
                      </>
                    )}
                  </div>

                  {/* Ready Launch Trigger Button */}
                  <button
                    id="launch-quiz-button"
                    onClick={() => handleStartQuiz()}
                    className="w-full bg-gradient-to-r from-blue-600 via-[#0066ff] to-[#00f0ff] hover:brightness-110 active:scale-95 text-white py-4 rounded-xl font-mono text-sm font-bold tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(0,102,255,0.4)] flex items-center justify-center space-x-2 group cursor-pointer"
                  >
                    <span>START RUNNING ENGINE</span>
                    <Play className="w-4 h-4 fill-white group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Small notice about stored history */}
                  <p className="text-center text-[10px] text-slate-500 font-mono uppercase">
                    Stored locally against assessment models
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}


        {/* =========================================================================
             2. ACTIVE QUIZ PLAY SCREEN
           ========================================================================= */}
        {screen === "quiz" && selectedQuestions.length > 0 && (
          <div id="quiz-playing-module" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in relative z-10">
            
            {/* Left Content Column (Main Question & Code & Options) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* === BOLD CONSTRAINT: THE PROGRESS BAR IS THE BACKGROUND OF THE HEADER === */}
              {(() => {
                const totalQ = selectedQuestions.length;
                const progressPct = ((currentQuestionIdx + 1) / totalQ) * 100;
                const currentQuestion = selectedQuestions[currentQuestionIdx];
                
                return (
                  <div 
                    id="header-integrated-progress-container"
                    className="relative w-full rounded-2xl overflow-hidden bg-slate-950/70 border border-blue-900/50 shadow-lg"
                  >
                    {/* The Background progress bar (the actual background of header) */}
                    <div 
                      id="header-background-progress-bar"
                      className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-950/90 via-blue-900/40 to-blue-500/20 border-r-2 border-[#00f0ff] transition-all duration-500 ease-out z-0"
                      style={{ width: `${progressPct}%` }}
                    />
                    
                    {/* An extra bright electric trace gradient leading edge */}
                    <div 
                      className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-[#00f0ff]/30 blur-[4px] transition-all duration-500 ease-out z-0"
                      style={{ left: `calc(${progressPct}% - 32px)` }}
                    />

                    {/* Header contents laid above background */}
                    <div className="relative z-10 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      
                      {/* Left: Category and Subject Metadata */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-950/80 border border-blue-900/60 text-[#00f0ff] font-bold">
                            {currentQuestion.subject}
                          </span>
                          <span className="text-slate-400 text-xs font-mono">
                            {currentQuestion.topic}
                          </span>
                        </div>
                        <h4 className="font-sans font-extrabold text-white text-base">
                          {isRevisionSession ? "System Revision Run" : `${selectedSubjectId === "all" ? "Placement Mock Simulation" : currentQuestion.subject}`}
                        </h4>
                      </div>

                      {/* Right: IBM Plex Mono Question Number Indicator */}
                      <div className="flex flex-row sm:flex-col items-baseline sm:items-end space-x-2 sm:space-x-0">
                        <span className="font-mono text-xs text-slate-400 font-medium">QUESTION INDEX</span>
                        <div className="font-mono text-2xl font-bold tracking-tight text-white leading-none">
                          <span className="text-[#00f0ff]">{String(currentQuestionIdx + 1).padStart(2, "0")}</span>
                          <span className="text-slate-600"> / </span>
                          <span className="text-slate-400">{String(totalQ).padStart(2, "0")}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* Main Card with Question Text & Optional Code & Options */}
              <div className="bg-[#0b1022]/60 border border-blue-900/40 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-sm">
                
                {/* Visual grid accent */}
                <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none" />

                {/* Difficulty Ribbon Indicator */}
                <div className="flex justify-between items-center relative z-10">
                  <span className="inline-flex items-center space-x-1.5 font-mono text-xs text-slate-400">
                    <span className="text-blue-500">◆</span>
                    <span>Single Option Correct</span>
                  </span>

                  {(() => {
                    const diff = selectedQuestions[currentQuestionIdx].difficulty;
                    let color = "text-green-400 bg-green-950/40 border-green-900/50";
                    if (diff === "Medium") color = "text-yellow-400 bg-yellow-950/40 border-yellow-900/50";
                    if (diff === "Hard") color = "text-red-400 bg-red-950/40 border-red-900/50";
                    return (
                      <span className={`font-mono text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border ${color}`}>
                        {diff} LEVEL
                      </span>
                    );
                  })()}
                </div>

                {/* Question text */}
                <h2 className="text-slate-100 font-sans text-base md:text-xl font-bold leading-snug relative z-10">
                  {selectedQuestions[currentQuestionIdx].questionText}
                </h2>

                {/* Optional code snippet container block */}
                {selectedQuestions[currentQuestionIdx].codeSnippet && (
                  <CodeHighlighter 
                    code={selectedQuestions[currentQuestionIdx].codeSnippet || ""} 
                    language={selectedQuestions[currentQuestionIdx].language || "cpp"} 
                  />
                )}

                {/* Options List */}
                <div id="quiz-options-set" className="space-y-3 relative z-10">
                  {selectedQuestions[currentQuestionIdx].options.map((option, idx) => {
                    const questionId = selectedQuestions[currentQuestionIdx].id;
                    const correctIdx = selectedQuestions[currentQuestionIdx].correctOptionIndex;
                    const userSelectedIdx = userAnswers[questionId];
                    
                    // State determination based on evaluation rules:
                    const isAnswerSelected = userSelectedIdx !== undefined && userSelectedIdx !== -1;
                    const thisOptionSelected = userSelectedIdx === idx;
                    
                    let cardBorderClass = "border-blue-900/30 hover:border-blue-500/40 hover:bg-[#0c1532]/40";
                    let cardBgClass = "bg-slate-950/30";
                    let statusIcon = null;

                    if (quizMode === "practice") {
                      // Immediate feedback style
                      if (practiceAnswered) {
                        if (idx === correctIdx) {
                          // Correct Answer Option
                          cardBorderClass = "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] bg-emerald-950/30";
                          cardBgClass = "bg-emerald-950/20";
                          statusIcon = <Check className="w-4 h-4 text-emerald-400" />;
                        } else if (thisOptionSelected && idx !== correctIdx) {
                          // User selected incorrect index
                          cardBorderClass = "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-950/30";
                          cardBgClass = "bg-red-950/20";
                          statusIcon = <X className="w-4 h-4 text-red-400" />;
                        } else {
                          // Unselected option during answered
                          cardBorderClass = "border-slate-900 opacity-60";
                        }
                      } else {
                        // Unanswered state in practice
                        if (tempPracticeSelection === idx) {
                          cardBorderClass = "border-[#00f0ff] bg-blue-950/40";
                        }
                      }
                    } else {
                      // Mock Mode selection style (No answers revealed yet)
                      if (thisOptionSelected) {
                        cardBorderClass = "border-[#00f0ff] ring-1 ring-[#00f0ff]/40 bg-blue-950/50 shadow-[0_0_15px_rgba(0,240,255,0.1)]";
                        cardBgClass = "bg-blue-950/30";
                        statusIcon = <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />;
                      }
                    }

                    return (
                      <button
                        key={idx}
                        id={`option-button-${idx}`}
                        disabled={quizMode === "practice" && practiceAnswered}
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full text-left p-4 rounded-xl border flex items-center justify-between text-sm transition-all duration-200 outline-none ${cardBgClass} ${cardBorderClass} ${
                          quizMode === "practice" && practiceAnswered ? "cursor-not-allowed" : "cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center space-x-3.5 pr-2">
                          <span className={`font-mono text-xs px-2.5 py-1 rounded bg-slate-900 border font-bold ${
                            thisOptionSelected ? "border-[#00f0ff]/70 text-[#00f0ff]" : "border-slate-800 text-slate-500"
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-slate-300 leading-snug font-sans">{option}</span>
                        </div>
                        {statusIcon && (
                          <div className="flex-shrink-0 ml-2">
                            {statusIcon}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanatory Guide Box: visible ONLY in practice mode once answered */}
                {quizMode === "practice" && practiceAnswered && (
                  <div id="practice-explanation-disclosure" className="mt-6 border-t border-blue-900/30 pt-6 animate-fade-in">
                    <div className="bg-slate-950/70 rounded-2xl border border-blue-950 p-5 space-y-4">
                      
                      <div className="flex items-center space-x-2 text-[#00f0ff] font-semibold text-xs font-mono tracking-wider">
                        <Lightbulb className="w-5 h-5 text-[#00f0ff]" />
                        <span>EXPLANATION & ANALYSIS</span>
                      </div>
                      
                      <p className="text-slate-300 text-sm leading-relaxed font-sans">
                        {selectedQuestions[currentQuestionIdx].explanation}
                      </p>
                      
                      <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl text-xs flex items-center space-x-3">
                        <span className="font-mono text-[#00f0ff] font-bold">TOPIC INSIGHT:</span>
                        <span className="text-slate-400 font-sans">Focus strongly on this {selectedQuestions[currentQuestionIdx].topic} concept for online test qualification.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Control Center Column (Timer & Panel Control Info) */}
            <div id="quiz-sidebar-control-panel" className="lg:col-span-4 space-y-6">
              
              {/* === CARD FEATURING THE SIGNATURE CIRCULAR TIMER === */}
              <div className="bg-[#0b1022]/60 border border-blue-900/40 rounded-3xl p-6 text-center space-y-6 relative overflow-hidden backdrop-blur-sm shadow-xl">
                
                {/* Visual glowing energy overlay */}
                <div className="absolute inset-0 bg-radial-gradient(ellipse_at_center,rgba(59,130,246,0.02),rgba(0,0,0,0)) pointer-events-none" />

                <h3 className="font-mono text-slate-400 text-xs font-bold tracking-wider uppercase">
                  {quizMode === "mock" ? "CLOCK ENGINE BOUNDS" : "GUIDED SESSION ENGINE"}
                </h3>

                <div className="flex flex-col items-center justify-center space-y-4">
                  {quizMode === "mock" ? (
                    /* The Signature Circular Timer Element */
                    <div className="relative flex items-center justify-center w-40 h-40">
                      
                      {/* Secondary glowing pulse underlay */}
                      <div className={`absolute inset-2 rounded-full border border-blue-500/10 transition-transform duration-1000 ${
                        timerLeft <= 6 ? "bg-red-500/10 scale-105 animate-pulse" : "bg-blue-500/5 scale-100"
                      }`} />

                      <svg className="w-36 h-36 transform -rotate-90">
                        {/* Static full background track outer circle */}
                        <circle
                          cx="72"
                          cy="72"
                          r="60"
                          stroke="#101935"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        {/* Dynamic Animated path track */}
                        <circle
                          cx="72"
                          cy="72"
                          r="60"
                          stroke={timerLeft <= 6 ? "#ef4444" : "#00f0ff"}
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray="376.99" // 2 * Math.PI * 60
                          strokeDashoffset={376.99 - (timerLeft / SECONDS_PER_QUESTION) * 376.99}
                          className="transition-all duration-1000 ease-linear"
                        />
                      </svg>

                      {/* Monospace central seconds text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`font-mono text-4xl font-extrabold tracking-tight select-none leading-none ${
                          timerLeft <= 6 ? "text-red-500 animate-pulse text-shadow-red" : "text-white"
                        }`}>
                          {timerLeft}
                        </span>
                        <span className={`font-mono text-[9px] uppercase tracking-widest font-bold mt-1 select-none ${
                          timerLeft <= 6 ? "text-red-400" : "text-slate-500"
                        }`}>
                          {timerLeft <= 6 ? "TIME WARNING" : "SECONDS LEFT"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Practice mode display without timer counts */
                    <div className="relative flex items-center justify-center w-32 h-32 bg-slate-950/70 border border-blue-900/30 rounded-full">
                      <GraduationCap className="w-12 h-12 text-emerald-400" />
                      <div className="absolute -bottom-1 bg-green-500/20 border border-green-500/40 rounded-full px-2.5 py-0.5 text-green-400 font-mono text-[9px] font-bold tracking-wider uppercase">
                        UNCAPPED
                      </div>
                    </div>
                  )}

                  {quizMode === "mock" && (
                    <div className="text-center">
                      {timerLeft <= 6 ? (
                        <p className="text-xs text-red-400 font-mono italic animate-pulse">
                          Auto-submitting current selection...
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 font-sans">
                          Answer carefully before the segment limits complete.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-blue-900/30 pt-4 text-left space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Selected Subject Pool:</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {selectedSubjectId === "all" ? "Whole Syllabus" : selectedSubjectId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Total Quiz Scope:</span>
                    <span className="font-mono text-slate-200 font-bold">{selectedQuestions.length} Items</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Answering Mode:</span>
                    <span className={`font-mono font-bold uppercase ${quizMode === "mock" ? "text-blue-400" : "text-green-400"}`}>
                      {quizMode} Mode
                    </span>
                  </div>
                </div>

                {/* Confirm & Move button */}
                <div className="pt-2">
                  {quizMode === "practice" ? (
                    <button
                      id="practice-next-action-button"
                      disabled={!practiceAnswered}
                      onClick={handleNextQuestion}
                      className={`w-full py-3 rounded-xl font-mono text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center space-x-1.5 ${
                        practiceAnswered
                          ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:brightness-110 shadow-lg cursor-pointer"
                          : "bg-slate-900 text-slate-500 border border-slate-950 cursor-not-allowed"
                      }`}
                    >
                      <span>
                        {currentQuestionIdx === selectedQuestions.length - 1 ? "FINISH AND GRADE" : "PROCEED TO NEXT"}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      id="mock-submit-action-button"
                      onClick={handleNextQuestion}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:brightness-110 active:scale-95 py-3 rounded-xl font-mono text-xs font-bold tracking-widest uppercase transition-all shadow-md shadow-blue-900/20 flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>
                        {currentQuestionIdx === selectedQuestions.length - 1 ? "FINISH EXAM" : "NEXT QUESTION"}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Placement Wisdom Panel */}
              <div className="bg-[#050915] border border-blue-900/20 rounded-2xl p-5 text-xs text-slate-500 space-y-2 font-sans">
                <div className="flex items-center space-x-2 text-[#00f0ff] font-bold uppercase tracking-wider text-[10px] font-mono">
                  <BrainCircuit className="w-4 h-4 text-[#00f0ff]" />
                  <span>Assessment Hints</span>
                </div>
                <p className="leading-relaxed">
                  Companies like IBM, Oracle, and AWS often test deep logical concepts. If you get stuck on functional subnet equations or database dependency models, read practice mode answers to memorize primary algorithms.
                </p>
              </div>

            </div>

          </div>
        )}


        {/* =========================================================================
             3. ASSESSMENT DETAILED RESULTS SCREEN
           ========================================================================= */}
        {screen === "results" && (
          <div id="results-analytics-dashboard" className="space-y-8 animate-fade-in">
            
            {/* Main Scorecard / Predictive Placement Ring Banner */}
            {(() => {
              let correct = 0;
              selectedQuestions.forEach((q) => {
                if (userAnswers[q.id] === q.correctOptionIndex) correct++;
              });
              const rawPct = Math.round((correct / selectedQuestions.length) * 100);
              const assessmentReport = getFeedbackCategory(rawPct);

              return (
                <div className="bg-gradient-to-br from-[#0a1128] via-[#050a1b] to-slate-950 p-6 md:p-8 rounded-3xl border border-blue-900/40 shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#00f0ff]/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    
                    {/* Score showcase circular indicator */}
                    <div className="flex-shrink-0 flex flex-col items-center space-y-3 bg-slate-950/80 p-6 rounded-2xl border border-blue-950 text-center w-full md:w-56">
                      <span className="font-mono text-slate-500 text-[10px] uppercase font-bold tracking-widest">AGGREGATE RATING</span>
                      
                      <div className="relative flex items-center justify-center w-32 h-32">
                        {/* Static light circle background */}
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="64" cy="64" r="54" stroke="#101a35" strokeWidth="8" fill="transparent"/>
                          <circle 
                            cx="64" 
                            cy="64" 
                            r="54" 
                            stroke={rawPct >= 75 ? "#10b981" : rawPct >= 50 ? "#f59e0b" : "#ef4444"} 
                            strokeWidth="8" 
                            fill="transparent"
                            strokeDasharray="339.29"
                            strokeDashoffset={339.29 - (rawPct / 100) * 339.29}
                            className="transition-all duration-1000"
                          />
                        </svg>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
                          <span className="font-mono text-4xl font-extrabold text-white leading-none">
                            {rawPct}%
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 mt-1 font-bold">
                            {correct} / {selectedQuestions.length} QS
                          </span>
                        </div>
                      </div>

                      <div className="font-mono text-xs uppercase text-slate-400 font-bold bg-[#0c1432] border border-blue-900/30 px-3 py-1 rounded-lg">
                        {quizMode.toUpperCase()} PLAY
                      </div>
                    </div>

                    {/* Placement Assessment analysis */}
                    <div className="space-y-4 flex-grow">
                      <div className="flex items-center space-x-3">
                        {assessmentReport.icon}
                        <h2 className="font-sans font-black text-2xl text-white tracking-tight">
                          Placement Report Card
                        </h2>
                      </div>

                      <div className={`p-4 rounded-xl border font-mono text-xs font-bold tracking-wider text-center md:text-left ${assessmentReport.color}`}>
                        PREDICTIVE INDEX: {assessmentReport.title}
                      </div>

                      <p className="text-slate-300 text-sm leading-relaxed font-sans">
                        {assessmentReport.desc}
                      </p>

                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          id="retry-quiz-button"
                          onClick={() => handleStartQuiz()}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" /> RETAKE SAME CONFIG
                        </button>

                        {/* Mistakes only conditional button */}
                        {missedQuestionsListSet.length > 0 && (
                          <button
                            id="revise-mistakes-button"
                            onClick={() => handleStartRevisionOfMistakes(missedQuestionsListSet.map(q => q.id))}
                            className="px-5 py-2.5 bg-[#0b1b36] hover:bg-blue-900/40 text-[#00f0ff] border border-blue-800/40 hover:border-blue-500/50 rounded-xl text-xs font-mono font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <BookMarked className="w-4 h-4" /> REVISE MISTAKES ONLY ({missedQuestionsListSet.length})
                          </button>
                        )}

                        <button
                          id="dashboard-return-button"
                          onClick={handleResetToDashboard}
                          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-350 hover:text-white border border-slate-800 rounded-xl text-xs font-mono font-bold tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          DASHBOARD MAIN SCREEN
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })()}

            {/* Diagnostic Breakdown by Domain */}
            <div id="diagnostic-breakdown-panel" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left Column: Categorized accuracy graph */}
              <div className="bg-[#0b1022]/60 border border-blue-900/40 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-sm">
                <div>
                  <h3 className="font-sans font-bold text-lg text-white">Domain Diagnostics</h3>
                  <p className="text-xs text-slate-400">Performance accuracy rate mapped into historical tracking profiles.</p>
                </div>

                <div className="space-y-4">
                  {SUBJECTS_LIST.filter(s => s.id !== "all").map((subj) => {
                    // Calculate current test success for this category
                    const currentTestQsOfSubj = selectedQuestions.filter(q => q.subject === subj.id);
                    let correctCount = 0;
                    currentTestQsOfSubj.forEach((q) => {
                      if (userAnswers[q.id] === q.correctOptionIndex) correctCount++;
                    });
                    
                    const subPct = currentTestQsOfSubj.length > 0 
                      ? Math.round((correctCount / currentTestQsOfSubj.length) * 100) 
                      : null;

                    // Fetch cumulative local storage record for visual benchmark
                    const histData = userStats.subjectScores?.[subj.id] || { correct: 0, total: 0 };
                    const histPct = histData.total > 0 ? Math.round((histData.correct / histData.total) * 100) : 0;

                    return (
                      <div key={subj.id} className="bg-slate-950/40 p-4 rounded-xl border border-blue-950 space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2.5">
                            {renderSubjectIcon(subj.icon, "w-4 h-4")}
                            <span className="font-sans font-bold text-slate-200 text-xs">{subj.name}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2 font-mono text-[10px]">
                            {subPct !== null && (
                              <span className="px-1.5 py-0.5 rounded bg-blue-950 border border-blue-900/40 text-[#00f0ff] font-bold">
                                THIS SESSION: {subPct}%
                              </span>
                            )}
                            <span className="text-slate-400 font-bold">CUMULATIVE: {histPct}%</span>
                          </div>
                        </div>

                        {/* Accuracy progress bar fill */}
                        <div className="w-full bg-slate-900 rounded-full h-2 relative">
                          <div 
                            className="bg-gradient-to-r from-blue-600 to-cyan-400 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${histPct || 0}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Key Learnings / Recommended Materials */}
              <div className="bg-[#0b1022]/60 border border-blue-900/40 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-sm">
                <div>
                  <h3 className="font-sans font-bold text-lg text-white">Recommended Actions</h3>
                  <p className="text-xs text-slate-400">Custom dynamic tasks suggested based on current test findings.</p>
                </div>

                <div className="space-y-4">
                  
                  {missedQuestionsListSet.length > 0 ? (
                    <div className="p-4 bg-yellow-950/15 border border-yellow-900/40 rounded-2xl flex items-start space-x-3.5">
                      <div className="p-2 bg-yellow-950/60 rounded-xl border border-yellow-800/40">
                        <BookMarked className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-yellow-400 font-mono text-xs font-bold uppercase">REVISE CORE TOPICS ({missedQuestionsListSet.length})</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          You registered errors in critical sections such as: <strong className="text-slate-350">{Array.from(new Set(missedQuestionsListSet.map(q => q.topic))).join(", ")}</strong>. Run a structured revision by choosing the "REVISE MISTAKES ONLY" action.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-950/20 border border-green-900/40 rounded-2xl flex items-start space-x-3.5">
                      <div className="p-2 bg-green-950/60 rounded-xl border border-green-800/40">
                        <Sparkles className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-green-400 font-mono text-xs font-bold uppercase">PERFECT CLEAR ARCHIVED</h4>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          Congratulations! Your computer networks logic, memory calculations, and structural database normalizations was flawlessly evaluated.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-[#050915] border border-blue-950 rounded-2xl space-y-3 text-xs">
                    <span className="font-mono text-[#00f0ff] font-bold block uppercase tracking-wider text-[10px]">PLACEMENT SUITE TIPS</span>
                    <ol className="list-decimal list-inside space-y-2 text-slate-400 font-sans leading-relaxed">
                      <li>Use the detailed review ledger below to identify exact logic gaps.</li>
                      <li>In real tech assessments, time limits range around 60s per item. Try to clear questions inside the 25s threshold of this simulation context to ensure maximum readiness speed.</li>
                    </ol>
                  </div>
                </div>
              </div>

            </div>

            {/* Large Scrollable Review Ledger of All Quiz Questions */}
            <div id="answers-review-ledger-container" className="space-y-4">
              <h3 className="font-sans font-bold text-xl text-white tracking-tight">
                Review Answering Ledger
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Complete diagnostic trace of all questions from your active test segment. Analyze source snippets and correct solution outlines.
              </p>

              <div className="space-y-4">
                {selectedQuestions.map((q, qidx) => {
                  const ans = userAnswers[q.id];
                  const isCorrect = ans === q.correctOptionIndex;
                  const hasNotAnswered = ans === -1 || ans === undefined;

                  return (
                    <div 
                      key={q.id} 
                      id={`ledger-card-${q.id}`}
                      className={`p-6 rounded-2xl border transition-all ${
                        isCorrect 
                          ? "bg-[#0b1c20]/45 border-[#10b981]/30 hover:border-[#10b981]/60" 
                          : hasNotAnswered 
                            ? "bg-slate-900/30 border-blue-950" 
                            : "bg-[#25101a]/45 border-red-500/20 hover:border-red-500/40"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-blue-900/20 pb-3 mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs text-[#00f0ff] font-bold">
                            #{String(qidx + 1).padStart(2, "0")}
                          </span>
                          <span className="text-slate-600 font-mono">•</span>
                          <span className="font-medium text-xs font-mono text-slate-400">
                            {q.subject} ({q.topic})
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 font-mono text-xs">
                          {isCorrect ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1 bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/20">
                              <Check className="w-3.5 h-3.5" /> SECURED
                            </span>
                          ) : hasNotAnswered ? (
                            <span className="text-amber-400 font-bold flex items-center gap-1 bg-yellow-500/5 px-2 py-0.5 rounded border border-yellow-500/10">
                              <AlertTriangle className="w-3.5 h-3.5" /> UNANSWERED (TIMEOUT)
                            </span>
                          ) : (
                            <span className="text-red-400 font-bold flex items-center gap-1 bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">
                              <X className="w-3.5 h-3.5" /> SYSTEM MISS
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-slate-200 font-sans text-sm md:text-base font-bold leading-snug">
                          {q.questionText}
                        </h4>

                        {/* If code snippet was part of the review */}
                        {q.codeSnippet && (
                          <CodeHighlighter code={q.codeSnippet} language={q.language || "cpp"} />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          {q.options.map((opt, oindex) => {
                            const isCorrectOpt = oindex === q.correctOptionIndex;
                            const isUserSelected = oindex === ans;
                            
                            let optBorder = "border-slate-800 bg-[#0c1432]/10";
                            let optText = "text-slate-400";
                            let optLabel = "bg-slate-900 border-slate-700 text-slate-500";

                            if (isCorrectOpt) {
                              optBorder = "border-emerald-500/40 bg-emerald-950/20";
                              optText = "text-emerald-400 font-semibold";
                              optLabel = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                            } else if (isUserSelected && !isCorrectOpt) {
                              optBorder = "border-red-500/45 bg-red-950/20";
                              optText = "text-red-400";
                              optLabel = "bg-red-500/20 border-red-500 text-red-400";
                            }

                            return (
                              <div key={oindex} className={`p-3 rounded-xl border flex items-center space-x-3 text-xs leading-snug ${optBorder} ${optText}`}>
                                <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${optLabel}`}>
                                  {String.fromCharCode(65 + oindex)}
                                </span>
                                <span className="font-sans">{opt}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Detailed analytical solution explanation text */}
                        <div className="p-4 bg-slate-950/60 rounded-xl border border-blue-950/50 space-y-2 text-xs">
                          <span className="font-mono text-slate-400 font-bold flex items-center gap-1">
                            <Lightbulb className="w-3.5 h-3.5 text-yellow-400" /> SOLUTION NOTES:
                          </span>
                          <p className="text-slate-300 leading-relaxed font-sans">
                            {q.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Futuristic Placement Card Footer */}
      <footer id="app-footer" className="relative z-20 mt-auto py-6 border-t border-blue-900/30 bg-slate-950 text-slate-550 font-sans text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[#00f0ff] font-mono tracking-widest font-bold uppercase text-[9px] block">CS ASSESSMENT PLATFORM</span>
            <span className="text-slate-400 text-[11px] font-sans">Empowering placement candidates with strict exam environments.</span>
          </div>
          
          <div className="flex space-x-6 text-slate-500 font-mono text-[10px] uppercase">
            <span>DATABASE ACCURACY: <strong className="text-slate-300 font-bold font-mono">STABLE</strong></span>
            <span>CLOCK FREQUENCY: <strong className="text-[#00f0ff] font-bold font-mono">25S</strong></span>
          </div>
        </div>
      </footer>

    </div>
  );
}
