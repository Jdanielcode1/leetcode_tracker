import { createFileRoute } from '@tanstack/react-router'
import { api } from '../../convex/_generated/api'
import { useMutation } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const { data: questions } = useSuspenseQuery(
    convexQuery(api.myFunctions.getQuestionsWithProgress, {})
  )
  
  const updateProgress = useMutation(api.myFunctions.updateUserProgress)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [noteText, setNoteText] = useState("")

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'DONE': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600'
      case 'Medium': return 'text-yellow-600'
      case 'Hard': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const updateQuestionStatus = (questionId: string, newStatus: string, notes?: string) => {
    updateProgress({
      questionId: questionId as any,
      status: newStatus as any,
      notes: notes || undefined
    })
  }

  const startEditingNotes = (questionId: string, currentNotes: string) => {
    setEditingNotes(questionId)
    setNoteText(currentNotes)
  }

  const saveNotes = (questionId: string, currentStatus: string) => {
    updateQuestionStatus(questionId, currentStatus, noteText)
    setEditingNotes(null)
    setNoteText("")
  }

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-2">
          🧠 LeetCode Tracker
        </h1>
        <p className="text-gray-600 text-center mb-4">
          Track your progress on coding problems
        </p>
        <div className="text-center">
          <a
            href="/anotherPage"
            className="bg-blue-500 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-600 transition-colors inline-block"
          >
            ➕ Add New Question
          </a>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-600">
            {questions.filter(q => q.status === 'TODO').length}
          </div>
          <div className="text-sm text-gray-500">To Do</div>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {questions.filter(q => q.status === 'IN_PROGRESS').length}
          </div>
          <div className="text-sm text-blue-500">In Progress</div>
        </div>
        <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {questions.filter(q => q.status === 'DONE').length}
          </div>
          <div className="text-sm text-green-500">Completed</div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question) => (
          <div key={question._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{question.title}</h3>
                  <span className={`text-sm font-medium ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty}
                  </span>
                  <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {question.category}
                  </span>
                </div>

                {/* Status Buttons */}
                <div className="flex gap-2 mb-3">
                  {['TODO', 'IN_PROGRESS', 'DONE'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateQuestionStatus(question._id, status, question.notes)}
                      className={`px-3 py-1 text-xs font-medium border rounded-full transition-colors ${
                        question.status === status
                          ? getStatusColor(status)
                          : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                {/* Notes Section */}
                <div className="mt-3">
                  {editingNotes === question._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add your notes..."
                        className="w-full p-2 text-sm border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveNotes(question._id, question.status)}
                          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingNotes(null)}
                          className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => startEditingNotes(question._id, question.notes)}
                      className="min-h-[2rem] p-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      {question.notes || (
                        <span className="text-gray-400 italic">Click to add notes...</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Timestamps */}
                {(question.startedAt || question.completedAt) && (
                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                    {question.startedAt && (
                      <div>Started: {new Date(question.startedAt).toLocaleDateString()}</div>
                    )}
                    {question.completedAt && (
                      <div>Completed: {new Date(question.completedAt).toLocaleDateString()}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {questions.length === 0 && (
        <div className="text-center text-gray-500 mt-12">
          <p className="text-lg">No questions yet!</p>
          <p className="text-sm">Add some LeetCode questions to get started.</p>
        </div>
      )}
    </main>
  )
}
