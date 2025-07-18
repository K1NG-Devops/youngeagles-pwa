function Notifications() {
  const notifications = [
    { id: 1, message: "New homework assigned for Math.", time: "2 hours ago" },
    { id: 2, message: "Your payment for April is due soon.", time: "1 day ago" },
    { id: 3, message: "School will be closed on Friday.", time: "3 days ago" },
  ]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      {notifications.length === 0 ? (
        <p className="text-gray-600">No new notifications.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
              <div>
                <p className="text-gray-800 font-medium">{notification.message}</p>
                <p className="text-gray-500 text-sm">{notification.time}</p>
              </div>
              <button className="text-blue-500 hover:text-blue-700 text-sm">Mark as Read</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
