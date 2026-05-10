import { ArrowLeft, LogIn } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard from '../components/auth/AuthCard'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { authService } from '../services/authService'

function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setFormError('')
    setIsSubmitting(true)
    authService
      .login(formData)
      .then(() => {
        navigate('/dashboard')
      })
      .catch((error) => {
        setFormError(error.message || 'Login failed')
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <AuthCard
        title="Login"
        subtitle="Access TeaGuard AI to manage tea detection, grade classification, and worker safety workflows."
        footer={
          <div className="flex flex-col gap-2">
            <Link to="/register" className="text-teal-200 hover:text-teal-100">
              New user? Register here
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
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="manager@teaguard.ai"
            required
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            required
            value={formData.password}
            onChange={handleChange}
          />
          <Button type="submit" icon={LogIn} isLoading={isSubmitting} className="w-full">
            Login
          </Button>
        </form>
      </AuthCard>
    </main>
  )
}

export default LoginPage
