import { Eye } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { predictionService } from '../../services/predictionService'
import { getStoredImageUrl } from '../../utils/storedImage'
import HistoryActions from './HistoryActions'
import PredictionResultModal from './PredictionResultModal'

function RecentLeafDetectionHistory({ records, onDeleted }) {
  const [selectedRecord, setSelectedRecord] = useState(null)
  const deleteRecord = async (id) => {
    await predictionService.deletePrediction(id)
    onDeleted?.(id)
  }
  return <><section className="dashboard-card overflow-hidden rounded-[12px] border border-[#e1e9e3] bg-white shadow-[0_4px_15px_rgba(33,61,45,.045)]"><div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4"><h2 className="text-[15px] font-extrabold text-[#17231c]">Recent Leaf Detection History</h2><Link to="/dashboard/prediction-history" className="rounded-full border border-[#d8e8dc] px-3 py-1.5 text-[10px] font-bold text-[#16764d] hover:bg-[#f1f8f3]">View All History</Link></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] border-collapse text-left text-[11px]"><thead className="bg-[#f5f8f5] text-[10px] font-bold text-[#718077]"><tr>{['Date & Time', 'Image', 'Result', 'Confidence', 'Status', 'Actions'].map((heading) => <th key={heading} className="px-3 py-2.5 font-bold first:pl-4 last:pr-4">{heading}</th>)}</tr></thead><tbody className="divide-y divide-[#edf1ed]">{records.length ? records.map((record) => <HistoryRow key={record._id} record={record} onView={setSelectedRecord} onDelete={deleteRecord} />) : <tr><td colSpan="6" className="px-4 py-10 text-center text-[#8a968d]">No leaf detections have been saved yet.</td></tr>}</tbody></table></div></section><PredictionResultModal record={selectedRecord} onClose={() => setSelectedRecord(null)} /></>
}

function HistoryRow({ record, onView, onDelete }) {
  const confidence = Number(record.result?.confidence || 0)
  const detected = Boolean(record.result?.detected)
  return <tr className="text-[#33483a] hover:bg-[#fbfefb]"><td className="whitespace-nowrap px-3 py-3 pl-4">{new Date(record.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td><td className="px-3 py-3"><img src={getStoredImageUrl(record)} alt="Leaf detection sample" className="h-8 w-12 rounded-md object-cover" /></td><td className="px-3 py-3 font-semibold capitalize">{record.result?.detectedClass || (detected ? 'Tea leaf detected' : 'Not a tea leaf')}</td><td className="min-w-[120px] px-3 py-3"><div className="flex items-center gap-2"><span>{(confidence * 100).toFixed(1)}%</span><span className="h-1.5 w-16 overflow-hidden rounded-full bg-[#e4ece6]"><span className="block h-full rounded-full bg-[#16764d]" style={{ width: `${confidence * 100}%` }} /></span></div></td><td className="px-3 py-3"><span className={`font-semibold ${detected ? 'text-[#16764d]' : 'text-[#e77717]'}`}>● {detected ? 'Completed' : 'Review required'}</span></td><td className="px-3 py-3 pr-4"><div className="flex items-center gap-1"><button type="button" onClick={() => onView(record)} className="rounded-md border border-[#e4ebe5] p-1.5 text-[#53665a] hover:bg-[#f1f8f3]" aria-label="View detection"><Eye className="h-3.5 w-3.5" /></button><HistoryActions record={record} onDelete={onDelete} /></div></td></tr>
}

export default RecentLeafDetectionHistory
