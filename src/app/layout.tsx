import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/theme'
import { LangProvider } from '@/lib/lang'
import { AppShell } from '@/components/layout/AppShell'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'NUMŪ — National Digital & AI Upskilling Initiative',
  description: "Live dashboard for Lebanon's National Digital & AI Upskilling Initiative",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased flex min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <ThemeProvider>
          <LangProvider>
            <AppShell>
              {children}
            </AppShell>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
