import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthLayout from '../components/AuthLayout'
import TextField from '../components/TextField'
import Button from '../components/Button'
import { useAuth } from '../context/AuthContext'
import { extractErrorMessage } from '../api/client'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const { register: registerAdmin } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { firstname: '', lastname: '', email: '', password: '', password_confirmation: '' },
  })

  const onSubmit = async (values) => {
    try {
      await registerAdmin(values)
      toast.success('Admin registered successfully!')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Unable to register. Please check your details and try again.'))
    }
  }

  return (
    <AuthLayout>
      <h2 className="text-center text-2xl font-bold text-navy-900">iAuth - SSO</h2>
      <p className="mt-1.5 text-center text-sm text-slate-500">Create your admin account to get started.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="First name"
            placeholder="Aliu"
            autoComplete="given-name"
            error={errors.firstname?.message}
            {...register('firstname', { required: 'Required' })}
          />
          <TextField
            label="Last name"
            placeholder="Adedigba"
            autoComplete="family-name"
            error={errors.lastname?.message}
            {...register('lastname', { required: 'Required' })}
          />
        </div>

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

        <TextField
          label="Enter New Password"
          type="password"
          placeholder="Create a password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' },
          })}
        />

        <TextField
          label="Confirm New Password"
          type="password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.password_confirmation?.message}
          {...register('password_confirmation', {
            required: 'Please confirm your password',
            validate: (value) => value === watch('password') || 'Passwords do not match',
          })}
        />

        <Button type="submit" loading={isSubmitting}>
          Sign Up
        </Button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-navy-800 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
