import { useState, useEffect } from 'react'
import { Users, BookOpen, Calendar, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 150,
    activeClasses: 8,
    upcomingEvents: 3,
    weeklyProgress: 85
  })

  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstallable(false)
      }
      setDeferredPrompt(null)
    }
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12 this month'
    },
    {
      title: 'Active Classes',
      value: stats.activeClasses,
      icon: BookOpen,
      color: 'bg-green-500',
      change: '2 new this week'
    },
    {
      title: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: Calendar,
      color: 'bg-yellow-500',
      change: 'Next: Parent Meeting'
    },
    {
      title: 'Weekly Progress',
      value: `${stats.weeklyProgress}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+5% from last week'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        {isInstallable && (
          <button
            onClick={handleInstallClick}
            className="pwa-button text-sm"
          >
            Install App
          </button>
        )}
      </div>

      {/* Welcome Card */}
      <div className="pwa-card">
        <h3 className="text-lg font-semibold mb-2">Welcome to Young Eagles PWA</h3>
        <p className="text-gray-600">
          This Progressive Web App provides offline access to essential school management features.
          You can install it on your device for a native app experience.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="pwa-card">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="pwa-card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="pwa-button w-full">
            View Attendance
          </button>
          <button className="pwa-button w-full">
            Send Notification
          </button>
          <button className="pwa-button w-full">
            Generate Report
          </button>
        </div>
      </div>

      {/* PWA Features Info */}
      <div className="pwa-card bg-blue-50">
        <h3 className="text-lg font-semibold mb-4 text-blue-900">PWA Features</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Works offline with cached data</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Installable on mobile and desktop</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Push notifications support</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Fast loading with service worker</span>
          </div>
        </div>
      </div>
    </div>
  )
}

