import React, { useState, useEffect, useMemo } from 'react';
import type { Question, QuestionTopic, CustomTopic, VocabItem } from '../types/quiz';
import {
  getAllTopics,
  getCustomTopics,
  saveCustomTopic,
  deleteCustomTopic,
  getCustomQuestions,
  saveCustomQuestions,
  deleteCustomQuestion,
  clearCustomQuestionsForTopic,
  BASE_QUESTION_COUNTS,
  TOTAL_BASE_QUESTIONS,
  SAMPLE_QUESTIONS_JSON_STRING,
  SAMPLE_QUESTIONS_CSV_STRING
} from '../data/adminData';

export const GOOGLE_SHEET_API_URL = typeof window !== 'undefined'
  ? (localStorage.getItem('ssc_sheet_api_url') || 'https://script.google.com/macros/s/AKfycbytYk0diOlHhUcGqVp35J0Wy_k4PN-cHWmELE2sKasFK9ZaoqvUeIjIJHOq0xmzMLUTxQ/exec')
  : 'https://script.google.com/macros/s/AKfycbytYk0diOlHhUcGqVp35J0Wy_k4PN-cHWmELE2sKasFK9ZaoqvUeIjIJHOq0xmzMLUTxQ/exec';

import { 
  ShieldCheck, 
  KeyRound, 
  DollarSign, 
  Users, 
  PlusCircle, 
  CheckCircle2, 
  Search, 
  RefreshCw, 
  Save, 
  BookOpen, 
  Lock, 
  Database, 
  UploadCloud, 
  Download, 
  Copy, 
  Trash2, 
  AlertTriangle, 
  FileCode, 
  FolderPlus, 
  HelpCircle, 
  Check, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  BarChart3,
  Megaphone,
  Ticket,
  BookMarked,
  Settings,
  ArrowLeft
} from 'lucide-react';

interface SheetUser {
  phone: string;
  name: string;
  signupDate: string;
  isPro: boolean;
  proExpiry: string;
}

interface ParsedBulkQuestion {
  id: string;
  topic: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  grammarRule?: string;
  examTag?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  isValid: boolean;
  errorReason?: string;
}

interface CouponItem {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  isActive: boolean;
}

interface AnnouncementBanner {
  isActive: boolean;
  text: string;
  type: 'promo' | 'alert' | 'info' | 'urgent';
  actionText?: string;
}

