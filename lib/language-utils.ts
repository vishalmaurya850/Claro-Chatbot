export function detectLanguage(text: string): string {
  // Simple language detection based on character patterns
  const hindiPattern = /[\u0900-\u097F]/
  const englishPattern = /[a-zA-Z]/

  if (hindiPattern.test(text)) {
    return "hi"
  } else if (englishPattern.test(text)) {
    return "en"
  }

  return "en" // Default to English
}

export function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    en: "English",
    hi: "Hindi",
  }

  return languages[code] || "English"
}
