import { Activity, BadgeCheck, BrainCircuit, HeartPulse, Leaf, ShieldCheck, UploadCloud } from 'lucide-react'
import { Link } from 'react-router-dom'
import FeatureCard from '../components/landing/FeatureCard'
import LandingNavbar from '../components/landing/LandingNavbar'
import StatusCard from '../components/landing/StatusCard'
import Button from '../components/ui/Button'
import { howItWorksSteps, landingFeatures, modelStatuses } from '../constants/landing'

const featureIconMap = { Leaf, BadgeCheck, Activity, HeartPulse }
const stepIconMap = { UploadCloud, BrainCircuit, ShieldCheck, Activity }

function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 md:px-6 md:pt-12">
        <section className="surface-card grid-pattern rounded-3xl p-6 md:p-10">
          <p className="mb-4 inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-200">
            Precision Tea Intelligence
          </p>
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight text-white md:text-5xl">TeaGuard AI</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
            AI-powered tea leaf detection, black tea grade classification, and worker health risk prediction for
            smarter tea industry operations.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/register">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">
                Login
              </Button>
            </Link>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-white md:text-3xl">Core Features</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {landingFeatures.map((feature) => (
              <FeatureCard key={feature.key} title={feature.title} description={feature.description} icon={featureIconMap[feature.icon] || Leaf} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-white md:text-3xl">How It Works</h2>
          <div className="surface-card rounded-2xl p-5 md:p-6">
            <ol className="grid gap-3 md:grid-cols-2">
              {howItWorksSteps.map((step, index) => {
                const Icon = stepIconMap[step.icon] || Activity
                return (
                  <li key={step.title} className="rounded-xl border border-[var(--border-color)] bg-white/5 p-4">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-300/15 px-3 py-1 text-xs text-teal-100">
                      <Icon className="h-4 w-4" />
                      <span>Step {index + 1}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-100">{step.title}</p>
                  </li>
                )
              })}
            </ol>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-white md:text-3xl">Model Modules Preview</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {modelStatuses.map((model) => (
              <StatusCard key={model.key} title={model.title} status={model.status} description={model.description} />
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-4 lg:grid-cols-2">
          <article className="surface-card rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white">Worker Safety Preview</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Until live IoT devices are connected, supervisors can enter health readings manually and receive safe
              shift recommendations.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-200">
              <li>- Low risk: normal work flow</li>
              <li>- Medium risk: light work preferred</li>
              <li>- High risk: light work with supervisor review</li>
              <li>- Critical risk: rest required with medical review</li>
            </ul>
          </article>
          <article className="surface-card rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white">Call to Action</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Secure, backend-driven AI workflows built for tea factories and field operations.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
            </div>
          </article>
        </section>
      </main>
      <footer className="border-t border-[var(--border-color)] bg-slate-950/70">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-2 px-4 py-5 text-sm text-slate-400 md:flex-row md:items-center md:px-6">
          <p>TeaGuard AI | Tea Leaf Intelligence System</p>
          <p>Backend-driven AI integrations. No direct model calls from frontend.</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
