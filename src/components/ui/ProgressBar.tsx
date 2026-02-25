'use client'

import { useEffect, useRef, useState } from 'react'

interface ProgressBarProps {
  value: number
  max?: number
  color?: string
  height?: number
  label?: string
  showValue?: boolean
  delay?: number
}

export function ProgressBar({
  value,
  max = 100,
  color = 'var(--primary)',
  height = 6,
  label,
  showValue = false,
  delay = 0,
}: ProgressBarProps) {
  const [width, setWidth] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const t = setTimeout(() => setWidth((value / max) * 100), delay)
    return () => clearTimeout(t)
  }, [value, max, delay])

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs" style={{ color: 'var(--muted)' }}>{label}</span>}
          {showValue && (
            <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
              {value.toLocaleString()}
            </span>
          )}
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height, background: 'var(--border)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${width}%`, background: color }}
        />
      </div>
    </div>
  )
}
