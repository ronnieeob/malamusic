import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type Language = 'en' | 'es' | 'de' | 'fr' | 'ja' | 'zh' | 'ko' | 'ru';
export type FontFamily = 'metal' | 'gothic' | 'brutal' | 'elegant' | 'system';

interface Settings {
  language: Language;
  fontFamily: FontFamily;
}

interface SettingsContextType {
  settings: Settings;
  updateLanguage: (lang: Language) => void;
  updateFontFamily: (font: FontFamily) => void;
  translations: Record<string, string>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

const DEFAULT_SETTINGS: Settings = {
  language: 'en',
  fontFamily: 'metal'
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<Settings>('metal_aloud_settings', DEFAULT_SETTINGS);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTranslations(settings.language);
    updateFontStyles(settings.fontFamily);
  }, [settings.language, settings.fontFamily]);

  const loadTranslations = async (lang: Language) => {
    try {
      const translations = await import(`../i18n/${lang}.json`);
      setTranslations(translations.default);
    } catch (err) {
      console.error(`Failed to load translations for ${lang}:`, err);
      // Fallback to English
      const fallback = await import('../i18n/en.json');
      setTranslations(fallback.default);
    }
  };

  const updateFontStyles = (font: FontFamily) => {
    const root = document.documentElement;
    root.style.setProperty('--font-family', getFontFamily(font));
    
    // Remove all existing font classes
    document.body.classList.remove('font-metal', 'font-gothic', 'font-brutal', 'font-elegant', 'font-system');
    
    // Add new font class
    document.body.classList.add(`font-${font}`);
  };

  const getFontFamily = (font: FontFamily): string => {
    switch (font) {
      case 'metal':
        return "'Metal Mania', cursive";
      case 'gothic':
        return "'Gothic A1', sans-serif";
      case 'brutal':
        return "'Brutal Type', sans-serif";
      case 'elegant':
        return "'Cinzel', serif";
      default:
        return "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    }
  };

  const updateLanguage = (lang: Language) => {
    setSettings(prev => ({ ...prev, language: lang }));
  };

  const updateFontFamily = (font: FontFamily) => {
    // Update settings in localStorage
    setSettings(prev => ({ ...prev, fontFamily: font }));
    
    // Apply font changes immediately
    updateFontStyles(font);
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateLanguage,
      updateFontFamily,
      translations
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}