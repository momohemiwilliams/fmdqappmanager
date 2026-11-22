import fmdqLogo from '../assets/fmdq-logo.png'

export default function FmdqLogo({ className = '' }) {
  return (
    <div className={`inline-flex items-center rounded-lg bg-white px-3 py-2 shadow-sm ${className}`}>
      <img src={fmdqLogo} alt="FMDQ" className="h-5 w-auto" />
    </div>
  )
}
