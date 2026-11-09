import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Currency, CURRENCY_RATES, TRANSLATIONS, SUPPORTED_LANGUAGES, LanguageOption } from '../data/translations';

interface LanguageContextType {
  language: Language;
  currency: Currency;
  isRtl: boolean;
  supportedLanguages: LanguageOption[];
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  t: typeof TRANSLATIONS['en'];
  formatPrice: (amountUSD: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('et_lang') as Language) || 'en';
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    return (localStorage.getItem('et_currency') as Currency) || 'USD';
  });

  const isRtl = language === 'ar' || language === 'ur';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    if (language === 'ur' || language === 'ar') {
      document.documentElement.classList.add('rtl-content');
    } else {
      document.documentElement.classList.remove('rtl-content');
    }
    localStorage.setItem('et_lang', language);
  }, [language, isRtl]);

  useEffect(() => {
    localStorage.setItem('et_currency', currency);
  }, [currency]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
  };

  const formatPrice = (amountUSD: number): string => {
    const rateInfo = CURRENCY_RATES[currency] || CURRENCY_RATES['USD'];
    const converted = amountUSD * rateInfo.rate;
    if (currency === 'BHD') {
      return `${converted.toFixed(2)} ${rateInfo.symbol}`;
    }
    return `${rateInfo.symbol}${converted.toFixed(0)}`;
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

  return (
    <LanguageContext.Provider
      value={{
        language,
        currency,
        isRtl,
        supportedLanguages: SUPPORTED_LANGUAGES,
        setLanguage,
        setCurrency,
        t,
        formatPrice,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
