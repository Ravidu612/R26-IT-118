import { ArrowRight, BarChart3, CheckCircle2, HeartPulse, Leaf, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

function LandingInsights() {
  return <section id="benefits" className="mx-auto mt-12 w-full max-w-[1500px] px-5 md:px-10"><div className="grid gap-4 lg:grid-cols-[.72fr_1.9fr]"><article className="rounded-2xl border border-[#dcebe0] bg-white p-6 shadow-[0_8px_25px_rgba(19,77,46,.05)] md:p-8"><p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#16764d]">Real-time intelligence</p><h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-0.05em] text-[#123b28]">One connected system.<br /><span className="text-[#16804e]">Every insight you need.</span></h2><p className="mt-4 text-sm leading-6 text-[#63806f]">Live data from field to factory helps you act faster, reduce risk, and improve every harvest.</p><Link to="/register" className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#9cc9aa] px-4 py-2.5 text-xs font-extrabold text-[#16764d] transition hover:bg-[#eff9f1]">Explore Dashboard <ArrowRight className="h-4 w-4" /></Link></article><div className="grid gap-4 md:grid-cols-3"><InsightCard title="Leaf Condition Overview"><Donut value="28,450" label="Leaves scanned" gradient="conic-gradient(#16804e 0 68%, #72b687 68% 86%, #9fbea8 86% 95%, #d0e2d3 95% 100%)" items={['Healthy 68%', 'Pest affected 18%', 'Fungal 9%', 'Damaged 5%']} /></InsightCard><InsightCard title="Grade Distribution"><Bars /></InsightCard><InsightCard title="Worker Health Risk"><Donut value="23" label="At risk" gradient="conic-gradient(#16804e 0 72%, #72b687 72% 90%, #a8c9af 90% 97%, #d5e6d8 97% 100%)" items={['Low risk 72%', 'Medium risk 18%', 'High risk 7%', 'Critical 3%']} /></InsightCard></div></div><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={Leaf} value="1,248" label="Active field devices" change="12% vs yesterday" /><Metric icon={CheckCircle2} value="342" label="Tasks completed" change="18% vs yesterday" /><Metric icon={BarChart3} value="24" label="Estates connected" change="8% vs last month" /><Metric icon={HeartPulse} value="17" label="Alerts today" change="5% vs yesterday" /></div></section>
}

function InsightCard({ title, children }) {
  return <article className="min-h-[126px] rounded-[10px] border border-[#e0ebe2] bg-[#fcfefd] p-3 shadow-[0_5px_16px_rgba(19,77,46,.035)]"><h3 className="text-[10px] font-extrabold text-[#254936]">{title}</h3>{children}</article>
}

function Donut({ value, label, gradient, items }) {
  const colors = ['#16804e', '#72b687', '#9fbea8', '#c1d8c6']
  return <div className="mt-2 flex items-center gap-3"><div className="relative grid h-[82px] w-[82px] shrink-0 place-items-center rounded-full" style={{ background: gradient }}><div className="grid h-[58px] w-[58px] place-items-center rounded-full bg-white text-center"><strong className="text-[13px] text-[#173f2a]">{value}</strong><span className="text-[7px] text-[#718979]">{label}</span></div></div><div className="space-y-1 text-[8px] text-[#63806f]">{items.map((item, index) => <p key={item} className="flex items-center gap-1.5 whitespace-nowrap"><span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: colors[index] }} />{item}</p>)}</div></div>
}

function Bars() {
  const values = [{ label: 'OP', value: 30 }, { label: 'OPA', value: 36 }, { label: 'BOP', value: 25 }, { label: 'BOPF', value: 19 }, { label: 'Dust', value: 14 }]
  return <div className="mt-2 flex h-[84px] gap-1"><div className="flex h-[68px] flex-col justify-between text-[7px] text-[#718979]"><span>40%</span><span>20%</span><span>0%</span></div><div className="relative flex flex-1 items-end justify-between gap-2 border-b border-[#dfe9e1] bg-[linear-gradient(to_bottom,transparent_0,transparent_32%,#e8f0e9_33%,transparent_35%,transparent_65%,#e8f0e9_66%,transparent_68%)] px-1">{values.map((item, index) => <div key={item.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1"><span className="w-full max-w-5 rounded-t bg-[#16804e]" style={{ height: `${item.value * 1.55}px`, opacity: 1 - index * .1 }} /><span className="text-[7px] text-[#718979]">{item.label}</span></div>)}</div></div>
}

function Metric({ icon: Icon, value, label, change }) {
  return <article className="flex items-center gap-3 rounded-xl border border-[#e0ebe2] bg-white px-4 py-3 shadow-[0_6px_20px_rgba(19,77,46,.04)]"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#e8f6eb] text-[#16764d]"><Icon className="h-4 w-4" /></span><div className="min-w-0"><p className="text-xl font-extrabold text-[#173f2a]">{value}</p><p className="truncate text-[10px] text-[#718979]">{label}</p><p className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold text-[#16804e]"><TrendingUp className="h-3 w-3" />{change}</p></div></article>
}

export default LandingInsights
