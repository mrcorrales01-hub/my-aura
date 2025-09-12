import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { runSelfTest, type HealthReport } from '@/health/selftest'

function shouldShow() { 
  try {
    // @ts-ignore
    const dbg = (import.meta as any).env?.VITE_DEBUG_HEALTH === 'true'
    const q = new URLSearchParams(location.search).has('debug') || new URLSearchParams(location.search).has('debug=health')
    return dbg || q
  } catch { 
    return false 
  }
}

export default function DebugPanel() {
  const { i18n } = useTranslation()
  const [report, setReport] = useState<HealthReport | null>(null)
  const [open, setOpen] = useState(false)
  
  useEffect(() => {
    if (!shouldShow()) return
    runSelfTest(i18n, location.pathname).then(setReport)
  }, [i18n.language])
  
  if (!shouldShow() || !report) return null
  
  const fails = report.checks.filter(c => c.status === 'fail').length
  const warns = report.checks.filter(c => c.status === 'warn').length
  
  return (
    <div className="fixed left-2 right-2 bottom-2 z-[9999]">
      <div className="pointer-events-auto rounded-xl shadow-lg bg-white border p-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            Health: {fails ? `${fails} fail` : 'ok'} {warns ? `/ ${warns} warn` : ''}
          </div>
          <div className="space-x-2">
            <button className="text-sm underline" onClick={() => setOpen(!open)}>
              {open ? 'Hide' : 'Show'}
            </button>
            <button 
              className="text-sm underline" 
              onClick={() => navigator.clipboard.writeText(JSON.stringify(report, null, 2))}
            >
              Copy
            </button>
            <a className="text-sm underline" href="/health">Open</a>
          </div>
        </div>
        {open && (
          <pre className="mt-2 max-h-56 overflow-auto text-xs whitespace-pre-wrap">
            {JSON.stringify(report, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}