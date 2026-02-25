'use client'

import { useEffect, useState } from 'react'
interface StatCardProps {
  label: React.ReactNode
  value: number | string
  suffix?: string
  icon: React.ReactNode
  color: string
  trend?: { value: number; label: string }
  delay?: number
}

function useCountUp(target: number, duration = 1200, delay = 0) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (target === 0) return
    let cancelled = false
    const timeout = setTimeout(() => {
      const start = performance.now()
      const step = (now: number) => {
        if (cancelled) return
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        const ease = 1 - Math.pow(1 - progress, 3)
        setCount(Math.floor(ease * target))
        if (progress < 1) requestAnimationFrame(step)
        else setCount(target)
      }
      requestAnimationFrame(step)
    }, delay)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [target, duration, delay])

  return count
}

export function StatCard({ label, value, suffix, icon, color, trend, delay = 0 }: StatCardProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(String(value))
  const animated = useCountUp(isNaN(numericValue) ? 0 : Math.floor(numericValue), 1200, delay)

  const display =
    typeof value === 'string' && isNaN(numericValue)
      ? value
      : animated.toLocaleString()

  return (
    <div
      className="rounded-2xl p-5 animate-fade-up flex flex-col gap-4"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20`, border: `1px solid ${color}40` }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: trend.value >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color: trend.value >= 0 ? '#10b981' : '#ef4444',
            }}
          >
            {trend.value >= 0 ? '↑' : '↓'} {trend.label}
          </span>
        )}
      </div>
      <div>
        <div className="flex items-end gap-1">
          <span className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            {display}
          </span>
          {suffix && (
            <span className="text-lg font-semibold mb-0.5" style={{ color }}>
              {suffix}
            </span>
          )}
        </div>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          {label}
        </p>
      </div>
    </div>
  )
}
