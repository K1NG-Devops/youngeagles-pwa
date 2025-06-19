import { useState, useEffect } from 'react'
import { Bell, CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { toast } from 'react-toastify'

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'info',
      title: 'Parent Meeting Scheduled',
      message: 'A parent-teacher meeting has been scheduled for next Friday at 3 PM.',
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: 2,
      type: 'success',
      title: 'Assignment Submitted',
      message: 'Math homework has been successfully submitted by John Doe.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: true
    },
    {
      id: 3,
      type: 'warning',
      title: 'Late Attendance',
      message: 'Sarah Smith was marked late for the morning session.',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: false
    }
  ])

  const [permissionStatus, setPermissionStatus] = useState('default')

  useEffect(() => {
    // Check notification permission status
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission)
    }
  }, [])

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setPermissionStatus(permission)
      
      if (permission === 'granted') {
        toast.success('Notifications enabled!')
        // Send a test notification
        new Notification('Young Eagles PWA', {
          body: 'Notifications are now enabled for this app!',
          icon: '/icon-192x192.png'
        })
      } else {
        toast.error('Notifications permission denied')
      }
    }
  }

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
    toast.info('Notification deleted')
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
    toast.success('All notifications marked as read')
  }

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />
      case 'warning':
        return <AlertCircle className="text-yellow-500" size={20} />
      case 'error':
        return <AlertCircle className="text-red-500" size={20} />
      default:
        return <Info className="text-blue-500" size={20} />
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Permission Request */}
      {permissionStatus !== 'granted' && (
        <div className="pwa-card bg-yellow-50 border border-yellow-200">
          <div className="flex items-start space-x-3">
            <Bell className="text-yellow-600 mt-1" size={20} />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Enable Push Notifications
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Allow notifications to stay updated with important school information.
              </p>
              <button
                onClick={requestNotificationPermission}
                className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
              >
                Enable Notifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="pwa-card text-center py-8">
            <Bell className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notifications
            </h3>
            <p className="text-gray-500">
              You're all caught up! New notifications will appear here.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`pwa-card transition-all ${
                !notification.read 
                  ? 'border-l-4 border-primary-500 bg-primary-50' 
                  : 'border-l-4 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className={`font-medium ${
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-gray-600 mt-1 text-sm">
                      {notification.message}
                    </p>
                    <p className="text-gray-400 mt-2 text-xs">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Test Notification Button (for development) */}
      {permissionStatus === 'granted' && (
        <div className="pwa-card bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Test Notifications</h3>
          <button
            onClick={() => {
              new Notification('Test Notification', {
                body: 'This is a test notification from Young Eagles PWA',
                icon: '/icon-192x192.png',
                badge: '/icon-72x72.png'
              })
            }}
            className="pwa-button"
          >
            Send Test Notification
          </button>
        </div>
      )}
    </div>
  )
}

