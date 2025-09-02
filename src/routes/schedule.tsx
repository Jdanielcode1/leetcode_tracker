import { createFileRoute } from '@tanstack/react-router'
import { api } from '../../convex/_generated/api'
import { useMutation } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useState } from 'react'

export const Route = createFileRoute('/schedule')({
  component: ScheduleInterview,
})

function ScheduleInterview() {
  const { data: questions } = useSuspenseQuery(
    convexQuery(api.myFunctions.getLeetCodeQuestions, {})
  )
  
  const createInterview = useMutation(api.myFunctions.createMockInterview)
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    duration: 60,
    participants: [''],
    selectedQuestionIds: [] as string[],
    notes: '',
    meetingLink: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.date || !formData.time) return

    setIsSubmitting(true)
    try {
      // Combine date and time into timestamp
      const dateTime = new Date(`${formData.date}T${formData.time}`)
      
      await createInterview({
        title: formData.title,
        date: dateTime.getTime(),
        duration: formData.duration,
        participants: formData.participants.filter(p => p.trim() !== ''),
        questionIds: formData.selectedQuestionIds as any,
        notes: formData.notes || undefined,
        meetingLink: formData.meetingLink || undefined,
      })
      
      setSuccess(true)
      setFormData({
        title: '',
        date: '',
        time: '',
        duration: 60,
        participants: [''],
        selectedQuestionIds: [],
        notes: '',
        meetingLink: ''
      })
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to create interview:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addParticipant = () => {
    setFormData(prev => ({ ...prev, participants: [...prev.participants, ''] }))
  }

  const updateParticipant = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.map((p, i) => i === index ? value : p)
    }))
  }

  const removeParticipant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index)
    }))
  }

  const toggleQuestion = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedQuestionIds: prev.selectedQuestionIds.includes(questionId)
        ? prev.selectedQuestionIds.filter(id => id !== questionId)
        : [...prev.selectedQuestionIds, questionId]
    }))
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50 border-green-200'
      case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'Hard': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-slate-600 bg-slate-50 border-slate-200'
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <a href="/calendar" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
              ← Calendar
            </a>
            <div className="text-slate-300">|</div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Schedule Mock Interview</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Interview Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Google SWE Mock Interview"
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Duration (minutes) *
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                >
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>

            {/* Participants */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Participants
              </label>
              <div className="space-y-2">
                {formData.participants.map((participant, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={participant}
                      onChange={(e) => updateParticipant(index, e.target.value)}
                      placeholder="Friend's name or email"
                      className="flex-1 p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                    />
                    {formData.participants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeParticipant(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addParticipant}
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  + Add Participant
                </button>
              </div>
            </div>

            {/* Meeting Link */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Meeting Link (optional)
              </label>
              <input
                type="url"
                value={formData.meetingLink}
                onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>

            {/* Question Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Select Questions ({formData.selectedQuestionIds.length} selected)
              </label>
              <div className="max-h-64 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-lg">
                {questions.map((question) => (
                  <div
                    key={question._id}
                    className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 border-b border-slate-200 dark:border-slate-600 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedQuestionIds.includes(question._id)}
                      onChange={() => toggleQuestion(question._id)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {question.title}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                        <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-600 px-2 py-1 rounded">
                          {question.category}
                        </span>
                        {question.company && (
                          <span className="text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 px-2 py-1 rounded">
                            {question.company}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional notes about the interview..."
                rows={3}
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white resize-none"
              />
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-600">
              <button
                type="submit"
                disabled={isSubmitting || !formData.title || !formData.date || !formData.time}
                className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Scheduling...' : 'Schedule Interview'}
              </button>
              <a
                href="/calendar"
                className="flex-1 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 py-3 px-6 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors text-center"
              >
                Cancel
              </a>
            </div>
          </form>

          {success && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span className="font-medium">Mock interview scheduled successfully!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
