import React from 'react';
import { Globe } from 'lucide-react';
import { Language, useSettings } from '../../contexts/SettingsContext';

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
];

export function LanguageSelector() {
  const { settings, updateLanguage } = useSettings();

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-red-400">
        <Globe className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Language</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {languages.map(({ code, name, flag }) => (
          <button
            key={code}
            onClick={() => updateLanguage(code)}
            className={`flex items-center space-x-3 p-3 rounded-lg transition ${
              settings.language === code
                ? 'bg-red-600 text-white'
                : 'bg-zinc-800 hover:bg-red-900/20'
            }`}
          >
            <span className="text-2xl">{flag}</span>
            <span>{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}