function Dashboard() {
  const upcomingEvents = [
    { id: 1, title: "Parent-Teacher Conference", date: "2025-07-25", time: "10:00 AM" },
    { id: 2, title: "School Holiday", date: "2025-08-01", time: "All Day" },
    { id: 3, title: "Science Fair", date: "2025-08-15", time: "09:00 AM" },
  ]

  const recentActivities = [
    { id: 1, description: "Submitted Math Homework", student: "Alice Smith", time: "1 hour ago" },
    { id: 2, description: "Attended English Class", student: "Bob Johnson", time: "3 hours ago" },
    { id: 3, description: "Received Grade for History Quiz", student: "Alice Smith", time: "1 day ago" },
  ]

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Upcoming Events</h2>
          {upcomingEvents.length === 0 ? (
            <p className="text-gray-600">No upcoming events.</p>
          ) : (
            <ul className="space-y-3">
              {upcomingEvents.map((event) => (
                <li key={event.id} className="border-b pb-3 last:border-b-0">
                  <p className="font-medium text-gray-800">{event.title}</p>
                  <p className="text-gray-600 text-sm">
                    {event.date} at {event.time}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
          {recentActivities.length === 0 ? (
            <p className="text-gray-600">No recent activities.</p>
          ) : (
            <ul className="space-y-3">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="border-b pb-3 last:border-b-0">
                  <p className="font-medium text-gray-800">{activity.description}</p>
                  <p className="text-gray-600 text-sm">
                    <span className="font-semibold">{activity.student}</span> - {activity.time}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="flex flex-wrap gap-4">
          <a href="/children" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md">
            My Children
          </a>
          <a href="/homework" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md">
            Homework
          </a>
          <a href="/classes" className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg shadow-md">
            Classes
          </a>
          <a
            href="/notifications"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-md"
          >
            Notifications
          </a>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
