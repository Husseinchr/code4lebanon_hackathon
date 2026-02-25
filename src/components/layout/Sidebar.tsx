'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, Globe, Lightbulb, Moon, Radio, Sparkles, Sun, Users, X, Zap } from 'lucide-react'
import { useTheme } from '@/lib/theme'
import { useLang } from '@/lib/lang'

const NAV = [
  { href: '/',              icon: BarChart2,  en: 'Overview',      ar: 'نظرة عامة' },
  { href: '/dissemination', icon: Radio,      en: 'Dissemination', ar: 'الانتشار' },
  { href: '/interests',     icon: Lightbulb,  en: 'Interests',     ar: 'الاهتمامات' },
  { href: '/geography',     icon: Globe,      en: 'Geography',     ar: 'الجغرافيا' },
  { href: '/learners',      icon: Users,      en: 'Learners',      ar: 'المتعلمون' },
  { href: '/intelligence',  icon: Sparkles,   en: 'Intelligence',  ar: 'الذكاء التحليلي' },
]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { theme, toggle: toggleTheme } = useTheme()
  const { lang, toggle: toggleLang } = useLang()
  const isRTL = lang === 'ar'

  return (
    <aside
      className={`fixed top-0 h-screen w-64 flex flex-col z-40 transition-transform duration-300 md:translate-x-0 ${
        open ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
      }`}
      style={{
        background: 'var(--surface)',
        borderInlineEnd: '1px solid var(--border)',
        ...(isRTL ? { right: 0, left: 'auto' } : { left: 0, right: 'auto' }),
      }}
    >
      <div
        className="px-6 py-7 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--primary)', boxShadow: '0 0 20px rgba(225,29,72,0.4)' }}
          >
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <div>
            <p className="font-bold text-sm tracking-wide" style={{ color: 'var(--text)' }}>NUMŪ</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {isRTL ? 'المبادرة الرقمية' : 'Digital Initiative'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ color: 'var(--muted)' }}
        >
          <X size={15} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        <p
          className="text-xs font-semibold uppercase tracking-widest px-3 mb-3"
          style={{ color: 'var(--muted)' }}
        >
          {isRTL ? 'لوحة التحكم' : 'Dashboard'}
        </p>
        {NAV.map(({ href, icon: Icon, en, ar }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active ? 'nav-active-border' : 'nav-inactive-border'
              }`}
              style={{
                background: active ? 'var(--primary-dim)' : 'transparent',
                color: active ? 'var(--primary)' : 'var(--muted)',
              }}
            >
              <Icon size={16} />
              {isRTL ? ar : en}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 pb-3 flex gap-2">
        <button
          onClick={toggleTheme}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--muted)',
          }}
        >
          {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          {theme === 'dark'
            ? (isRTL ? 'نهاري' : 'Light')
            : (isRTL ? 'ليلي' : 'Dark')}
        </button>
        <button
          onClick={toggleLang}
          className="flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-semibold transition-colors"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          }}
        >
          {isRTL ? 'EN' : 'عربي'}
        </button>
      </div>

      <div className="px-4 pb-4 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
        <div
          className="rounded-xl p-3 text-xs mt-2"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span style={{ color: 'var(--muted)' }}>
              {isRTL ? 'متصل بالخادم' : 'Backend connected'}
            </span>
          </div>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>CODE4LEBANON</p>
          <p style={{ color: 'var(--muted)' }}>
            {isRTL ? 'هاكاثون 2026' : 'Hackathon 2026'}
          </p>
        </div>
      </div>
    </aside>
  )
}
