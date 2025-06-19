import { WifiOff } from 'lucide-react'

export default function OfflineIndicator() {
  return (
    <div className="offline-indicator">
      <div className="flex items-center justify-center space-x-2">
        <WifiOff size={16} />
        <span className="text-sm font-medium">You are offline</span>
      </div>
    </div>
  )
}

