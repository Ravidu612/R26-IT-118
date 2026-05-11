import { ArrowLeft, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard from '../components/auth/AuthCard'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { userRoles } from '../constants/navigation'
import { authService } from '../services/authService'

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: userRoles[0],
}

function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setFormError('Password and Confirm Password must match.')
      return
    }
    setFormError('')
    setIsSubmitting(true)
    authService
      .register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })
      .then(() => {
        navigate('/dashboard')
      })
      .catch((error) => {
        setFormError(error.message || 'Registration failed')
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <AuthCard
        title="Register"
        subtitle="Create your TeaGuard AI account and choose your operational role."
        footer={
          <div className="flex flex-col gap-2">
            <Link to="/login" className="text-teal-200 hover:text-teal-100">
              Already have an account? Login
            </Link>
            <Link to="/" className="inline-flex items-center gap-2 text-slate-300 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to Landing Page
            </Link>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError ? <Alert tone="error" message={formError} /> : null}
          <Input
            id="fullName"
            name="fullName"
            label="Full Name"
            placeholder="Nimal Perera"
            required
            value={formData.fullName}
            onChange={handleChange}
          />
          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="factory.manager@teaguard.ai"
            required
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="Create your password"
            required
            value={formData.password}
            onChange={handleChange}
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="Re-enter your password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            error={formError && formError.includes('match') ? formError : ''}
          />
          <Select
            id="role"
            name="role"
            label="Role"
            required
            value={formData.role}
            onChange={handleChange}
            options={userRoles.map((role) => ({ label: role, value: role }))}
          />
          <Button type="submit" icon={UserPlus} isLoading={isSubmitting} className="w-full">
            Register
          </Button>
        </form>
      </AuthCard>
    </main>
  )
}

export default RegisterPage
