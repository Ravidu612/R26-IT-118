import { ArrowLeft, LogIn } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthCard from '../components/auth/AuthCard'
import AuthVisualPanel from '../components/auth/AuthVisualPanel'
import TeaGuardLogo from '../components/brand/TeaGuardLogo'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { authService } from '../services/authService'

function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const handleChange = (event) => setFormData((current) => ({ ...current, [event.target.name]: event.target.value }))
  const handleSubmit = (event) => {
    event.preventDefault()
    setFormError('')
    setIsSubmitting(true)
    authService.login(formData).then(() => navigate('/dashboard')).catch((error) => setFormError(error.message || 'Login failed')).finally(() => setIsSubmitting(false))
  }

  return <main className="min-h-screen bg-[#f5faf6] lg:grid lg:grid-cols-[1.08fr_.92fr]"><AuthVisualPanel mode="login" /><section className="flex min-h-screen items-center justify-center px-5 py-8 md:px-10 lg:px-14 xl:px-20"><div className="w-full max-w-[480px]"><MobileBrand /><AuthCard title="Welcome back" subtitle="Access your TeaGuard workspace to manage detection, grade classification, and worker safety workflows." eyebrow="Secure sign in"><form onSubmit={handleSubmit} className="space-y-5">{formError ? <Alert tone="error" message={formError} /> : null}<Input id="email" name="email" type="email" label="Email address" placeholder="manager@teaguard.ai" required value={formData.email} onChange={handleChange} autoComplete="email" /><Input id="password" name="password" type="password" label="Password" placeholder="Enter your password" required value={formData.password} onChange={handleChange} autoComplete="current-password" /><div className="flex items-center justify-between text-[11px] text-[#718979]"><span>Protected tea operations workspace</span><span className="font-bold text-[#16764d]">Secure access</span></div><Button type="submit" icon={LogIn} isLoading={isSubmitting} className="w-full">Log in to TeaGuard</Button></form></AuthCard><AuthFooter registerPath="/register" registerText="New to TeaGuard? Create an account" /></div></section></main>
}

function MobileBrand() {
  return <Link to="/" className="mb-6 inline-flex items-center gap-2.5 lg:hidden"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6f5ea]"><TeaGuardLogo className="h-8 w-8" /></span><span><strong className="block text-sm text-[#17623e]">TeaGuard AI</strong><small className="text-[10px] text-[#799284]">Tea Leaf Intelligence System</small></span></Link>
}

function AuthFooter({ registerPath, registerText }) {
  return <div className="mt-5 flex flex-col gap-3 px-1 text-center text-sm"><Link to={registerPath} className="font-bold text-[#16764d] hover:text-[#0f5d3d]">{registerText}</Link><Link to="/" className="inline-flex items-center justify-center gap-2 text-[#718979] hover:text-[#16764d]"><ArrowLeft className="h-4 w-4" /> Back to landing page</Link></div>
}

export default LoginPage
