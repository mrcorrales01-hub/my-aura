import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { runSelfTest, type HealthReport } from '@/health/selftest'

export default function HealthPage() {
  const { i18n } = useTranslation()
  const [report, setReport] = useState<HealthReport | null>(null)
  
  useEffect(() => { 
    runSelfTest(i18n, location.pathname).then(setReport) 
  }, [])
  
  if (!report) return <pre>Laddar…</pre>
  
  return (
    <div className="p-4 space-y-3">
      <h1 className="text-xl font-semibold">Health</h1>
      <p className="text-sm opacity-70">{report.timestamp}</p>
      <div className="grid gap-2">
        {report.checks.map((c, i) => (
          <div key={i} className={`p-3 rounded border ${
            c.status === 'ok' ? 'border-green-300 bg-green-50' : 
            c.status === 'warn' ? 'border-amber-300 bg-amber-50' : 
            'border-rose-300 bg-rose-50'
          }`}>
            <div className="font-medium">{c.name} — {c.status}</div>
            <div className="text-sm">{c.message}</div>
            {c.details && (
              <pre className="mt-1 text-xs overflow-auto whitespace-pre-wrap">
                {JSON.stringify(c.details, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
      <button 
        className="px-3 py-2 rounded bg-gray-900 text-white" 
        onClick={() => {
          navigator.clipboard.writeText(JSON.stringify(report, null, 2))
        }}
      >
        Copy report
      </button>
      <pre className="text-xs opacity-70 overflow-auto">
        {JSON.stringify(report, null, 2)}
      </pre>
    </div>
  )
}