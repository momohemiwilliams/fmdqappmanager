import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout'
import TextField from '../components/TextField'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { extractErrorMessage } from '../api/client'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } })

  const onSubmit = async (values) => {
    try {
      await login(values)
      toast.success('Welcome back!')
      const redirectTo = location.state?.from?.pathname ?? '/dashboard'
      navigate(redirectTo, { replace: true })
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Unable to log in. Please check your details and try again.'))
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-center text-2xl font-bold text-navy-900">iAuth - SSO</h2>
      <p className="mt-1.5 text-center text-sm text-slate-500">Enter your SSO (Single Sign On) details below to login.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Email"
          type="email"
          placeholder="example@fmdqgroup.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address' },
          })}
        />

        <div>
          <TextField
            label="Password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />
          <button
            type="button"
            onClick={() => toast('Please contact your system administrator to reset your password.')}
            className="mt-2 text-sm font-medium text-navy-800 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <Button type="submit" loading={isSubmitting}>
          Login
        </Button>

        <p className="text-center text-sm text-slate-500">
          No login details?{' '}
          <a href="mailto:admin@fmdqgroup.com" className="font-semibold text-navy-800 hover:underline">
            Talk to admin
          </a>{' '}
          &middot;{' '}
          <Link to="/register" className="font-semibold text-navy-800 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
