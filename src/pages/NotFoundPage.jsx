import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-navy-700">404</p>
      <h1 className="text-3xl font-bold text-navy-900">Page not found</h1>
      <p className="max-w-sm text-sm text-slate-500">The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved.</p>
      <Link
        to="/"
        className="mt-2 inline-flex items-center justify-center rounded-lg bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700"
      >
        Go back home
      </Link>
    </div>
  )
}
