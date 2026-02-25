'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { useLang } from '@/lib/lang'
import { Sidebar } from './Sidebar'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const { lang } = useLang()
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center md:hidden"
        style={{
          ...(lang === 'ar' ? { right: '1rem' } : { left: '1rem' }),
          background: 'var(--card)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
        }}
      >
        <Menu size={18} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setOpen(false)}
        />
      )}

      <Sidebar open={open} onClose={() => setOpen(false)} />

      <main className="main-content flex-1 min-h-screen overflow-x-hidden">
        {children}
      </main>
    </>
  )
}
