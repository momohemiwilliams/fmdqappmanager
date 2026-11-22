import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

export default function Button({ children, loading = false, variant = 'primary', className, disabled, ...props }) {
  return (
    <button
      className={clsx(
        'inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'bg-navy-800 text-white hover:bg-navy-700 active:bg-navy-900',
        variant === 'outline' && 'border border-navy-800 text-navy-800 hover:bg-navy-800/5',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}
