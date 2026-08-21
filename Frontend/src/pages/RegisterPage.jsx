import { ArrowLeft, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard from '../components/auth/AuthCard'
import AuthVisualPanel from '../components/auth/AuthVisualPanel'
import TeaGuardLogo from '../components/brand/TeaGuardLogo'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { userRoles } from '../constants/navigation'
import { authService } from '../services/authService'

const initialForm = { fullName: '', email: '', password: '', confirmPassword: '', role: userRoles[0] }

function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const handleChange = (event) => setFormData((current) => ({ ...current, [event.target.name]: event.target.value }))
  const handleSubmit = (event) => {
    event.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setFormError('Password and Confirm Password must match.')
      return
    }
    setFormError('')
    setIsSubmitting(true)
    authService.register({ fullName: formData.fullName, email: formData.email, password: formData.password, role: formData.role }).then(() => navigate('/dashboard')).catch((error) => setFormError(error.message || 'Registration failed')).finally(() => setIsSubmitting(false))
  }

  return <main className="min-h-screen bg-[#f5faf6] lg:grid lg:grid-cols-[1.08fr_.92fr]"><AuthVisualPanel mode="register" /><section className="flex min-h-screen items-center justify-center px-5 py-8 md:px-10 lg:px-14 xl:px-20"><div className="w-full max-w-[480px]"><MobileBrand /><AuthCard title="Create your workspace" subtitle="Set up a TeaGuard account for your estate, factory, or field operations." eyebrow="Start your tea intelligence journey"><form onSubmit={handleSubmit} className="space-y-4">{formError ? <Alert tone="error" message={formError} /> : null}<Input id="fullName" name="fullName" label="Full name" placeholder="Nimal Perera" required value={formData.fullName} onChange={handleChange} autoComplete="name" /><Input id="email" name="email" type="email" label="Work email" placeholder="factory.manager@teaguard.ai" required value={formData.email} onChange={handleChange} autoComplete="email" /><div className="grid gap-4 sm:grid-cols-2"><Input id="password" name="password" type="password" label="Password" placeholder="Create a password" required value={formData.password} onChange={handleChange} autoComplete="new-password" /><Input id="confirmPassword" name="confirmPassword" type="password" label="Confirm password" placeholder="Repeat password" required value={formData.confirmPassword} onChange={handleChange} error={formError && formError.includes('match') ? formError : ''} autoComplete="new-password" /></div><Select id="role" name="role" label="Your role" required value={formData.role} onChange={handleChange} options={userRoles.map((role) => ({ label: role, value: role }))} /><Button type="submit" icon={UserPlus} isLoading={isSubmitting} className="mt-2 w-full">Create TeaGuard account</Button></form></AuthCard><div className="mt-5 flex flex-col gap-3 px-1 text-center text-sm"><Link to="/login" className="font-bold text-[#16764d] hover:text-[#0f5d3d]">Already have an account? Log in</Link><Link to="/" className="inline-flex items-center justify-center gap-2 text-[#718979] hover:text-[#16764d]"><ArrowLeft className="h-4 w-4" /> Back to landing page</Link></div></div></section></main>
}

function MobileBrand() {
  return <Link to="/" className="mb-6 inline-flex items-center gap-2.5 lg:hidden"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6f5ea]"><TeaGuardLogo className="h-8 w-8" /></span><span><strong className="block text-sm text-[#17623e]">TeaGuard AI</strong><small className="text-[10px] text-[#799284]">Tea Leaf Intelligence System</small></span></Link>
}

export default RegisterPage
