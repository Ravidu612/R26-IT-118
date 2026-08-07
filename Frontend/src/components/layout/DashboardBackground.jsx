import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectDashboardBackground } from '../../store/uiSlice'

function DashboardBackground() {
  const background = useSelector(selectDashboardBackground)
  const [activeIndex, setActiveIndex] = useState(0)
  const images = background.images || []

  useEffect(() => {
    if (images.length < 2) return undefined
    const timerId = setInterval(() => setActiveIndex((index) => (index + 1) % images.length), background.intervalMs)
    return () => clearInterval(timerId)
  }, [background.intervalMs, images.length])

  if (!images.length) return null

  return (
    <div className="dashboard-background" aria-hidden="true">
      {images.map((image, index) => (
        <img key={image.src} className={`dashboard-background-image ${index === activeIndex ? 'is-active' : ''}`} src={image.src} alt={image.alt} />
      ))}
      <div className="dashboard-background-overlay" />
    </div>
  )
}

export default DashboardBackground
