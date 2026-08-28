import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Question, QuizAttempt, QuestionTopic, AppView, QuizState } from '../types/quiz';
import { QUESTIONS_DATA } from '../data/questions';

interface AppContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;

  // User Identity
  userName: string;
  setUserName: (name: string) => void;
  
  selectedTopic: QuestionTopic | null;
  setSelectedTopic: (topic: QuestionTopic | null) => void;
  openTopicSets: (topic: QuestionTopic | null) => void;
  startSetQuiz: (topic: QuestionTopic, setNumber: number, setQuestions: Question[]) => void;

  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;

  // Streak & Points
  streakDays: number;
  xpPoints: number;

  // Bookmarks
  bookmarkedQuestionIds: string[];
  toggleBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;

  // Mistake Vault
  mistakeQuestionIds: string[];
  addMistake: (id: string) => void;
  removeMistake: (id: string) => void;

  // Quiz History
  quizAttempts: QuizAttempt[];
  addQuizAttempt: (attempt: QuizAttempt) => void;

  // Active Quiz State
  activeQuiz: QuizState | null;
  startTopicQuiz: (topic: QuestionTopic) => void;
  startCustomQuiz: (title: string, questions: Question[], timeLimitMinutes?: number) => void;
  selectOption: (questionId: string, optionIndex: number) => void;
  toggleMarkReview: (questionId: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  submitQuiz: () => QuizAttempt | null;
  lastAttempt: QuizAttempt | null;
  
  // Search Query
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Phone Number & Pro Auth
  userPhone: string | null;
  verifyAndLoginPhone: (phone: string, name?: string) => Promise<{ success: boolean; isPro: boolean; message: string; userName?: string }>;
  logoutPhone: () => void;

  // PRO Membership & Razorpay Access (₹29 for 2 Months / 60 Days)
  isProUser: boolean;
  proExpiryDate: string | null;
  isPricingModalOpen: boolean;
  setIsPricingModalOpen: (open: boolean) => void;
  openPricingModal: () => void;
  unlockProMembership: (days?: number, phone?: string) => void;
  FREE_TESTS_LIMIT: number;

  // AI Grammar & Spelling Checker Limit (30 Free Checks)
  aiChecksCount: number;
  incrementAiCheck: () => boolean;
  FREE_AI_CHECKS_LIMIT: number;
}

const AppContext = createContext<AppContextType | null>(null);

// Google Apps Script Webhook URL (Replace with your deployed Web App URL)
export const GOOGLE_SHEET_API_URL = localStorage.getItem('ssc_sheet_api_url') || 'https://script.google.com/macros/s/AKfycbxSTihxwKdh0uXkTjqDiG9MSoBtJB9hAUNdV35s-fYFh1w5hlK8MEsutTfaz6sxnu-BxQ/exec';

