'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Lang = 'en' | 'ar'

const LangCtx = createContext<{ lang: Lang; toggle: () => void }>({
  lang: 'en',
  toggle: () => {},
})

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null
    if (saved) setLang(saved)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang)
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
    localStorage.setItem('lang', lang)
  }, [lang])

  return (
    <LangCtx.Provider value={{ lang, toggle: () => setLang((l) => (l === 'en' ? 'ar' : 'en')) }}>
      {children}
    </LangCtx.Provider>
  )
}

export const useLang = () => useContext(LangCtx)

export function Tr({ en, ar }: { en: string; ar: string }) {
  const { lang } = useLang()
  return <span suppressHydrationWarning>{lang === 'ar' ? ar : en}</span>
}
