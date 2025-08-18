// lib/i18n/index.ts
import { en } from './en';
import { da } from './da';

export type Language = 'en' | 'da';
export type StringToken = keyof typeof en;

const translations = { en, da };

export function getTranslator(lang: Language) {
  return function t(key: StringToken, replacements?: Record<string, string>): string {
    // Fallback to English if the key is not found in the current language
    let translation = (translations[lang] as any)[key] || (translations['en'] as any)[key];

    if (replacements) {
      Object.keys(replacements).forEach((placeholder) => {
        const regex = new RegExp(`{${placeholder}}`, 'g');
        translation = translation.replace(regex, replacements[placeholder]);
      });
    }

    return translation as string;
  };
}