const STORAGE_KEYS = {
  THEME: 'ssc_quiz_theme',
  BOOKMARKS: 'ssc_quiz_bookmarks',
  MISTAKES: 'ssc_quiz_mistakes',
  ATTEMPTS: 'ssc_quiz_attempts',
  STREAK: 'ssc_quiz_streak',
  XP: 'ssc_quiz_xp',
  PRO_USER: 'ssc_is_pro_member',
  PRO_EXPIRY: 'ssc_pro_expiry_timestamp',
  USER_PHONE: 'ssc_user_phone',
  AI_CHECKS: 'ssc_ai_checks_count',
  CURRENT_VIEW: 'ssc_current_view'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentViewRaw] = useState<AppView>(() => {
    return (sessionStorage.getItem(STORAGE_KEYS.CURRENT_VIEW) as AppView) || 'dashboard';
  });

  const setCurrentView = (view: AppView) => {
    setCurrentViewRaw(view);
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_VIEW, view);
  };
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) === 'dark';
  });
  const [streakDays] = useState<number>(3);
  const [xpPoints, setXpPoints] = useState<number>(450);

  const [userName, setUserNameState] = useState<string>(() => {
    return localStorage.getItem('ssc_user_name') || 'SSC Aspirant';
  });

  const setUserName = (name: string) => {
    const trimmed = name.trim() || 'SSC Aspirant';
    setUserNameState(trimmed);
    localStorage.setItem('ssc_user_name', trimmed);
  };

  const [userPhone, setUserPhone] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.USER_PHONE) || null;
  });

  const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [mistakeQuestionIds, setMistakeQuestionIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MISTAKES);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
    return saved ? JSON.parse(saved) : [];
  });

  // PRO Membership State (₹29 for 2 Months / 60 Days Access)
  const [isProUser, setIsProUser] = useState<boolean>(() => {
    const isPro = localStorage.getItem(STORAGE_KEYS.PRO_USER) === 'true';
    const expiry = localStorage.getItem(STORAGE_KEYS.PRO_EXPIRY);
    if (isPro && expiry) {
      const expiryTimestamp = parseInt(expiry, 10);
      if (Date.now() < expiryTimestamp) {
        return true;
      } else {
        localStorage.removeItem(STORAGE_KEYS.PRO_USER);
        localStorage.removeItem(STORAGE_KEYS.PRO_EXPIRY);
        return false;
      }
    }
    return isPro;
  });

  const [proExpiryDate, setProExpiryDate] = useState<string | null>(() => {
    const expiry = localStorage.getItem(STORAGE_KEYS.PRO_EXPIRY);
    if (expiry) {
      return new Date(parseInt(expiry, 10)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return null;
  });

  const [isPricingModalOpen, setIsPricingModalOpen] = useState<boolean>(false);
  const openPricingModal = () => setIsPricingModalOpen(true);

  const unlockProMembership = (days = 60, phone?: string) => {
    const expiryTimestamp = Date.now() + days * 24 * 60 * 60 * 1000;
    const formattedDate = new Date(expiryTimestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    localStorage.setItem(STORAGE_KEYS.PRO_USER, 'true');
    localStorage.setItem(STORAGE_KEYS.PRO_EXPIRY, expiryTimestamp.toString());
    
    const activePhone = phone ? phone.replace(/[^0-9]/g, '').slice(-10) : userPhone;
    if (activePhone) {
      localStorage.setItem(STORAGE_KEYS.USER_PHONE, activePhone);
      setUserPhone(activePhone);

      // Push Pro status to Google Sheet (GET to avoid CORS)
      if (GOOGLE_SHEET_API_URL) {
        try {
          const paymentId = 'RZP_' + Date.now();
          fetch(`${GOOGLE_SHEET_API_URL}?action=updatePro&phone=${activePhone}&days=${days}&paymentId=${paymentId}`)
            .catch(() => {});
        } catch (_) {}
      }
    }
    setIsProUser(true);
    setProExpiryDate(formattedDate);
    setIsPricingModalOpen(false);
  };

  // Verify Phone against Google Sheet Web App (with auto-signup)
  const verifyAndLoginPhone = async (rawPhone: string, name?: string): Promise<{ success: boolean; isPro: boolean; message: string; userName?: string }> => {
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return { success: false, isPro: false, message: 'Please enter a valid 10-digit mobile number.' };
    }

    localStorage.setItem(STORAGE_KEYS.USER_PHONE, cleanPhone);
    setUserPhone(cleanPhone);

    // Save name if provided
    if (name && name.trim()) {
      setUserName(name.trim());
    }

    // If Google Sheet API is connected
    if (GOOGLE_SHEET_API_URL) {
      try {
        // Step 1: Check if user exists
        const checkRes = await fetch(`${GOOGLE_SHEET_API_URL}?action=checkPhone&phone=${cleanPhone}`);
        const checkData = await checkRes.json();

        if (checkData && checkData.exists) {
          // User found in Sheet
          if (checkData.name) {
            setUserName(checkData.name);
          }

          if (checkData.isPro) {
            const expTimestamp = checkData.expiryDate ? new Date(checkData.expiryDate).getTime() : Date.now() + 60 * 24 * 3600 * 1000;
            localStorage.setItem(STORAGE_KEYS.PRO_USER, 'true');
            localStorage.setItem(STORAGE_KEYS.PRO_EXPIRY, expTimestamp.toString());
            setIsProUser(true);
            setProExpiryDate(new Date(expTimestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
            return { success: true, isPro: true, message: '🎉 Pro Pass verified! Welcome back!', userName: checkData.name };
          } else {
            return { 
              success: true, 
              isPro: false, 
              message: `Welcome back, ${checkData.name || 'Student'}! Login successful.`,
              userName: checkData.name
            };
          }
        } else {
          // User not found — auto signup (GET to avoid CORS)
          const signupName = name?.trim() || localStorage.getItem('ssc_user_name') || 'Student';
          try {
            const encodedName = encodeURIComponent(signupName);
            const signupRes = await fetch(`${GOOGLE_SHEET_API_URL}?action=signup&phone=${cleanPhone}&name=${encodedName}`);
            const signupData = await signupRes.json();
            return {
              success: true,
              isPro: false,
              message: `✅ Account created successfully! Welcome, ${signupName}!`,
              userName: signupName
            };
          } catch {
            // Signup failed but phone is saved locally
            return { success: true, isPro: false, message: `Number ${cleanPhone} saved locally.` };
          }
        }
      } catch (err) {
        // Fallback: If sheet unreachable, check locally
        const isLocalPro = localStorage.getItem(STORAGE_KEYS.PRO_USER) === 'true';
        return { 
          success: true, 
          isPro: isLocalPro, 
          message: isLocalPro ? 'Local Pro active.' : 'Mobile number linked successfully.' 
        };
      }
    } else {
      // Direct Local Mode (Sheet URL not yet provided)
      const isLocalPro = localStorage.getItem(STORAGE_KEYS.PRO_USER) === 'true';
      return { 
        success: true, 
        isPro: isLocalPro, 
        message: `Number ${cleanPhone} saved successfully.` 
      };
    }
  };

  const logoutPhone = () => {
    localStorage.removeItem(STORAGE_KEYS.USER_PHONE);
    localStorage.removeItem(STORAGE_KEYS.PRO_USER);
    localStorage.removeItem(STORAGE_KEYS.PRO_EXPIRY);
    setUserPhone(null);
    setIsProUser(false);
    setProExpiryDate(null);
  };

  const FREE_TESTS_LIMIT = 8;
  const FREE_AI_CHECKS_LIMIT = 30;

  // AI Checks Count State
  const [aiChecksCount, setAiChecksCount] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AI_CHECKS);
    return saved ? parseInt(saved, 10) : 0;
  });

  const incrementAiCheck = (): boolean => {
    if (isProUser) return true;
    if (aiChecksCount >= FREE_AI_CHECKS_LIMIT) {
      openPricingModal();
      return false;
    }
    const updated = aiChecksCount + 1;
    setAiChecksCount(updated);
    localStorage.setItem(STORAGE_KEYS.AI_CHECKS, updated.toString());
    return true;
  };

  const [selectedTopic, setSelectedTopic] = useState<QuestionTopic | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<QuizState | null>(null);
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const openTopicSets = (topic: QuestionTopic | null) => {
    setSelectedTopic(topic);
    setCurrentView('topic_sets');
  };

  const startSetQuiz = (topic: QuestionTopic, setNumber: number, setQuestions: Question[]) => {
    const topicTitle = topic.replace('_', ' ').toUpperCase();
    setActiveQuiz({
      topic,
      questions: setQuestions,
      currentIndex: 0,
      userAnswers: {},
      markedForReview: {},
      isSubmitted: false,
      timeRemainingSeconds: 15 * 60, // 15 Mins timer for 30 questions
      totalTimeSeconds: 15 * 60,
      quizTitle: `${topicTitle} - Set ${setNumber} (${setQuestions.length} Questions)`
    });
    setCurrentView('quiz');
  };

  // Save to localstorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarkedQuestionIds));
  }, [bookmarkedQuestionIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(mistakeQuestionIds));
  }, [mistakeQuestionIds]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(quizAttempts));
  }, [quizAttempts]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const toggleBookmark = (id: string) => {
    setBookmarkedQuestionIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const isBookmarked = (id: string) => bookmarkedQuestionIds.includes(id);

  const addMistake = (id: string) => {
    setMistakeQuestionIds(prev => Array.from(new Set([...prev, id])));
  };

  const removeMistake = (id: string) => {
    setMistakeQuestionIds(prev => prev.filter(x => x !== id));
  };

  const addQuizAttempt = (attempt: QuizAttempt) => {
    setQuizAttempts(prev => [attempt, ...prev]);
    setXpPoints(prev => prev + (attempt.score * 10));
  };

  // Start Topic Quiz
  const startTopicQuiz = (topic: QuestionTopic) => {
    const topicQs = QUESTIONS_DATA.filter(q => q.topic === topic);
    const questions = topicQs.length > 0 ? topicQs : QUESTIONS_DATA.slice(0, 5);
    
    setActiveQuiz({
      topic,
      questions,
      currentIndex: 0,
      userAnswers: {},
      markedForReview: {},
      isSubmitted: false,
      timeRemainingSeconds: questions.length * 45,
      totalTimeSeconds: questions.length * 45,
      quizTitle: `Topic Practice: ${topic.replace('_', ' ').toUpperCase()}`
    });
    setCurrentView('quiz');
  };

  // Start Custom / PYQ Quiz
  const startCustomQuiz = (title: string, questions: Question[], timeLimitMinutes = 10) => {
    setActiveQuiz({
      questions,
      currentIndex: 0,
      userAnswers: {},
      markedForReview: {},
      isSubmitted: false,
      timeRemainingSeconds: timeLimitMinutes * 60,
      totalTimeSeconds: timeLimitMinutes * 60,
      quizTitle: title
    });
    setCurrentView('quiz');
  };

  const selectOption = (questionId: string, optionIndex: number) => {
    if (!activeQuiz || activeQuiz.isSubmitted) return;
    setActiveQuiz(prev => prev ? ({
      ...prev,
      userAnswers: { ...prev.userAnswers, [questionId]: optionIndex }
    }) : null);
  };

  const toggleMarkReview = (questionId: string) => {
    if (!activeQuiz) return;
    setActiveQuiz(prev => prev ? ({
      ...prev,
      markedForReview: {
        ...prev.markedForReview,
        [questionId]: !prev.markedForReview[questionId]
      }
    }) : null);
  };

  const nextQuestion = () => {
    if (!activeQuiz) return;
    if (activeQuiz.currentIndex < activeQuiz.questions.length - 1) {
      setActiveQuiz(prev => prev ? ({ ...prev, currentIndex: prev.currentIndex + 1 }) : null);
    }
  };

  const prevQuestion = () => {
    if (!activeQuiz) return;
    if (activeQuiz.currentIndex > 0) {
      setActiveQuiz(prev => prev ? ({ ...prev, currentIndex: prev.currentIndex - 1 }) : null);
    }
  };

  const goToQuestion = (index: number) => {
    if (!activeQuiz) return;
    if (index >= 0 && index < activeQuiz.questions.length) {
      setActiveQuiz(prev => prev ? ({ ...prev, currentIndex: index }) : null);
    }
  };

  const submitQuiz = (): QuizAttempt | null => {
    if (!activeQuiz || activeQuiz.isSubmitted) return null;

    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    activeQuiz.questions.forEach(q => {
      const chosen = activeQuiz.userAnswers[q.id];
      if (chosen === undefined) {
        skipped++;
      } else if (chosen === q.correctAnswer) {
        correct++;
      } else {
        wrong++;
        addMistake(q.id);
      }
    });

    const timeSpent = activeQuiz.totalTimeSeconds - activeQuiz.timeRemainingSeconds;
    const attempt: QuizAttempt = {
      id: 'att-' + Date.now(),
      title: activeQuiz.quizTitle,
      topic: activeQuiz.topic,
      totalQuestions: activeQuiz.questions.length,
      score: (correct * 2) - (wrong * 0.5), // SSC Marking: +2 for correct, -0.5 for wrong
      correctCount: correct,
      wrongCount: wrong,
      skippedCount: skipped,
      timeSpentSeconds: Math.max(timeSpent, 1),
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      userAnswers: activeQuiz.userAnswers
    };

    addQuizAttempt(attempt);
    setLastAttempt(attempt);
    setActiveQuiz(prev => prev ? ({ ...prev, isSubmitted: true }) : null);
    setCurrentView('result');
    return attempt;
  };

  return (
    <AppContext.Provider value={{
      currentView,
      setCurrentView,
      userName,
      setUserName,
      selectedTopic,
      setSelectedTopic,
      openTopicSets,
      startSetQuiz,
      isDarkMode,
      toggleTheme,
      streakDays,
      xpPoints,
      bookmarkedQuestionIds,
      toggleBookmark,
      isBookmarked,
      mistakeQuestionIds,
      addMistake,
      removeMistake,
      quizAttempts,
      addQuizAttempt,
      activeQuiz,
      startTopicQuiz,
      startCustomQuiz,
      selectOption,
      toggleMarkReview,
      nextQuestion,
      prevQuestion,
      goToQuestion,
      submitQuiz,
      lastAttempt,
      searchQuery,
      setSearchQuery,
      isProUser,
      proExpiryDate,
      isPricingModalOpen,
      setIsPricingModalOpen,
      openPricingModal,
      unlockProMembership,
      FREE_TESTS_LIMIT,
      userPhone,
      verifyAndLoginPhone,
      logoutPhone,
      aiChecksCount,
      incrementAiCheck,
      FREE_AI_CHECKS_LIMIT
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
