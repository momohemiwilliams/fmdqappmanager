import { useNavigate } from 'react-router-dom'
import { deriveAppCode } from '../utils/appCode'

export default function AppCard({ app }) {
  const navigate = useNavigate()
  const isConfigured = Boolean(app.app_url)
  const code = deriveAppCode(app.app_name)
  const authorisedBy = app.authoriser_name ?? app.authorised_by ?? '—'

  const openAdmin = () => navigate(`/apps/${app.id}/admin`)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openAdmin}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openAdmin()
        }
      }}
      title={`Manage ${app.app_name}`}
      className="flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
              isConfigured ? 'text-success' : 'text-danger'
            }`}
          >
            <span className="relative flex h-4 w-4 items-center justify-center">
              <span
                className={`absolute h-4 w-4 animate-ping rounded-full ${isConfigured ? 'bg-success' : 'bg-danger'} opacity-25`}
              />
              <span
                className={`relative h-1.5 w-1.5 rounded-full ${
                  isConfigured
                    ? 'bg-success shadow-[0_0_6px_2px_rgba(34,197,94,0.7)]'
                    : 'bg-danger shadow-[0_0_6px_2px_rgba(239,68,68,0.7)]'
                }`}
              />
            </span>
            {isConfigured ? 'Active' : 'InActive'}
          </span>
          <span className="rounded-md border border-slate-200 px-2 py-1 text-xs font-bold tracking-wide text-slate-500">
            {code}
          </span>
        </div>

        <h3 className="mt-3 flex-1 text-2xl font-extrabold leading-tight tracking-tight text-slate-900">
          {app.app_name}
        </h3>

        <div className="mt-6 flex items-center justify-between gap-3 text-sm text-slate-400">
          <span>Authorised By:</span>
          <span>{authorisedBy}</span>
        </div>
      </div>

      <div className="h-[6.4px] bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600" />
    </div>
  )
}