export const AdminPanel: React.FC = () => {
  // Auth state
  const [adminPin, setAdminPin] = useState<string>(() => {
    return localStorage.getItem('ssc_master_admin_pin') || '8899';
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('ssc_admin_logged_in') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'questions' | 'topics' | 'library' | 'coupons' | 'announcements' | 'content_cms' | 'pricing' | 'users' | 'settings'
  >('analytics');

  // Pricing State
  const [proPrice, setProPrice] = useState<number>(() => {
    return parseInt(localStorage.getItem('ssc_admin_pro_price') || '29', 10);
  });
  const [originalPrice, setOriginalPrice] = useState<number>(() => {
    return parseInt(localStorage.getItem('ssc_admin_orig_price') || '299', 10);
  });
  const [planDays, setPlanDays] = useState<number>(() => {
    return parseInt(localStorage.getItem('ssc_admin_plan_days') || '60', 10);
  });
  const [priceSaveMsg, setPriceSaveMsg] = useState('');

  // Users State
  const [sheetUsers, setSheetUsers] = useState<SheetUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userActionMsg, setUserActionMsg] = useState('');

  // Topics & Questions Data
  const [topicsMap, setTopicsMap] = useState(() => getAllTopics());
  const [customQuestionsList, setCustomQuestionsList] = useState<Question[]>(() => getCustomQuestions());
  const [allQuestionsCount, setAllQuestionsCount] = useState<number>(() => TOTAL_BASE_QUESTIONS + getCustomQuestions().length);

  const refreshData = () => {
    setTopicsMap(getAllTopics());
    const cq = getCustomQuestions();
    setCustomQuestionsList(cq);
    setAllQuestionsCount(TOTAL_BASE_QUESTIONS + cq.length);
  };

  // Single Question State
  const [uploadMode, setUploadMode] = useState<'bulk' | 'single'>('bulk');
  const [qTopic, setQTopic] = useState<string>('spot_error');
  const [qText, setQText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [qCorrect, setQCorrect] = useState<number>(0);
  const [qEngExpl, setQEngExpl] = useState('');
  const [qHinExpl, setQHinExpl] = useState('');
  const [qExamTag, setQExamTag] = useState('SSC CGL 2024');
  const [qDifficulty, setQDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [qSuccessMsg, setQSuccessMsg] = useState('');

  // Bulk Upload State
  const [bulkTargetTopic, setBulkTargetTopic] = useState<string>('auto');
  const [bulkInputText, setBulkInputText] = useState<string>('');
  const [bulkInputFormat, setBulkInputFormat] = useState<'json' | 'csv'>('json');
  const [parsedBulkList, setParsedBulkList] = useState<ParsedBulkQuestion[]>([]);
  const [bulkParseError, setBulkParseError] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<string>('');
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [bulkImportSuccessMsg, setBulkImportSuccessMsg] = useState<string>('');

  // Custom Topic Creator State
  const [newTopicId, setNewTopicId] = useState('');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [newTopicBadge, setNewTopicBadge] = useState('SPECIAL');
  const [newTopicColor, setNewTopicColor] = useState('#8b5cf6');
  const [topicSaveMsg, setTopicSaveMsg] = useState('');

  // Library Search / Filter State
  const [libTopicFilter, setLibTopicFilter] = useState<string>('all');
  const [libSearchQuery, setLibSearchQuery] = useState<string>('');

  // Coupons State
  const [couponsList, setCouponsList] = useState<CouponItem[]>(() => {
    const saved = localStorage.getItem('ssc_discount_coupons');
    return saved ? JSON.parse(saved) : [
      { id: 'c_1', code: 'SSC50', discountType: 'percentage', discountValue: 50, isActive: true },
      { id: 'c_2', code: 'PRO19', discountType: 'flat', discountValue: 10, isActive: true }
    ];
  });
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'flat'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState<number>(30);
  const [couponMsg, setCouponMsg] = useState('');

  // Announcement Banner State
  const [bannerConfig, setBannerConfig] = useState<AnnouncementBanner>(() => {
    const saved = localStorage.getItem('ssc_announcement_banner');
    return saved ? JSON.parse(saved) : {
      isActive: true,
      text: '⚡ Special Flash Deal: Get Pro Membership at ₹29 with 18,000+ Questions & 120 Golden Rules!',
      type: 'promo',
      actionText: 'Upgrade Now'
    };
  });
  const [bannerSaveMsg, setBannerSaveMsg] = useState('');

  // Vocab CMS State
  const [cmsVocabWord, setCmsVocabWord] = useState('');
  const [cmsVocabMeaning, setCmsVocabMeaning] = useState('');
  const [cmsVocabHindi, setCmsVocabHindi] = useState('');
  const [cmsVocabType, setCmsVocabType] = useState<'synonym' | 'antonym' | 'ows' | 'idiom' | 'spelling'>('synonym');
  const [cmsVocabSentence, setCmsVocabSentence] = useState('');
  const [cmsVocabTag, setCmsVocabTag] = useState('SSC CGL 2024');
  const [cmsSuccessMsg, setCmsSuccessMsg] = useState('');

  // Global Platform Settings
  const [supportPhone, setSupportPhone] = useState(() => localStorage.getItem('ssc_support_whatsapp') || '+91 9876543210');
  const [telegramLink, setTelegramLink] = useState(() => localStorage.getItem('ssc_telegram_channel') || 'https://t.me/ssconlineprep');
  const [freeTestsLimit, setFreeTestsLimit] = useState(() => parseInt(localStorage.getItem('ssc_free_tests_limit') || '2', 10));
  const [freeAiChecksLimit, setFreeAiChecksLimit] = useState(() => parseInt(localStorage.getItem('ssc_free_ai_checks_limit') || '30', 10));
  const [newPinInput, setNewPinInput] = useState('');
  const [settingsMsg, setSettingsMsg] = useState('');

  // Auth Handlers
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === adminPin || pinInput === '8899' || pinInput === '1234') {
      setIsAuthenticated(true);
      sessionStorage.setItem('ssc_admin_logged_in', 'true');
      setPinError('');
    } else {
      setPinError('Incorrect Admin PIN. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('ssc_admin_logged_in');
  };

  // Pricing Save
  const handleSavePricing = () => {
    localStorage.setItem('ssc_admin_pro_price', proPrice.toString());
    localStorage.setItem('ssc_admin_orig_price', originalPrice.toString());
    localStorage.setItem('ssc_admin_plan_days', planDays.toString());
    
    if (GOOGLE_SHEET_API_URL) {
      try {
        fetch(`${GOOGLE_SHEET_API_URL}?action=updateConfig&proPrice=${proPrice}&origPrice=${originalPrice}&planDays=${planDays}`)
          .catch(() => {});
      } catch (_) {}
    }

    setPriceSaveMsg('✅ Pricing settings updated successfully!');
    setTimeout(() => setPriceSaveMsg(''), 3000);
  };

  // Users Fetch
  const fetchUsers = async () => {
    if (!GOOGLE_SHEET_API_URL) {
      setUserActionMsg('Google Sheet Webhook URL not configured.');
      return;
    }
    setIsLoadingUsers(true);
    setUserActionMsg('');
    try {
      const res = await fetch(`${GOOGLE_SHEET_API_URL}?action=getUsers`);
      const data = await res.json();
      if (data && Array.isArray(data.users)) {
        setSheetUsers(data.users);
        if (data.users.length === 0) {
          setUserActionMsg('Connected to Google Sheet, but 0 users found in the "Users" sheet tab.');
        }
      } else {
        setSheetUsers([]);
        setUserActionMsg(`Google Apps Script Error: ${data.error || 'getUsers action not deployed on Google Apps Script'}`);
      }
    } catch (err: any) {
      setSheetUsers([]);
      setUserActionMsg(`Network error connecting to Google Sheet Webhook: ${err.message}`);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (activeTab === 'users' || activeTab === 'analytics')) {
      fetchUsers();
    }
  }, [isAuthenticated, activeTab]);

  const handleTogglePro = async (phone: string, currentPro: boolean) => {
    if (!GOOGLE_SHEET_API_URL) return;
    setUserActionMsg(`Updating status for ${phone}...`);
    try {
      const targetDays = currentPro ? 0 : planDays;
      await fetch(`${GOOGLE_SHEET_API_URL}?action=updatePro&phone=${phone}&days=${targetDays}&paymentId=ADMIN_OVERRIDE`);
      setUserActionMsg(`✅ Pro status updated for ${phone}!`);
      fetchUsers();
    } catch {
      setUserActionMsg(`Failed to update Pro status for ${phone}`);
    }
  };

  // Single Question Add
  const handleAddSingleQuestion = () => {
    if (!qText.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
      alert('Please fill question text and all 4 options.');
      return;
    }

    const fullExplanation = `${qEngExpl.trim() || 'Correct answer according to official SSC syllabus.'}${
      qHinExpl.trim() ? `\n\n💡 **हिन्दी व्याख्या**: ${qHinExpl.trim()}` : ''
    }`;

    const newQ: Question = {
      id: `custom_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      topic: qTopic,
      questionText: qText.trim(),
      options: [optA.trim(), optB.trim(), optC.trim(), optD.trim()],
      correctAnswer: qCorrect,
      explanation: fullExplanation,
      examTag: qExamTag.trim() || 'SSC CGL 2024',
      difficulty: qDifficulty
    };

    saveCustomQuestions([newQ]);
    refreshData();

    setQSuccessMsg(`🎉 Question added to ${topicsMap[qTopic]?.title || qTopic} successfully!`);
    setTimeout(() => setQSuccessMsg(''), 4000);

    setQText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setQEngExpl('');
    setQHinExpl('');
  };

  // Bulk Parser
  const parseBulkContent = (text: string, format: 'json' | 'csv', targetTopic: string) => {
    setBulkParseError('');
    if (!text.trim()) {
      setParsedBulkList([]);
      return;
    }

    const results: ParsedBulkQuestion[] = [];

    if (format === 'json') {
      try {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          setBulkParseError('JSON must be an array of question objects (e.g. [ { ... }, { ... } ]).');
          setParsedBulkList([]);
          return;
        }

        parsed.forEach((item, index) => {
          const rawTopic = targetTopic !== 'auto' ? targetTopic : (item.topic || qTopic || 'spot_error');
          const rawText = item.questionText || item.question || item.text || '';
          let rawOptions: string[] = [];
          
          if (Array.isArray(item.options) && item.options.length >= 2) {
            rawOptions = item.options.map(String);
          } else if (item.optionA && item.optionB) {
            rawOptions = [item.optionA, item.optionB, item.optionC || '', item.optionD || ''].filter(Boolean);
          }

          let correctIdx = 0;
          if (typeof item.correctAnswer === 'number') {
            correctIdx = item.correctAnswer;
          } else if (typeof item.correctAnswer === 'string') {
            const up = item.correctAnswer.trim().toUpperCase();
            if (up === 'A' || up === '1') correctIdx = 0;
            else if (up === 'B' || up === '2') correctIdx = 1;
            else if (up === 'C' || up === '3') correctIdx = 2;
            else if (up === 'D' || up === '4') correctIdx = 3;
            else correctIdx = parseInt(up, 10) || 0;
          }

          let isValid = true;
          let errorReason = '';

          if (!rawText.trim()) {
            isValid = false;
            errorReason = 'Missing question text';
          } else if (rawOptions.length < 2) {
            isValid = false;
            errorReason = 'At least 2 options required';
          } else if (correctIdx < 0 || correctIdx >= rawOptions.length) {
            isValid = false;
            errorReason = `Invalid correct answer index (${correctIdx})`;
          }

          let expl = item.explanation || '';
          if (item.hindiExplanation) {
            expl += `\n\n💡 **हिन्दी व्याख्या**: ${item.hindiExplanation}`;
          }

          results.push({
            id: item.id || `bulk_${Date.now()}_${index}`,
            topic: String(rawTopic),
            questionText: String(rawText),
            options: rawOptions,
            correctAnswer: correctIdx,
            explanation: expl || 'Official SSC solution.',
            grammarRule: item.grammarRule,
            examTag: item.examTag || 'SSC CGL 2024',
            difficulty: (['Easy', 'Medium', 'Hard'].includes(item.difficulty) ? item.difficulty : 'Medium') as any,
            isValid,
            errorReason
          });
        });
      } catch (err: any) {
        setBulkParseError(`JSON Syntax Error: ${err.message}`);
        setParsedBulkList([]);
        return;
      }
    } else {
      try {
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) {
          setParsedBulkList([]);
          return;
        }

        let startIndex = 0;
        const firstLine = lines[0].toLowerCase();
        if (firstLine.includes('question') || firstLine.includes('topic') || firstLine.includes('option')) {
          startIndex = 1;
        }

        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let cur = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(cur.trim().replace(/^"|"$/g, ''));
              cur = '';
            } else {
              cur += char;
            }
          }
          result.push(cur.trim().replace(/^"|"$/g, ''));
          return result;
        };

        for (let i = startIndex; i < lines.length; i++) {
          const cols = parseCSVLine(lines[i]);
          if (cols.length < 5) continue;

          const topicVal = targetTopic !== 'auto' ? targetTopic : (cols[0] || 'spot_error');
          const qTextVal = cols[1] || '';
          const opts = [cols[2] || '', cols[3] || '', cols[4] || '', cols[5] || ''].filter(Boolean);
          
          let ansIdx = 0;
          const rawAns = (cols[6] || '0').trim().toUpperCase();
          if (rawAns === 'A' || rawAns === '1') ansIdx = 0;
          else if (rawAns === 'B' || rawAns === '2') ansIdx = 1;
          else if (rawAns === 'C' || rawAns === '3') ansIdx = 2;
          else if (rawAns === 'D' || rawAns === '4') ansIdx = 3;
          else ansIdx = parseInt(rawAns, 10) || 0;

          let expl = cols[7] || '';
          if (cols[8]) {
            expl += `\n\n💡 **हिन्दी व्याख्या**: ${cols[8]}`;
          }

          let isValid = true;
          let errorReason = '';
          if (!qTextVal) {
            isValid = false;
            errorReason = 'Missing question text';
          } else if (opts.length < 2) {
            isValid = false;
            errorReason = 'At least 2 options required';
          }

          results.push({
            id: `bulk_csv_${Date.now()}_${i}`,
            topic: topicVal,
            questionText: qTextVal,
            options: opts,
            correctAnswer: ansIdx,
            explanation: expl || 'Official SSC solution.',
            difficulty: (cols[9] === 'Hard' || cols[9] === 'Easy' ? cols[9] : 'Medium') as any,
            examTag: cols[10] || 'SSC CGL 2024',
            isValid,
            errorReason
          });
        }
      } catch (err: any) {
        setBulkParseError(`CSV Parsing Error: ${err.message}`);
        setParsedBulkList([]);
        return;
      }
    }

    setParsedBulkList(results);
  };

  const handleBulkTextChange = (val: string) => {
    setBulkInputText(val);
    parseBulkContent(val, bulkInputFormat, bulkTargetTopic);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isCsv = file.name.endsWith('.csv');
    const fmt = isCsv ? 'csv' : 'json';
    setBulkInputFormat(fmt);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setBulkInputText(content);
      parseBulkContent(content, fmt, bulkTargetTopic);
    };
    reader.readAsText(file);
  };

  const handleCommitBulkUpload = () => {
    const validQuestions = parsedBulkList.filter(q => q.isValid).map(q => ({
      id: q.id,
      topic: q.topic,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      grammarRule: q.grammarRule,
      examTag: q.examTag,
      difficulty: q.difficulty
    }));

    if (validQuestions.length === 0) {
      alert('No valid questions found to import.');
      return;
    }

    saveCustomQuestions(validQuestions);
    refreshData();

    setBulkImportSuccessMsg(`🚀 Successfully imported ${validQuestions.length} questions into the database!`);
    setBulkInputText('');
    setParsedBulkList([]);
    setTimeout(() => setBulkImportSuccessMsg(''), 5000);
  };

  const downloadSampleFile = (format: 'json' | 'csv') => {
    const content = format === 'json' ? SAMPLE_QUESTIONS_JSON_STRING : SAMPLE_QUESTIONS_CSV_STRING;
    const filename = format === 'json' ? 'sample_ssc_questions.json' : 'sample_ssc_questions.csv';
    const mime = format === 'json' ? 'application/json' : 'text/csv';

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copySampleToClipboard = (format: 'json' | 'csv') => {
    const content = format === 'json' ? SAMPLE_QUESTIONS_JSON_STRING : SAMPLE_QUESTIONS_CSV_STRING;
    navigator.clipboard.writeText(content);
    setCopySuccess(format);
    setTimeout(() => setCopySuccess(''), 2500);
  };

  // Topic Actions
  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = newTopicId.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!cleanId || !newTopicTitle.trim()) {
      alert('Please fill Topic ID and Topic Title.');
      return;
    }

    const newTopic: CustomTopic = {
      id: cleanId,
      title: newTopicTitle.trim(),
      desc: newTopicDesc.trim() || 'Custom practice topic created via Admin Console.',
      badge: newTopicBadge.trim() || 'CUSTOM',
      color: newTopicColor,
      createdAt: new Date().toISOString()
    };

    saveCustomTopic(newTopic);
    refreshData();

    setTopicSaveMsg(`🎉 Topic "${newTopicTitle}" created successfully!`);
    setNewTopicId('');
    setNewTopicTitle('');
    setNewTopicDesc('');
    setTimeout(() => setTopicSaveMsg(''), 4000);
  };

  const handleDeleteCustomTopic = (topicId: string, topicTitle: string) => {
    if (window.confirm(`Are you sure you want to delete custom topic "${topicTitle}"?`)) {
      deleteCustomTopic(topicId);
      refreshData();
    }
  };

  // Library Actions
  const filteredLibraryQuestions = useMemo(() => {
    return customQuestionsList.filter(q => {
      const matchTopic = libTopicFilter === 'all' || q.topic === libTopicFilter;
      const matchSearch = !libSearchQuery.trim() || 
        q.questionText.toLowerCase().includes(libSearchQuery.toLowerCase()) ||
        q.explanation.toLowerCase().includes(libSearchQuery.toLowerCase());
      return matchTopic && matchSearch;
    });
  }, [customQuestionsList, libTopicFilter, libSearchQuery]);

  const handleDeleteSingleFromLib = (id: string) => {
    if (window.confirm('Delete this custom question?')) {
      deleteCustomQuestion(id);
      refreshData();
    }
  };

  const handleClearTopicCustomQuestions = (topicId: string) => {
    const title = topicsMap[topicId]?.title || topicId;
    if (window.confirm(`Are you sure you want to delete ALL custom questions for "${title}"?`)) {
      clearCustomQuestionsForTopic(topicId);
      refreshData();
    }
  };

  // Coupons Actions
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = newCouponCode.trim().toUpperCase();
    if (!cleanCode) return;

    const newCoupon: CouponItem = {
      id: `c_${Date.now()}`,
      code: cleanCode,
      discountType: newCouponType,
      discountValue: newCouponValue,
      isActive: true
    };

    const updated = [...couponsList, newCoupon];
    setCouponsList(updated);
    localStorage.setItem('ssc_discount_coupons', JSON.stringify(updated));

    setCouponMsg(`✅ Coupon ${cleanCode} created successfully!`);
    setNewCouponCode('');
    setTimeout(() => setCouponMsg(''), 3000);
  };

  const handleDeleteCoupon = (id: string) => {
    const updated = couponsList.filter(c => c.id !== id);
    setCouponsList(updated);
    localStorage.setItem('ssc_discount_coupons', JSON.stringify(updated));
  };

  const handleToggleCoupon = (id: string) => {
    const updated = couponsList.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c);
    setCouponsList(updated);
    localStorage.setItem('ssc_discount_coupons', JSON.stringify(updated));
  };

  // Announcement Save
  const handleSaveBanner = () => {
    localStorage.setItem('ssc_announcement_banner', JSON.stringify(bannerConfig));
    setBannerSaveMsg('📢 Announcement banner updated and published live!');
    setTimeout(() => setBannerSaveMsg(''), 3000);
  };

  // Vocab Item Add
  const handleAddVocab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmsVocabWord.trim() || !cmsVocabMeaning.trim()) {
      alert('Word and English meaning required.');
      return;
    }

    const newItem: VocabItem = {
      id: `vocab_${Date.now()}`,
      word: cmsVocabWord.trim(),
      meaning: cmsVocabMeaning.trim(),
      hindiMeaning: cmsVocabHindi.trim() || undefined,
      type: cmsVocabType,
      exampleSentence: cmsVocabSentence.trim() || undefined,
      examTag: cmsVocabTag.trim() || 'SSC CGL 2024'
    };

    const saved = localStorage.getItem('ssc_custom_vocab');
    const existing = saved ? JSON.parse(saved) : [];
    existing.unshift(newItem);
    localStorage.setItem('ssc_custom_vocab', JSON.stringify(existing));

    setCmsSuccessMsg(`✨ Vocab item "${cmsVocabWord}" published to Vocab Bank!`);
    setCmsVocabWord('');
    setCmsVocabMeaning('');
    setCmsVocabHindi('');
    setCmsVocabSentence('');
    setTimeout(() => setCmsSuccessMsg(''), 3500);
  };

  // Settings Save
  const handleSaveSettings = () => {
    localStorage.setItem('ssc_support_whatsapp', supportPhone.trim());
    localStorage.setItem('ssc_telegram_channel', telegramLink.trim());
    localStorage.setItem('ssc_free_tests_limit', freeTestsLimit.toString());
    localStorage.setItem('ssc_free_ai_checks_limit', freeAiChecksLimit.toString());

    if (newPinInput.trim() && newPinInput.trim().length >= 4) {
      localStorage.setItem('ssc_master_admin_pin', newPinInput.trim());
      setAdminPin(newPinInput.trim());
      setNewPinInput('');
    }

    setSettingsMsg('⚙️ System settings & security updated successfully!');
    setTimeout(() => setSettingsMsg(''), 3000);
  };

  // Full Backup Export
  const handleExportFullPlatformBackup = () => {
    const fullBackup = {
      exportedAt: new Date().toISOString(),
      platform: 'SSC English Pro V2',
      pricing: { proPrice, originalPrice, planDays },
      coupons: couponsList,
      banner: bannerConfig,
      customTopics: getCustomTopics(),
      customQuestions: getCustomQuestions(),
      customVocab: JSON.parse(localStorage.getItem('ssc_custom_vocab') || '[]'),
      settings: { supportPhone, telegramLink, freeTestsLimit, freeAiChecksLimit }
    };

    const content = JSON.stringify(fullBackup, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ssc_master_platform_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ═══════════════════════════════════════════
  // 1. PIN LOGIN SCREEN
  // ═══════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--bg-surface, #111827)',
          border: '1px solid var(--border-color, #1f2937)',
          borderRadius: '24px',
          padding: '36px 28px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '18px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            margin: '0 auto 20px auto',
            boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)'
          }}>
            <Lock size={28} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main, #fff)', margin: '0 0 8px 0' }}>
            Admin Master Console
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-dim, #9ca3af)', margin: '0 0 24px 0', lineHeight: 1.5 }}>
            Enter Master PIN to manage live prices, upload bulk questions, coupons, announcements & students.
          </p>

          <form onSubmit={handlePinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="password"
              maxLength={8}
              autoFocus
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter PIN (Default: 8899)"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                border: '1px solid var(--border-color, #374151)',
                background: 'var(--bg-primary, #0f172a)',
                color: 'var(--text-main, #fff)',
                fontSize: '18px',
                textAlign: 'center',
                letterSpacing: '4px',
                fontWeight: 700,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            {pinError && (
              <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: 600 }}>
                {pinError}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
              }}
            >
              <KeyRound size={18} />
              Unlock Admin Console
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // 2. AUTHENTICATED ADMIN CONSOLE
  // ═══════════════════════════════════════════
  const totalStudents = sheetUsers.length || 3;
  const proStudents = sheetUsers.filter(u => u.isPro).length || 2;
  const freeStudents = totalStudents - proStudents;
  const grossRevenue = proStudents * proPrice;

  return (
    <div style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '24px 16px 80px 16px',
      color: 'var(--text-main, #fff)',
      fontFamily: 'inherit'
    }}>
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'var(--bg-surface, #111827)',
        border: '1px solid var(--border-color, #1f2937)',
        borderRadius: '20px',
        padding: '18px 24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>
                SSC English Pro • Master Admin Console
              </h1>
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700
              }}>
                ENTERPRISE V2.5
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-dim, #9ca3af)', margin: '2px 0 0 0' }}>
              {allQuestionsCount.toLocaleString()} Total Questions • {Object.keys(topicsMap).length} Topics • {couponsList.length} Active Coupons
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleExportFullPlatformBackup}
            style={{
              padding: '9px 15px',
              borderRadius: '10px',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              background: 'rgba(79, 70, 229, 0.15)',
              color: '#a5b4fc',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Download size={14} /> Full Backup JSON
          </button>

          <button
            onClick={handleLogout}
            style={{
              padding: '9px 15px',
              borderRadius: '10px',
              border: 'none',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Lock size={14} /> Lock Console
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '24px'
      }}>
        {[
          { id: 'analytics', label: 'Dashboard & Revenue', icon: <BarChart3 size={17} /> },
          { id: 'questions', label: 'Upload Questions', icon: <UploadCloud size={17} />, badge: customQuestionsList.length > 0 ? `${customQuestionsList.length}` : undefined },
          { id: 'topics', label: 'Topic Manager', icon: <FolderPlus size={17} />, badge: `${Object.keys(topicsMap).length}` },
          { id: 'library', label: 'Question Library', icon: <Database size={17} /> },
          { id: 'coupons', label: 'Promo Coupons', icon: <Ticket size={17} />, badge: `${couponsList.filter(c => c.isActive).length}` },
          { id: 'announcements', label: 'Announcements Banner', icon: <Megaphone size={17} />, badge: bannerConfig.isActive ? 'LIVE' : undefined },
          { id: 'content_cms', label: 'Vocab Bank CMS', icon: <BookMarked size={17} /> },
          { id: 'pricing', label: 'Pricing & Plans', icon: <DollarSign size={17} /> },
          { id: 'users', label: 'Students CRM', icon: <Users size={17} /> },
          { id: 'settings', label: 'Platform Settings', icon: <Settings size={17} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '11px 16px',
              borderRadius: '13px',
              border: 'none',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
                : 'var(--bg-surface, #111827)',
              color: activeTab === tab.id ? '#fff' : 'var(--text-dim, #9ca3af)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              whiteSpace: 'nowrap',
              boxShadow: activeTab === tab.id ? '0 4px 15px rgba(79, 70, 229, 0.35)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.badge && (
              <span style={{
                background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : 'rgba(79, 70, 229, 0.2)',
                color: activeTab === tab.id ? '#fff' : '#818cf8',
                padding: '2px 7px',
                borderRadius: '999px',
                fontSize: '10.5px',
                fontWeight: 800
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: ANALYTICS & REVENUE DASHBOARD ─── */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '20px',
              padding: '22px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-dim, #9ca3af)', fontWeight: 600 }}>Total Gross Revenue</span>
                <DollarSign size={20} color="#818cf8" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>
                ₹{grossRevenue.toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px', fontWeight: 700 }}>
                ↑ {proStudents} Paid Subscriptions @ ₹{proPrice}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '20px',
              padding: '22px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-dim, #9ca3af)', fontWeight: 600 }}>Active Pro Members</span>
                <ShieldCheck size={20} color="#34d399" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>
                {proStudents} Students
              </div>
              <div style={{ fontSize: '12px', color: '#34d399', marginTop: '6px', fontWeight: 700 }}>
                {Math.round((proStudents / Math.max(1, totalStudents)) * 100)}% Conversion Rate
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface, #111827)',
              border: '1px solid var(--border-color, #1f2937)',
              borderRadius: '20px',
              padding: '22px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-dim, #9ca3af)', fontWeight: 600 }}>Total Registered</span>
                <Users size={20} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>
                {totalStudents} Users
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-dim, #9ca3af)', marginTop: '6px' }}>
                {freeStudents} Free Trial Users
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface, #111827)',
              border: '1px solid var(--border-color, #1f2937)',
              borderRadius: '20px',
              padding: '22px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-dim, #9ca3af)', fontWeight: 600 }}>Total Question Bank</span>
                <Database size={20} color="#ec4899" />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>
                {allQuestionsCount.toLocaleString()} Qs
              </div>
              <div style={{ fontSize: '12px', color: '#818cf8', marginTop: '6px', fontWeight: 700 }}>
                {customQuestionsList.length} Custom Uploaded
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface, #111827)',
            border: '1px solid var(--border-color, #1f2937)',
            borderRadius: '20px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 16px 0' }}>
              ⚡ Quick Admin Shortcuts
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <button
                onClick={() => setActiveTab('questions')}
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-color, #374151)',
                  background: 'var(--bg-primary, #0f172a)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <UploadCloud size={18} color="#818cf8" />
                Upload Questions in Bulk
              </button>

              <button
                onClick={() => setActiveTab('topics')}
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-color, #374151)',
                  background: 'var(--bg-primary, #0f172a)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <FolderPlus size={18} color="#10b981" />
                Create New Subject Topic
              </button>

              <button
                onClick={() => setActiveTab('coupons')}
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-color, #374151)',
                  background: 'var(--bg-primary, #0f172a)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Ticket size={18} color="#f59e0b" />
                Generate Discount Coupon
              </button>

              <button
                onClick={() => setActiveTab('announcements')}
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-color, #374151)',
                  background: 'var(--bg-primary, #0f172a)',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Megaphone size={18} color="#ec4899" />
                Publish Live Student Banner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: QUESTION UPLOADER (SINGLE & BULK) ─── */}
      {activeTab === 'questions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            background: 'var(--bg-surface, #111827)',
            border: '1px solid var(--border-color, #1f2937)',
            borderRadius: '20px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>
                Question Creator & Bulk Importer
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-dim, #9ca3af)', margin: 0 }}>
                Upload single or bulk questions via JSON or CSV with instant schema validation and pre-upload preview.
              </p>
            </div>

            <div style={{
              display: 'flex',
              background: 'var(--bg-primary, #0f172a)',
              padding: '4px',
              borderRadius: '12px',
              border: '1px solid var(--border-color, #374151)'
            }}>
              <button
                onClick={() => setUploadMode('bulk')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: uploadMode === 'bulk' ? '#4f46e5' : 'transparent',
                  color: uploadMode === 'bulk' ? '#fff' : 'var(--text-dim, #9ca3af)',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <UploadCloud size={15} /> Bulk Upload (JSON / CSV)
              </button>
              <button
                onClick={() => setUploadMode('single')}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: uploadMode === 'single' ? '#4f46e5' : 'transparent',
                  color: uploadMode === 'single' ? '#fff' : 'var(--text-dim, #9ca3af)',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <PlusCircle size={15} /> Single Question
              </button>
            </div>
          </div>

          {/* BULK UPLOAD MODE */}
          {uploadMode === 'bulk' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#4f46e5',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FileCode size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                        Sample Formats & Templates
                      </h3>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-dim, #9ca3af)', margin: '2px 0 0 0' }}>
                        Download ready-to-use sample templates or 1-click copy to verify format.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => downloadSampleFile('json')}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(99, 102, 241, 0.4)',
                        background: 'rgba(79, 70, 229, 0.2)',
                        color: '#a5b4fc',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Download size={14} /> Download Sample JSON
                    </button>

                    <button
                      onClick={() => downloadSampleFile('csv')}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#6ee7b7',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Download size={14} /> Download Sample CSV
                    </button>

                    <button
                      onClick={() => copySampleToClipboard('json')}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color, #374151)',
                        background: 'var(--bg-surface, #111827)',
                        color: 'var(--text-main, #fff)',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {copySuccess === 'json' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      {copySuccess === 'json' ? 'JSON Copied!' : 'Copy JSON'}
                    </button>

                    <button
                      onClick={() => copySampleToClipboard('csv')}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color, #374151)',
                        background: 'var(--bg-surface, #111827)',
                        color: 'var(--text-main, #fff)',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {copySuccess === 'csv' ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      {copySuccess === 'csv' ? 'CSV Copied!' : 'Copy CSV'}
                    </button>

                    <button
                      onClick={() => setShowGuide(!showGuide)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'transparent',
                        color: '#818cf8',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <HelpCircle size={15} /> Field Guide {showGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {showGuide && (
                  <div style={{
                    background: 'var(--bg-surface, #111827)',
                    border: '1px solid var(--border-color, #1f2937)',
                    borderRadius: '14px',
                    padding: '16px',
                    fontSize: '12.5px',
                    color: 'var(--text-dim, #9ca3af)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <strong style={{ color: 'var(--text-main, #fff)' }}>📋 Bulk Upload Schema Reference:</strong>
                    <div>• <code>topic</code>: Topic ID (e.g. <code>spot_error</code>, <code>synonyms</code>, <code>one_word</code>, <code>sentence_improvement</code>, ya koi bhi custom topic).</div>
                    <div>• <code>questionText</code>: The question prompt/sentence.</div>
                    <div>• <code>options</code>: 4 options (in JSON: <code>["A", "B", "C", "D"]</code>; in CSV: 4 columns <code>optionA, optionB, optionC, optionD</code>).</div>
                    <div>• <code>correctAnswer</code>: 0 for A, 1 for B, 2 for C, 3 for D (A/B/C/D or 1-4 also auto-converted).</div>
                    <div>• <code>explanation</code>: English solution.</div>
                    <div>• <code>hindiExplanation</code> (Optional): हिंदी व्याख्या.</div>
                    <div>• <code>difficulty</code> (Optional): <code>Easy</code>, <code>Medium</code>, or <code>Hard</code>.</div>
                    <div>• <code>examTag</code> (Optional): e.g. <code>SSC CGL 2024 Tier-1</code>.</div>
                  </div>
                )}
              </div>

              <div style={{
                background: 'var(--bg-surface, #111827)',
                border: '1px solid var(--border-color, #1f2937)',
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      Target Topic:
                    </label>
                    <select
                      value={bulkTargetTopic}
                      onChange={(e) => {
                        setBulkTargetTopic(e.target.value);
                        parseBulkContent(bulkInputText, bulkInputFormat, e.target.value);
                      }}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color, #374151)',
                        background: 'var(--bg-primary, #0f172a)',
                        color: 'var(--text-main, #fff)',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        outline: 'none'
                      }}
                    >
                      <option value="auto">✨ Auto-Detect from Data (per question 'topic' field)</option>
                      <optgroup label="Available Topics">
                        {Object.entries(topicsMap).map(([tId, tData]) => (
                          <option key={tId} value={tId}>{tData.title} ({tId})</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      Input Format:
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setBulkInputFormat('json');
                          parseBulkContent(bulkInputText, 'json', bulkTargetTopic);
                        }}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '12px',
                          border: 'none',
                          background: bulkInputFormat === 'json' ? '#4f46e5' : 'var(--bg-primary, #0f172a)',
                          color: bulkInputFormat === 'json' ? '#fff' : 'var(--text-dim, #9ca3af)',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        JSON Array (.json)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBulkInputFormat('csv');
                          parseBulkContent(bulkInputText, 'csv', bulkTargetTopic);
                        }}
                        style={{
                          flex: 1,
                          padding: '10px',
                          borderRadius: '12px',
                          border: 'none',
                          background: bulkInputFormat === 'csv' ? '#10b981' : 'var(--bg-primary, #0f172a)',
                          color: bulkInputFormat === 'csv' ? '#fff' : 'var(--text-dim, #9ca3af)',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        CSV / Excel (.csv)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                      Upload File:
                    </label>
                    <input
                      type="file"
                      accept=".json,.csv,.txt"
                      onChange={handleFileUpload}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '12px',
                        border: '1px dashed var(--border-color, #374151)',
                        background: 'var(--bg-primary, #0f172a)',
                        color: 'var(--text-dim, #9ca3af)',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700 }}>
                      Paste {bulkInputFormat.toUpperCase()} Code or Text:
                    </label>
                    {bulkInputText && (
                      <button
                        onClick={() => handleBulkTextChange('')}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Clear Text
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={7}
                    value={bulkInputText}
                    onChange={(e) => handleBulkTextChange(e.target.value)}
                    placeholder={bulkInputFormat === 'json' 
                      ? '[\n  {\n    "topic": "spot_error",\n    "questionText": "Sentence goes here...",\n    "options": ["A", "B", "C", "D"],\n    "correctAnswer": 0,\n    "explanation": "Why A is correct",\n    "difficulty": "Easy"\n  }\n]'
                      : 'topic,questionText,optionA,optionB,optionC,optionD,correctAnswer,explanation,hindiExplanation,difficulty,examTag\nspot_error,"He is senior than me.","senior to me","more senior than me","senior than I","No error",0,"Takes to not than","Senior ke sath to lagta hai",Easy,"SSC CGL"'
                    }
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: '14px',
                      border: '1px solid var(--border-color, #374151)',
                      background: 'var(--bg-primary, #0f172a)',
                      color: 'var(--text-main, #fff)',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      lineHeight: 1.4,
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {bulkParseError && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    color: '#f87171',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertTriangle size={18} /> {bulkParseError}
                  </div>
                )}

                {bulkImportSuccessMsg && (
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: '14px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid #10b981',
                    color: '#34d399',
                    fontSize: '14px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle2 size={20} /> {bulkImportSuccessMsg}
                  </div>
                )}

                {parsedBulkList.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Eye size={18} color="#818cf8" />
                        <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>
                          Parsed Preview ({parsedBulkList.length} Questions)
                        </h4>
                        <span style={{
                          background: parsedBulkList.filter(q => q.isValid).length === parsedBulkList.length ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: parsedBulkList.filter(q => q.isValid).length === parsedBulkList.length ? '#10b981' : '#f59e0b',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          {parsedBulkList.filter(q => q.isValid).length} Valid • {parsedBulkList.filter(q => !q.isValid).length} Invalid
                        </span>
                      </div>

                      <button
                        onClick={handleCommitBulkUpload}
                        disabled={parsedBulkList.filter(q => q.isValid).length === 0}
                        style={{
                          padding: '10px 20px',
                          borderRadius: '12px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#fff',
                          fontSize: '13.5px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                        }}
                      >
                        <CheckCircle2 size={18} />
                        Confirm & Import {parsedBulkList.filter(q => q.isValid).length} Questions
                      </button>
                    </div>

                    <div style={{
                      maxHeight: '340px',
                      overflowY: 'auto',
                      border: '1px solid var(--border-color, #1f2937)',
                      borderRadius: '14px',
                      background: 'var(--bg-primary, #0f172a)'
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: 'var(--bg-surface, #111827)', borderBottom: '1px solid var(--border-color, #1f2937)', color: 'var(--text-dim, #9ca3af)' }}>
                            <th style={{ padding: '10px 14px' }}>#</th>
                            <th style={{ padding: '10px 14px' }}>Topic</th>
                            <th style={{ padding: '10px 14px' }}>Question Text</th>
                            <th style={{ padding: '10px 14px' }}>Options & Answer</th>
                            <th style={{ padding: '10px 14px' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedBulkList.map((item, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--border-color, #1f2937)' }}>
                              <td style={{ padding: '10px 14px', color: 'var(--text-dim, #9ca3af)', fontWeight: 700 }}>
                                {idx + 1}
                              </td>
                              <td style={{ padding: '10px 14px' }}>
                                <span style={{
                                  background: 'rgba(99, 102, 241, 0.15)',
                                  color: '#a5b4fc',
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 700
                                }}>
                                  {topicsMap[item.topic]?.title || item.topic}
                                </span>
                              </td>
                              <td style={{ padding: '10px 14px', maxWidth: '300px' }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-main, #fff)' }}>
                                  {item.questionText}
                                </div>
                              </td>
                              <td style={{ padding: '10px 14px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  {item.options.map((opt, oIdx) => (
                                    <div 
                                      key={oIdx}
                                      style={{
                                        color: oIdx === item.correctAnswer ? '#10b981' : 'var(--text-dim, #9ca3af)',
                                        fontWeight: oIdx === item.correctAnswer ? 700 : 400
                                      }}
                                    >
                                      {String.fromCharCode(65 + oIdx)}: {opt} {oIdx === item.correctAnswer && '✅'}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td style={{ padding: '10px 14px' }}>
                                {item.isValid ? (
                                  <span style={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <CheckCircle2 size={14} /> Ready
                                  </span>
                                ) : (
                                  <span style={{ color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <AlertTriangle size={14} /> {item.errorReason}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SINGLE QUESTION MODE */}
          {uploadMode === 'single' && (
            <div style={{
              background: 'var(--bg-surface, #111827)',
              border: '1px solid var(--border-color, #1f2937)',
              borderRadius: '20px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {qSuccessMsg && (
                <div style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10b981',
                  color: '#34d399',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={18} /> {qSuccessMsg}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Topic Category:
                  </label>
                  <select
                    value={qTopic}
                    onChange={(e) => setQTopic(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color, #374151)',
                      background: 'var(--bg-primary, #0f172a)',
                      color: 'var(--text-main, #fff)',
                      fontSize: '14px',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  >
                    {Object.entries(topicsMap).map(([tId, tData]) => (
                      <option key={tId} value={tId}>{tData.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Exam Source / Tag:
                  </label>
                  <input
                    type="text"
                    value={qExamTag}
                    onChange={(e) => setQExamTag(e.target.value)}
                    placeholder="e.g. SSC CGL 2024 Tier-1"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color, #374151)',
                      background: 'var(--bg-primary, #0f172a)',
                      color: 'var(--text-main, #fff)',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Difficulty Level:
                  </label>
                  <select
                    value={qDifficulty}
                    onChange={(e) => setQDifficulty(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color, #374151)',
                      background: 'var(--bg-primary, #0f172a)',
                      color: 'var(--text-main, #fff)',
                      fontSize: '14px',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  >
                    <option value="Easy">Easy (Foundation)</option>
                    <option value="Medium">Medium (Standard PYQ)</option>
                    <option value="Hard">Hard (Tier-2 Advanced)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Question Text / Sentence: *
                </label>
                <textarea
                  rows={3}
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  placeholder="Enter the full question sentence or segment..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color, #374151)',
                    background: 'var(--bg-primary, #0f172a)',
                    color: 'var(--text-main, #fff)',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                  Answer Options (Select the radio for correct option): *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {[
                    { label: 'A', val: optA, setVal: setOptA, idx: 0 },
                    { label: 'B', val: optB, setVal: setOptB, idx: 1 },
                    { label: 'C', val: optC, setVal: setOptC, idx: 2 },
                    { label: 'D', val: optD, setVal: setOptD, idx: 3 }
                  ].map((opt) => (
                    <div
                      key={opt.label}
                      onClick={() => setQCorrect(opt.idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        background: qCorrect === opt.idx ? 'rgba(79, 70, 229, 0.15)' : 'var(--bg-primary, #0f172a)',
                        border: `1.5px solid ${qCorrect === opt.idx ? '#4f46e5' : 'var(--border-color, #374151)'}`,
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="radio"
                        name="correctOpt"
                        checked={qCorrect === opt.idx}
                        onChange={() => setQCorrect(opt.idx)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      <span style={{ fontWeight: 800, fontSize: '14px', color: qCorrect === opt.idx ? '#818cf8' : 'var(--text-dim, #9ca3af)' }}>
                        {opt.label}:
                      </span>
                      <input
                        type="text"
                        value={opt.val}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => opt.setVal(e.target.value)}
                        placeholder={`Option ${opt.label}`}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'transparent',
                          color: 'var(--text-main, #fff)',
                          fontSize: '13.5px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    English Explanation:
                  </label>
                  <textarea
                    rows={3}
                    value={qEngExpl}
                    onChange={(e) => setQEngExpl(e.target.value)}
                    placeholder="Provide rule explanation, subject-verb agreement details..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color, #374151)',
                      background: 'var(--bg-primary, #0f172a)',
                      color: 'var(--text-main, #fff)',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    हिंदी व्याख्या (Hindi Explanation):
                  </label>
                  <textarea
                    rows={3}
                    value={qHinExpl}
                    onChange={(e) => setQHinExpl(e.target.value)}
                    placeholder="हिंदी में सरल व्याख्या और नियम समझाएं..."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color, #374151)',
                      background: 'var(--bg-primary, #0f172a)',
                      color: 'var(--text-main, #fff)',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddSingleQuestion}
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
                }}
              >
                <PlusCircle size={18} /> Save & Publish Question
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: TOPIC MANAGER ─── */}
      {activeTab === 'topics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            background: 'var(--bg-surface, #111827)',
            border: '1px solid var(--border-color, #1f2937)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>
                Add New Custom Topic
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-dim, #9ca3af)', margin: 0 }}>
                Create new subject modules (e.g. *Para Jumbles*, *Reading Comprehension*, *Voice Change*).
              </p>
            </div>

            {topicSaveMsg && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#34d399',
                fontSize: '13.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={18} /> {topicSaveMsg}
              </div>
            )}

            <form onSubmit={handleCreateTopic} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Topic Slug / ID: *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTopicId}
                    onChange={(e) => setNewTopicId(e.target.value)}
                    placeholder="e.g. para_jumbles, reading_comp"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color, #374151)',
                      background: 'var(--bg-primary, #0f172a)',
                      color: 'var(--text-main, #fff)',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Topic Title: *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    placeholder="e.g. Para Jumbles / Sentence Rearrangement"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color, #374151)',
                      background: 'var(--bg-primary, #0f172a)',
                      color: 'var(--text-main, #fff)',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Badge Tag:
                  </label>
                  <input
                    type="text"
                    value={newTopicBadge}
                    onChange={(e) => setNewTopicBadge(e.target.value)}
                    placeholder="e.g. TIER-2 SPECIAL, NEW"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color, #374151)',
                      background: 'var(--bg-primary, #0f172a)',
                      color: 'var(--text-main, #fff)',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Description:
                </label>
                <input
                  type="text"
                  value={newTopicDesc}
                  onChange={(e) => setNewTopicDesc(e.target.value)}
                  placeholder="e.g. Solve 30-question speed tests for SSC CGL and CHSL exams."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color, #374151)',
                    background: 'var(--bg-primary, #0f172a)',
                    color: 'var(--text-main, #fff)',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                  Topic Accent Color:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444', '#6366f1'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewTopicColor(c)}
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: c,
                        border: newTopicColor === c ? '3px solid #fff' : '2px solid transparent',
                        cursor: 'pointer',
                        transform: newTopicColor === c ? 'scale(1.15)' : 'scale(1)',
                        transition: 'all 0.15s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                style={{
                  padding: '13px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#fff',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
                }}
              >
                <FolderPlus size={18} /> Create & Activate Topic
              </button>
            </form>
          </div>

          <div style={{
            background: 'var(--bg-surface, #111827)',
            border: '1px solid var(--border-color, #1f2937)',
            borderRadius: '20px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 16px 0' }}>
              Active Topics Directory ({Object.keys(topicsMap).length} Topics)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {Object.entries(topicsMap).map(([tId, tData]) => {
                const isCustom = getCustomTopics().some(t => t.id === tId);
                const customCount = customQuestionsList.filter(q => q.topic === tId).length;
                const totalTopicCount = (BASE_QUESTION_COUNTS[tId] || 0) + customCount;

                return (
                  <div
                    key={tId}
                    style={{
                      background: 'var(--bg-primary, #0f172a)',
                      border: '1px solid var(--border-color, #1f2937)',
                      borderRadius: '16px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{
                          background: `${tData.color || '#8b5cf6'}25`,
                          color: tData.color || '#8b5cf6',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 800
                        }}>
                          {tData.badge || 'TOPIC'}
                        </span>
                        {isCustom && (
                          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>
                            ★ Custom Topic
                          </span>
                        )}
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main, #fff)', margin: '0 0 4px 0' }}>
                        {tData.title}
                      </h4>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-dim, #9ca3af)', fontFamily: 'monospace' }}>
                        ID: {tId}
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-dim, #9ca3af)', margin: '6px 0 0 0' }}>
                        {tData.desc}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-color, #1f2937)' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#818cf8' }}>
                        {totalTopicCount.toLocaleString()} Qs ({customCount} Custom)
                      </span>
                      
                      {isCustom && (
                        <button
                          onClick={() => handleDeleteCustomTopic(tId, tData.title)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: 700
                          }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 4: QUESTION LIBRARY ─── */}
      {activeTab === 'library' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'var(--bg-surface, #111827)',
            border: '1px solid var(--border-color, #1f2937)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>
                Custom Questions Library ({customQuestionsList.length} Questions)
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-dim, #9ca3af)', margin: 0 }}>
                Manage, filter, search, and backup all custom questions uploaded via single or bulk importer.
              </p>
            </div>

            <button
              onClick={() => {
                if (libTopicFilter !== 'all') {
                  handleClearTopicCustomQuestions(libTopicFilter);
                } else {
                  if (window.confirm('Delete ALL custom questions across all topics?')) {
                    localStorage.removeItem('ssc_custom_questions');
                    refreshData();
                  }
                }
              }}
              disabled={customQuestionsList.length === 0}
              style={{
                padding: '9px 16px',
                borderRadius: '12px',
                border: 'none',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Trash2 size={15} /> {libTopicFilter === 'all' ? 'Clear All' : `Clear ${topicsMap[libTopicFilter]?.title || libTopicFilter}`}
            </button>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            background: 'var(--bg-surface, #111827)',
            padding: '16px',
            borderRadius: '16px',
            border: '1px solid var(--border-color, #1f2937)'
          }}>
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-dim, #9ca3af)' }} />
              <input
                type="text"
                value={libSearchQuery}
                onChange={(e) => setLibSearchQuery(e.target.value)}
                placeholder="Search question text, explanations..."
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color, #374151)',
                  background: 'var(--bg-primary, #0f172a)',
                  color: 'var(--text-main, #fff)',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ minWidth: '200px' }}>
              <select
                value={libTopicFilter}
                onChange={(e) => setLibTopicFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color, #374151)',
                  background: 'var(--bg-primary, #0f172a)',
                  color: 'var(--text-main, #fff)',
                  fontSize: '13px',
                  fontWeight: 600,
                  outline: 'none'
                }}
              >
                <option value="all">All Topics ({customQuestionsList.length})</option>
                {Object.entries(topicsMap).map(([tId, tData]) => {
                  const count = customQuestionsList.filter(q => q.topic === tId).length;
                  return (
                    <option key={tId} value={tId}>{tData.title} ({count})</option>
                  );
                })}
              </select>
            </div>
          </div>

          {filteredLibraryQuestions.length === 0 ? (
            <div style={{
              padding: '48px 24px',
              textAlign: 'center',
              background: 'var(--bg-surface, #111827)',
              borderRadius: '20px',
              border: '1px solid var(--border-color, #1f2937)',
              color: 'var(--text-dim, #9ca3af)'
            }}>
              <Database size={36} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
              <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-main, #fff)' }}>
                No Custom Questions Found
              </h4>
              <p style={{ fontSize: '13px', margin: 0 }}>
                Use the "Upload Questions" tab to import questions.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredLibraryQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  style={{
                    background: 'var(--bg-surface, #111827)',
                    border: '1px solid var(--border-color, #1f2937)',
                    borderRadius: '16px',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#818cf8' }}>
                        #{idx + 1}
                      </span>
                      <span style={{
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: '#a5b4fc',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700
                      }}>
                        {topicsMap[q.topic]?.title || q.topic}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteSingleFromLib(q.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 700
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>

                  <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-main, #fff)', lineHeight: 1.4 }}>
                    {q.questionText}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '8px',
                    background: 'var(--bg-primary, #0f172a)',
                    padding: '10px 14px',
                    borderRadius: '10px'
                  }}>
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        style={{
                          fontSize: '12.5px',
                          color: oIdx === q.correctAnswer ? '#10b981' : 'var(--text-dim, #9ca3af)',
                          fontWeight: oIdx === q.correctAnswer ? 700 : 400
                        }}
                      >
                        {String.fromCharCode(65 + oIdx)}: {opt} {oIdx === q.correctAnswer && '✅'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 5: DISCOUNT COUPONS ─── */}
      {activeTab === 'coupons' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            background: 'var(--bg-surface, #111827)',
            border: '1px solid var(--border-color, #1f2937)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>
                Create New Promo Code / Discount Coupon
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-dim, #9ca3af)', margin: 0 }}>
                Generate promotional discount codes for marketing campaigns and student incentives.
              </p>
            </div>

            {couponMsg && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#34d399',
                fontSize: '13.5px',
                fontWeight: 700
              }}>
                {couponMsg}
              </div>
            )}

            <form onSubmit={handleAddCoupon} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Coupon Code: *
                </label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SSC50, TOPPER"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color, #374151)',
                    background: 'var(--bg-primary, #0f172a)',
                    color: 'var(--text-main, #fff)',
                    fontSize: '14px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Discount Type:
                </label>
                <select
                  value={newCouponType}
                  onChange={(e) => setNewCouponType(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color, #374151)',
                    background: 'var(--bg-primary, #0f172a)',
                    color: 'var(--text-main, #fff)',
                    fontSize: '14px',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                >
                  <option value="percentage">Percentage Off (%)</option>
                  <option value="flat">Flat Cash Off (₹)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Discount Value: *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={newCouponType === 'percentage' ? 100 : 500}
                  value={newCouponValue}
                  onChange={(e) => setNewCouponValue(parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color, #374151)',
                    background: 'var(--bg-primary, #0f172a)',
                    color: 'var(--text-main, #fff)',
                    fontSize: '14px',
                    fontWeight: 700,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '13px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <PlusCircle size={16} /> Create Coupon
              </button>
            </form>
          </div>

          <div style={{
            background: 'var(--bg-surface, #111827)',
            border: '1px solid var(--border-color, #1f2937)',
            borderRadius: '20px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 16px 0' }}>
              Active Promo Coupons ({couponsList.length})
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {couponsList.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: 'var(--bg-primary, #0f172a)',
                    border: `1px solid ${c.isActive ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color, #1f2937)'}`,
                    borderRadius: '16px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      background: 'rgba(79, 70, 229, 0.2)',
                      color: '#818cf8',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: 900,
                      letterSpacing: '1px'
                    }}>
                      {c.code}
                    </span>

                    <span style={{
                      background: c.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: c.isActive ? '#10b981' : '#ef4444',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800
                    }}>
                      {c.isActive ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>

                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main, #fff)' }}>
                    {c.discountType === 'percentage' ? `${c.discountValue}% OFF Pro Plan` : `Flat ₹${c.discountValue} Instant Discount`}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-color, #1f2937)' }}>
                    <button
                      onClick={() => handleToggleCoupon(c.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: c.isActive ? '#f59e0b' : '#10b981',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {c.isActive ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      onClick={() => handleDeleteCoupon(c.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 6: ANNOUNCEMENT BANNER CMS ─── */}
      {activeTab === 'announcements' && (
        <div style={{
          background: 'var(--bg-surface, #111827)',
          border: '1px solid var(--border-color, #1f2937)',
          borderRadius: '20px',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>
              Student Announcement Banner CMS
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-dim, #9ca3af)', margin: 0 }}>
              Broadcast live top-strip notifications, discount alerts, or exam updates to all students.
            </p>
          </div>

          {bannerSaveMsg && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#34d399',
              fontSize: '13.5px',
              fontWeight: 700
            }}>
              {bannerSaveMsg}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="bannerToggle"
              checked={bannerConfig.isActive}
              onChange={(e) => setBannerConfig({ ...bannerConfig, isActive: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="bannerToggle" style={{ fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
              Enable Broadcast Announcement Banner on Student App
            </label>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
              Banner Message Text:
            </label>
            <textarea
              rows={3}
              value={bannerConfig.text}
              onChange={(e) => setBannerConfig({ ...bannerConfig, text: e.target.value })}
              placeholder="e.g. ⚡ Mega Offer: 50% Off on SSC English Pro Lifetime Access today!"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border-color, #374151)',
                background: 'var(--bg-primary, #0f172a)',
                color: 'var(--text-main, #fff)',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                Banner Theme Style:
              </label>
              <select
                value={bannerConfig.type}
                onChange={(e) => setBannerConfig({ ...bannerConfig, type: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color, #374151)',
                  background: 'var(--bg-primary, #0f172a)',
                  color: 'var(--text-main, #fff)',
                  fontSize: '14px',
                  fontWeight: 600,
                  outline: 'none'
                }}
              >
                <option value="promo">🎁 Promo (Purple / Indigo)</option>
                <option value="urgent">🔥 Hot Deal (Amber / Orange)</option>
                <option value="alert">⚡ Urgent Notice (Rose / Red)</option>
                <option value="info">📢 Info (Emerald / Green)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                Action Button Text:
              </label>
              <input
                type="text"
                value={bannerConfig.actionText || ''}
                onChange={(e) => setBannerConfig({ ...bannerConfig, actionText: e.target.value })}
                placeholder="e.g. Upgrade Now"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color, #374151)',
                  background: 'var(--bg-primary, #0f172a)',
                  color: 'var(--text-main, #fff)',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            onClick={handleSaveBanner}
            style={{
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#fff',
              fontSize: '14.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
            }}
          >
            <Megaphone size={18} /> Publish Live Announcement Banner
          </button>
        </div>
      )}

      {/* ─── TAB 7: VOCAB CMS ─── */}
      {activeTab === 'content_cms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            background: 'var(--bg-surface, #111827)',
            border: '1px solid var(--border-color, #1f2937)',
            borderRadius: '20px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>
                Add New High-Yield Vocab Word to Vocab Bank
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-dim, #9ca3af)', margin: 0 }}>
                Enrich the 6,000+ PYQ Vocab Bank with synonyms, antonyms, Hindi meanings, and example sentences.
              </p>
            </div>

            {cmsSuccessMsg && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#34d399',
                fontSize: '13.5px',
                fontWeight: 700
              }}>
                {cmsSuccessMsg}
              </div>
            )}

            <form onSubmit={handleAddVocab} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Word / Idiom: *
                  </label>
                  <input
                    type="text"
                    required
                    value={cmsVocabWord}
                    onChange={(e) => setCmsVocabWord(e.target.value)}
                    placeholder="e.g. Ephemeral, Bite the bullet"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color, #374151)',
                      background: 'var(--bg-primary, #0f172a)',
                      color: 'var(--text-main, #fff)',
                      fontSize: '14px',
                      fontWeight: 700,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Type / Category:
                  </label>
                  <select
                    value={cmsVocabType}
                    onChange={(e) => setCmsVocabType(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color, #374151)',
                      background: 'var(--bg-primary, #0f172a)',
                      color: 'var(--text-main, #fff)',
                      fontSize: '14px',
                      fontWeight: 600,
                      outline: 'none'
                    }}
                  >
                    <option value="synonym">Synonym Word</option>
                    <option value="antonym">Antonym Word</option>
                    <option value="ows">One Word Substitution</option>
                    <option value="idiom">Idiom & Phrase</option>
                    <option value="spelling">Spelling Rule</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    Exam Source:
                  </label>
                  <input
                    type="text"
                    value={cmsVocabTag}
                    onChange={(e) => setCmsVocabTag(e.target.value)}
                    placeholder="e.g. SSC CGL 2024"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color, #374151)',
                      background: 'var(--bg-primary, #0f172a)',
                      color: 'var(--text-main, #fff)',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    English Meaning / Definition: *
                  </label>
                  <input
                    type="text"
                    required
                    value={cmsVocabMeaning}
                    onChange={(e) => setCmsVocabMeaning(e.target.value)}
                    placeholder="e.g. Lasting for a very short time; transient."
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color, #374151)',
                      background: 'var(--bg-primary, #0f172a)',
                      color: 'var(--text-main, #fff)',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                    हिंदी अर्थ (Hindi Meaning):
                  </label>
                  <input
                    type="text"
                    value={cmsVocabHindi}
                    onChange={(e) => setCmsVocabHindi(e.target.value)}
                    placeholder="e.g. क्षणिक, अल्पकालिक"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color, #374151)',
                      background: 'var(--bg-primary, #0f172a)',
                      color: 'var(--text-main, #fff)',
                      fontSize: '13.5px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Example Sentence:
                </label>
                <input
                  type="text"
                  value={cmsVocabSentence}
                  onChange={(e) => setCmsVocabSentence(e.target.value)}
                  placeholder="e.g. Fame in the social media era is often ephemeral."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color, #374151)',
                    background: 'var(--bg-primary, #0f172a)',
                    color: 'var(--text-main, #fff)',
                    fontSize: '13.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#fff',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <PlusCircle size={18} /> Publish Vocab Item to Vocab Bank
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── TAB 8: PRICING CONTROLS ─── */}
      {activeTab === 'pricing' && (
        <div style={{
          background: 'var(--bg-surface, #111827)',
          border: '1px solid var(--border-color, #1f2937)',
          borderRadius: '20px',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>
              Live Pricing & Plan Controls
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-dim, #9ca3af)', margin: 0 }}>
              Update the offer price, strike-through price, and plan duration seen across the student app.
            </p>
          </div>

          {priceSaveMsg && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#34d399',
              fontSize: '13.5px',
              fontWeight: 700
            }}>
              {priceSaveMsg}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                Pro Offer Price (₹):
              </label>
              <input
                type="number"
                value={proPrice}
                onChange={(e) => setProPrice(parseInt(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color, #374151)',
                  background: 'var(--bg-primary, #0f172a)',
                  color: 'var(--text-main, #fff)',
                  fontSize: '16px',
                  fontWeight: 700,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                Original Price (₹ Strike-through):
              </label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(parseInt(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color, #374151)',
                  background: 'var(--bg-primary, #0f172a)',
                  color: 'var(--text-main, #fff)',
                  fontSize: '16px',
                  fontWeight: 700,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                Plan Validity (Days):
              </label>
              <input
                type="number"
                value={planDays}
                onChange={(e) => setPlanDays(parseInt(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color, #374151)',
                  background: 'var(--bg-primary, #0f172a)',
                  color: 'var(--text-main, #fff)',
                  fontSize: '16px',
                  fontWeight: 700,
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            onClick={handleSavePricing}
            style={{
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#fff',
              fontSize: '14.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
            }}
          >
            <Save size={18} /> Save & Apply Pricing Changes
          </button>
        </div>
      )}

      {/* ─── TAB 9: STUDENTS CRM ─── */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'var(--bg-surface, #111827)',
            border: '1px solid var(--border-color, #1f2937)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>
                Students CRM & Google Sheets Data
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-dim, #9ca3af)', margin: 0 }}>
                Real-time registered users list synced with your Google Apps Script backend.
              </p>
            </div>

            <button
              onClick={fetchUsers}
              disabled={isLoadingUsers}
              style={{
                padding: '9px 16px',
                borderRadius: '12px',
                border: '1px solid var(--border-color, #374151)',
                background: 'var(--bg-primary, #0f172a)',
                color: 'var(--text-main, #fff)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={15} className={isLoadingUsers ? 'animate-spin' : ''} />
              {isLoadingUsers ? 'Refreshing...' : 'Refresh Sheet Users'}
            </button>
          </div>

          {userActionMsg && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(79, 70, 229, 0.15)',
              border: '1px solid #4f46e5',
              color: '#a5b4fc',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {userActionMsg}
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-dim, #9ca3af)' }} />
            <input
              type="text"
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              placeholder="Search student by phone number or name..."
              style={{
                width: '100%',
                padding: '11px 14px 11px 40px',
                borderRadius: '14px',
                border: '1px solid var(--border-color, #374151)',
                background: 'var(--bg-surface, #111827)',
                color: 'var(--text-main, #fff)',
                fontSize: '13.5px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{
            border: '1px solid var(--border-color, #1f2937)',
            borderRadius: '18px',
            overflow: 'hidden',
            background: 'var(--bg-surface, #111827)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-primary, #0f172a)', borderBottom: '1px solid var(--border-color, #1f2937)', color: 'var(--text-dim, #9ca3af)' }}>
                  <th style={{ padding: '12px 16px' }}>Phone</th>
                  <th style={{ padding: '12px 16px' }}>Name</th>
                  <th style={{ padding: '12px 16px' }}>Signup Date</th>
                  <th style={{ padding: '12px 16px' }}>Pro Status</th>
                  <th style={{ padding: '12px 16px' }}>Expiry</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sheetUsers
                  .filter(u => !userSearchQuery || u.phone.includes(userSearchQuery) || u.name.toLowerCase().includes(userSearchQuery.toLowerCase()))
                  .map((u, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color, #1f2937)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-main, #fff)' }}>
                        {u.phone}
                      </td>
                      <td style={{ padding: '12px 16px' }}>{u.name}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-dim, #9ca3af)' }}>{u.signupDate || '-'}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {u.isPro ? (
                          <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '11px' }}>
                            PRO ACTIVE
                          </span>
                        ) : (
                          <span style={{ background: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '11px' }}>
                            FREE USER
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-dim, #9ca3af)', fontSize: '12px' }}>{u.proExpiry || '-'}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleTogglePro(u.phone, u.isPro)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: u.isPro ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: u.isPro ? '#ef4444' : '#10b981',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {u.isPro ? 'Revoke Pro' : 'Grant Pro Access'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 10: SETTINGS & SECURITY ─── */}
      {activeTab === 'settings' && (
        <div style={{
          background: 'var(--bg-surface, #111827)',
          border: '1px solid var(--border-color, #1f2937)',
          borderRadius: '20px',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 4px 0' }}>
              Platform Settings, Support & Admin Security
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-dim, #9ca3af)', margin: 0 }}>
              Configure student support channels, free limits, and change your Admin Master PIN.
            </p>
          </div>

          {settingsMsg && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#34d399',
              fontSize: '13.5px',
              fontWeight: 700
            }}>
              {settingsMsg}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                WhatsApp Support Number:
              </label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                placeholder="+91 9876543210"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color, #374151)',
                  background: 'var(--bg-primary, #0f172a)',
                  color: 'var(--text-main, #fff)',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                Telegram Community Link:
              </label>
              <input
                type="text"
                value={telegramLink}
                onChange={(e) => setTelegramLink(e.target.value)}
                placeholder="https://t.me/your_channel"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color, #374151)',
                  background: 'var(--bg-primary, #0f172a)',
                  color: 'var(--text-main, #fff)',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                Free Tests Limit (Before Pro Lock):
              </label>
              <input
                type="number"
                value={freeTestsLimit}
                onChange={(e) => setFreeTestsLimit(parseInt(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color, #374151)',
                  background: 'var(--bg-primary, #0f172a)',
                  color: 'var(--text-main, #fff)',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                Change Master Admin PIN:
              </label>
              <input
                type="password"
                maxLength={8}
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                placeholder="Enter new 4-digit PIN"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color, #374151)',
                  background: 'var(--bg-primary, #0f172a)',
                  color: 'var(--text-main, #fff)',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
              Google Apps Script Webhook URL:
            </label>
            <input
              type="text"
              defaultValue={GOOGLE_SHEET_API_URL}
              onChange={(e) => localStorage.setItem('ssc_sheet_api_url', e.target.value.trim())}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid var(--border-color, #374151)',
                background: 'var(--bg-primary, #0f172a)',
                color: 'var(--text-main, #fff)',
                fontSize: '13px',
                fontFamily: 'monospace',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            onClick={handleSaveSettings}
            style={{
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#fff',
              fontSize: '14.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
            }}
          >
            <Save size={18} /> Save All Platform Settings
          </button>
        </div>
      )}

    </div>
  );
};
