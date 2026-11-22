import { forwardRef, useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import clsx from 'clsx'

const TextField = forwardRef(function TextField(
  { label, type = 'text', error, rightSlot, className, ...props },
  ref,
) {
  const id = useId()
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className={clsx('text-left', className)}>
      {label && (
        <label htmlFor={id} className="mb-2 block text-sm font-semibold text-navy-900">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          ref={ref}
          type={resolvedType}
          className={clsx(
            'w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400',
            'focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20',
            error ? 'border-danger' : 'border-slate-300',
            isPassword && 'pr-11',
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        {!isPassword && rightSlot}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
})

export default TextField
