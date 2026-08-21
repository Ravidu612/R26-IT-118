import { BookOpenCheck, Route, ShieldCheck } from 'lucide-react'
import { teaGradeDescriptions, teaGradeRecommendations } from '../../constants/teaGrades'

function GradeInsightsCard({ result }) {
  const grade = result?.predicted_grade || ''
  const description = result?.grade_description || teaGradeDescriptions[grade] || 'Run a classification to see the grade profile.'
  const recommendation = result?.recommendation || teaGradeRecommendations[grade] || 'The routing recommendation will appear after a saved result is available.'

  return <section className="dashboard-card rounded-[12px] border border-[#e1e9e3] bg-white p-4 shadow-[0_4px_15px_rgba(33,61,45,.045)]"><div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#dff3e6] text-[#087d47]"><BookOpenCheck className="h-4 w-4" /></span><h2 className="text-[15px] font-extrabold text-[#17231c]">Grade Insights</h2></div><div className="mt-4 space-y-4"><Insight icon={ShieldCheck} label="Grade profile" text={description} /><Insight icon={Route} label="Routing recommendation" text={recommendation} /></div></section>
}

function Insight({ icon: Icon, label, text }) {
  return <div className="flex gap-3 border-l-2 border-[#8cc69d] pl-3"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#16764d]" /><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#16764d]">{label}</p><p className="mt-1 text-[11px] leading-5 text-[#53665a]">{text}</p></div></div>
}

export default GradeInsightsCard
