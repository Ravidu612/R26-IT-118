import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import Card from '../ui/Card'

const avatarFiles = ['field-supervisor.png', 'factory-manager.png', 'health-officer.png', 'tea-worker.png']
const fallbackMembers = [
  { name: 'Field Supervisor', role: 'Tea field operations', healthStatus: 'Active' },
  { name: 'Factory Manager', role: 'Factory operations', healthStatus: 'Active' },
  { name: 'Health Officer', role: 'Worker health desk', healthStatus: 'Monitoring' },
  { name: 'Field Worker', role: 'Tea estate team', healthStatus: 'Active' },
]

function DashboardTeamPanel({ workers = [] }) {
  const members = workers.length ? workers.slice(0, 4) : fallbackMembers
  return (
    <Card>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div><h2 className="text-base font-extrabold text-[#17231c]">Team Collaboration</h2><p className="mt-1 text-xs text-[#8a968d]">People connected to today&apos;s operations.</p></div>
        <Link to="/dashboard/workers" className="inline-flex items-center gap-1 rounded-md border border-[#bad3c1] px-3 py-1.5 text-xs font-bold text-[#16764d] hover:bg-[#f1f8f3]">View team <ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>
      <div className="space-y-3">
        {members.map((member, index) => <TeamMember key={`${member.name}-${index}`} member={member} index={index} />)}
      </div>
    </Card>
  )
}

function TeamMember({ member, index }) {
  return <div className="flex items-center gap-3"><img src={`/assets/avatars/${avatarFiles[index % avatarFiles.length]}`} alt={`${member.name} avatar`} className="h-10 w-10 rounded-full object-cover ring-2 ring-white" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[#26372c]">{member.name}</p><p className="truncate text-xs text-[#8a968d]">{member.role || 'Tea operations team'}</p></div><Badge tone={member.healthStatus === 'Critical' || member.healthStatus === 'High' ? 'danger' : 'success'}>{member.healthStatus || 'Active'}</Badge></div>
}

export default DashboardTeamPanel
