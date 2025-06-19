import { useState } from 'react'
import { BookOpen, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function Homework() {
  const [homeworkList, setHomeworkList] = useState([
    {
      id: 1,
      subject: 'Mathematics',
      title: 'Algebra Problem Set 1',
      description: 'Complete exercises 1-20 from chapter 3',
      dueDate: '2024-06-20',
      status: 'pending',
      priority: 'high',
      submittedBy: null
    },
    {
      id: 2,
      subject: 'English',
      title: 'Essay: My Summer Vacation',
      description: 'Write a 500-word essay about your summer vacation plans',
      dueDate: '2024-06-18',
      status: 'completed',
      priority: 'medium',
      submittedBy: 'John Doe'
    },
    {
      id: 3,
      subject: 'Science',
      title: 'Plant Growth Experiment',
      description: 'Document the growth of your plant for 2 weeks',
      dueDate: '2024-06-25',
      status: 'in-progress',
      priority: 'low',
      submittedBy: null
    }
  ])

  const [filter, setFilter] = useState('all')

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />
      case 'pending':
        return <Clock className="text-orange-500" size={20} />
      case 'in-progress':
        return <AlertCircle className="text-blue-500" size={20} />
      default:
        return <Clock className="text-gray-500" size={20} />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`
    return `Due in ${diffDays} days`
  }

  const getDueDateColor = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'text-red-600' // Overdue
    if (diffDays <= 1) return 'text-orange-600' // Due today or tomorrow
    return 'text-gray-600' // Future
  }

  const filteredHomework = homeworkList.filter(hw => {
    if (filter === 'all') return true
    return hw.status === filter
  })

  const stats = {
    total: homeworkList.length,
    pending: homeworkList.filter(hw => hw.status === 'pending').length,
    inProgress: homeworkList.filter(hw => hw.status === 'in-progress').length,
    completed: homeworkList.filter(hw => hw.status === 'completed').length
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Homework</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="pwa-card text-center">
          <div className="text-2xl font-bold text-primary-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="pwa-card text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="pwa-card text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </div>
        <div className="pwa-card text-center">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'in-progress', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Homework List */}
      <div className="space-y-4">
        {filteredHomework.length === 0 ? (
          <div className="pwa-card text-center py-8">
            <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No homework found
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? "No homework assignments available." 
                : `No ${filter.replace('-', ' ')} homework assignments.`}
            </p>
          </div>
        ) : (
          filteredHomework.map((homework) => (
            <div key={homework.id} className="pwa-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  {getStatusIcon(homework.status)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{homework.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(homework.priority)}`}>
                        {homework.priority}
                      </span>
                    </div>
                    <p className="text-sm text-primary-600 font-medium mb-2">{homework.subject}</p>
                    <p className="text-gray-600 text-sm">{homework.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Calendar size={16} className="text-gray-400" />
                    <span className={`text-sm ${getDueDateColor(homework.dueDate)}`}>
                      {formatDate(homework.dueDate)}
                    </span>
                  </div>
                  {homework.submittedBy && (
                    <div className="text-sm text-gray-500">
                      Submitted by: {homework.submittedBy}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {homework.status === 'pending' && (
                    <button
                      onClick={() => {
                        setHomeworkList(prev => 
                          prev.map(hw => 
                            hw.id === homework.id 
                              ? { ...hw, status: 'in-progress' }
                              : hw
                          )
                        )
                      }}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start
                    </button>
                  )}
                  {homework.status === 'in-progress' && (
                    <button
                      onClick={() => {
                        setHomeworkList(prev => 
                          prev.map(hw => 
                            hw.id === homework.id 
                              ? { ...hw, status: 'completed', submittedBy: 'Current User' }
                              : hw
                          )
                        )
                      }}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Complete
                    </button>
                  )}
                  <button className="px-3 py-1 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Offline Note */}
      <div className="pwa-card bg-blue-50 border border-blue-200">
        <div className="flex items-start space-x-3">
          <BookOpen className="text-blue-600 mt-1" size={20} />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">
              Offline Functionality
            </h3>
            <p className="text-sm text-blue-700">
              Homework data is cached for offline access. Changes will sync when you're back online.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

