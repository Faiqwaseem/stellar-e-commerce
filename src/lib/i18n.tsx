import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Lang = 'en' | 'ur';

const dict = {
  en: {
    recentlyViewed: 'Recently Viewed',
    questionsAndAnswers: 'Questions & Answers',
    askQuestion: 'Ask a Question',
    typeQuestion: 'Type your question…',
    submit: 'Submit',
    noQuestions: 'No questions yet. Be the first to ask!',
    answeredBy: 'Answered by store',
    pendingAnswer: 'Awaiting answer',
    shareWishlist: 'Share Wishlist',
    copyLink: 'Copy share link',
    shareLinkCreated: 'Share link created',
    sharedWishlistTitle: 'Shared Wishlist',
    addAllToCart: 'Add all to cart',
    language: 'Language',
    english: 'English',
    urdu: 'اردو',
    signInToAsk: 'Sign in to ask a question',
  },
  ur: {
    recentlyViewed: 'حال ہی میں دیکھے گئے',
    questionsAndAnswers: 'سوالات و جوابات',
    askQuestion: 'سوال پوچھیں',
    typeQuestion: 'اپنا سوال لکھیں…',
    submit: 'بھیجیں',
    noQuestions: 'ابھی کوئی سوال نہیں۔ پہلا سوال آپ پوچھیں!',
    answeredBy: 'اسٹور کا جواب',
    pendingAnswer: 'جواب کا انتظار',
    shareWishlist: 'وش لسٹ شیئر کریں',
    copyLink: 'شیئر لنک کاپی کریں',
    shareLinkCreated: 'شیئر لنک بن گیا',
    sharedWishlistTitle: 'شیئر کردہ وش لسٹ',
    addAllToCart: 'سب کارٹ میں ڈالیں',
    language: 'زبان',
    english: 'English',
    urdu: 'اردو',
    signInToAsk: 'سوال پوچھنے کے لیے سائن ان کریں',
  },
} as const;

type Key = keyof typeof dict.en;

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: Key) => string;
}

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'en';
    return (localStorage.getItem('mystore-lang') as Lang) || 'en';
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('mystore-lang', l);
  };

  const t = (key: Key) => dict[lang][key] ?? dict.en[key] ?? key;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) return { lang: 'en' as Lang, setLang: () => {}, t: (k: Key) => dict.en[k] ?? k };
  return ctx;
}
