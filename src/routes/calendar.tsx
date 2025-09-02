import { createFileRoute } from '@tanstack/react-router'
import { api } from '../../convex/_generated/api'
import { useMutation } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useState } from 'react'

export const Route = createFileRoute('/calendar')({
  component: Calendar,
})

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
  // Get current month's interviews
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  
  const { data: interviews } = useSuspenseQuery(
    convexQuery(api.myFunctions.getMockInterviewsByDateRange, {
      startDate: startOfMonth.getTime(),
      endDate: endOfMonth.getTime(),
    })
  )

  const { data: questions } = useSuspenseQuery(
    convexQuery(api.myFunctions.getLeetCodeQuestions, {})
  )

  const updateInterviewStatus = useMutation(api.myFunctions.updateMockInterviewStatus)
  const deleteInterview = useMutation(api.myFunctions.deleteMockInterview)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-300'
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-slate-100 text-slate-800 border-slate-300'
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getInterviewsForDate = (date: Date) => {
    return interviews.filter(interview => {
      const interviewDate = new Date(interview.date)
      return interviewDate.toDateString() === date.toDateString()
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <a href="/" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
              ← Problems
            </a>
            <div className="text-slate-300">|</div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Mock Interview Calendar</h1>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                ←
              </button>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                →
              </button>
            </div>
            
            <a
              href="/schedule"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Schedule Interview
            </a>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-700">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-4 text-center text-sm font-medium text-slate-700 dark:text-slate-300">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-200 dark:divide-slate-700">
            {getDaysInMonth().map((date, index) => (
              <div
                key={index}
                className="min-h-[120px] p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                onClick={() => date && setSelectedDate(date)}
              >
                {date && (
                  <>
                    <div className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {getInterviewsForDate(date).map(interview => (
                        <div
                          key={interview._id}
                          className={`text-xs px-2 py-1 rounded border ${getStatusColor(interview.status)} truncate`}
                          title={`${interview.title} - ${formatTime(interview.date)}`}
                        >
                          {formatTime(interview.date)} {interview.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Interviews List */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Upcoming Interviews</h3>
          <div className="space-y-4">
            {interviews
              .filter(interview => interview.date > Date.now() && interview.status === 'SCHEDULED')
              .sort((a, b) => a.date - b.date)
              .slice(0, 5)
              .map(interview => (
                <div key={interview._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900 dark:text-white">{interview.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(interview.date)} at {formatTime(interview.date)}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {interview.duration} minutes • {interview.participants.join(', ')}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {interview.questions.length} questions
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateInterviewStatus({ 
                        interviewId: interview._id as any, 
                        status: 'COMPLETED' 
                      })}
                      className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Mark Complete
                    </button>
                    <button
                      onClick={() => deleteInterview({ interviewId: interview._id as any })}
                      className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>


    </main>
  )
}
