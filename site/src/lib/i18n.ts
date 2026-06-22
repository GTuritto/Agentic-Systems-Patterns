export type Language = 'en' | 'es';

export const siteBase = '/Agentic-Systems-Patterns';

export const languages: Record<Language, {
  code: Language;
  label: string;
  htmlLang: string;
  bookTitle: string;
  description: string;
  pdfName: string;
  epubName: string;
}> = {
  en: {
    code: 'en',
    label: 'English',
    htmlLang: 'en',
    bookTitle: 'Agentic Systems Patterns',
    description: 'A practical online book for designing, evaluating, and operating agentic systems.',
    pdfName: 'Agentic-Systems-Patterns.pdf',
    epubName: 'Agentic-Systems-Patterns.epub'
  },
  es: {
    code: 'es',
    label: 'Español',
    htmlLang: 'es-419',
    bookTitle: 'Agentic Systems Patterns',
    description: 'Un libro online práctico para diseñar, evaluar y operar agentic systems.',
    pdfName: 'Agentic-Systems-Patterns-es.pdf',
    epubName: 'Agentic-Systems-Patterns-es.epub'
  }
};

export const supportedLanguages = Object.keys(languages) as Language[];
export const defaultLanguage: Language = 'en';

export function isLanguage(value: string | undefined): value is Language {
  return value === 'en' || value === 'es';
}

export function localizedBase(language: Language) {
  return language === defaultLanguage ? siteBase : `${siteBase}/${language}`;
}

export function homeHref(language: Language) {
  return `${localizedBase(language)}/`;
}

export function bookHref(language: Language, slug: string) {
  return `${localizedBase(language)}/book/${slug}/`;
}

export function sectionHref(language: Language, sectionId: string) {
  return `${localizedBase(language)}/sections/${sectionId}/`;
}

export function patternsHref(language: Language) {
  return `${localizedBase(language)}/patterns/`;
}

export function releaseHref(language: Language, fileName: string) {
  return `${siteBase}/releases/${fileName}`;
}
