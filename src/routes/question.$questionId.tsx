import { createFileRoute } from '@tanstack/react-router'
import { api } from '../../convex/_generated/api'
import { useMutation } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export const Route = createFileRoute('/question/$questionId')({
  component: QuestionDetail,
})

function QuestionDetail() {
  const { questionId } = Route.useParams()
  const { user } = useAuth()
  const { data: question } = useSuspenseQuery(
    convexQuery(api.myFunctions.getQuestionById, { 
      questionId: questionId as any,
      currentUser: user?.username
    })
  )
  
  const updateProgress = useMutation(api.myFunctions.updateUserProgress)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    notes: question?.notes || '',
    timeComplexity: question?.timeComplexity || '',
    spaceComplexity: question?.spaceComplexity || '',
    complexityNotes: question?.complexityNotes || '',
    explanation: question?.explanation || '',
    topics: question?.topics || [],
    newTopic: ''
  })

  if (!question) {
    return (
      <main className="p-8 max-w-4xl mx-auto">
        <div className="text-center text-red-500">
          <h1 className="text-2xl font-bold mb-4">Question Not Found</h1>
          <a href="/" className="text-blue-500 hover:underline">← Back to Questions</a>
        </div>
      </main>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-slate-200 text-slate-800 border-slate-400 hover:bg-slate-300 shadow-sm'
      case 'IN_PROGRESS': return 'bg-amber-400 text-amber-900 border-amber-500 hover:bg-amber-500 shadow-md font-medium'
      case 'DONE': return 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600 shadow-md font-medium'
      default: return 'bg-slate-200 text-slate-800 border-slate-400 hover:bg-slate-300 shadow-sm'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50 border-green-200'
      case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'Hard': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-slate-600 bg-slate-50 border-slate-200'
    }
  }

  const updateQuestionStatus = (newStatus: string) => {
    if (!user?.username) return
    
    updateProgress({
      questionId: question._id as any,
      username: user.username,
      status: newStatus as any,
      notes: question.notes,
      timeComplexity: question.timeComplexity,
      spaceComplexity: question.spaceComplexity,
      complexityNotes: question.complexityNotes,
      explanation: question.explanation,
      topics: question.topics,
    })
  }

  const handleSave = () => {
    if (!user?.username) return
    
    updateProgress({
      questionId: question._id as any,
      username: user.username,
      status: question.status as any,
      notes: editData.notes,
      timeComplexity: editData.timeComplexity,
      spaceComplexity: editData.spaceComplexity,
      complexityNotes: editData.complexityNotes,
      explanation: editData.explanation || '',
      topics: editData.topics,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData({
      notes: question.notes || '',
      timeComplexity: question.timeComplexity || '',
      spaceComplexity: question.spaceComplexity || '',
      complexityNotes: question.complexityNotes || '',
      explanation: question.explanation || '',
      topics: question.topics || [],
      newTopic: ''
    })
    setIsEditing(false)
  }

  const addTopic = () => {
    if (editData.newTopic.trim() && !editData.topics.includes(editData.newTopic.trim())) {
      setEditData(prev => ({
        ...prev,
        topics: [...prev.topics, prev.newTopic.trim()],
        newTopic: ''
      }))
    }
  }

  const removeTopic = (topicToRemove: string) => {
    setEditData(prev => ({
      ...prev,
      topics: prev.topics.filter(topic => topic !== topicToRemove)
    }))
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
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{question.title}</h1>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-600 px-3 py-1 rounded-full">
                {question.category}
              </span>
              {question.url && (
                <a 
                  href={question.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  View on LeetCode ↗
                </a>
              )}
            </div>

            {/* Status Buttons */}
            <div className="flex gap-2">
              {['TODO', 'IN_PROGRESS', 'DONE'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateQuestionStatus(status)}
                  className={`px-3 py-1.5 text-sm font-medium border rounded-lg transition-all ${
                    question.status === status
                      ? getStatusColor(status)
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-600'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* Description */}
        {question.description && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Problem Description</h2>
            <p className="text-slate-700 dark:text-slate-300">{question.description}</p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Solution Notes */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Solution Notes</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-700 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-4">
                  <textarea
                    value={editData.notes}
                    onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add your solution notes, approach, key insights..."
                    className="w-full p-3 border border-slate-300 rounded-md resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600"
                    rows={8}
                  />
                </div>
              ) : (
                <div className="min-h-[6rem] p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md">
                  {question.notes || (
                    <span className="text-slate-400 italic">No notes yet. Click Edit to add your solution approach and insights.</span>
                  )}
                </div>
              )}
            </div>

            {/* Solution Explanation */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Solution Explanation</h2>
              
              {isEditing ? (
                <textarea
                  value={editData.explanation}
                  onChange={(e) => setEditData(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Explain your solution step by step... How does the algorithm work? What's the intuition behind it?"
                  className="w-full p-3 border border-slate-300 rounded-md resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600"
                  rows={6}
                />
              ) : (
                <div className="min-h-[4rem] p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md">
                  {question.explanation || (
                    <span className="text-slate-400 italic">No explanation yet. Click Edit to add a detailed explanation of your solution approach.</span>
                  )}
                </div>
              )}
            </div>

            {/* Topics & Concepts */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Key Topics & Concepts</h2>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editData.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {topic}
                        <button
                          onClick={() => removeTopic(topic)}
                          className="text-emerald-600 hover:text-emerald-800 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editData.newTopic}
                      onChange={(e) => setEditData(prev => ({ ...prev, newTopic: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                      placeholder="Add a topic (e.g., Hash Table, Two Pointers)"
                      className="flex-1 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600"
                    />
                    <button
                      onClick={addTopic}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {question.topics && question.topics.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {question.topics.map((topic, index) => (
                        <span
                          key={index}
                          className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-400 italic">No topics added yet. Click Edit to add key concepts needed for this problem.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Complexity Analysis */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Complexity Analysis</h2>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Time Complexity
                      </label>
                      <input
                        type="text"
                        value={editData.timeComplexity}
                        onChange={(e) => setEditData(prev => ({ ...prev, timeComplexity: e.target.value }))}
                        placeholder="e.g., O(n), O(log n)"
                        className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Space Complexity
                      </label>
                      <input
                        type="text"
                        value={editData.spaceComplexity}
                        onChange={(e) => setEditData(prev => ({ ...prev, spaceComplexity: e.target.value }))}
                        placeholder="e.g., O(1), O(n)"
                        className="w-full p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Complexity Explanation
                    </label>
                    <textarea
                      value={editData.complexityNotes}
                      onChange={(e) => setEditData(prev => ({ ...prev, complexityNotes: e.target.value }))}
                      placeholder="Explain why this complexity... what operations contribute to it?"
                      className="w-full p-3 border border-slate-300 rounded-md resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600"
                      rows={4}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Time Complexity</div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div className="font-mono text-xl text-slate-900 dark:text-white">
                          {question.timeComplexity || <span className="text-slate-400 italic text-base">Not specified</span>}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Space Complexity</div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                        <div className="font-mono text-xl text-slate-900 dark:text-white">
                          {question.spaceComplexity || <span className="text-slate-400 italic text-base">Not specified</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  {question.complexityNotes && (
                    <div>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Explanation</div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-md border border-slate-200 dark:border-slate-600">
                        {question.complexityNotes}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Timeline */}
            {(question.startedAt || question.completedAt) && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Timeline</h3>
                <div className="space-y-3">
                  {question.startedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">Started</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(question.startedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                  {question.completedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">Completed</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(question.completedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 pt-6">
            <button
              onClick={handleSave}
              className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="bg-slate-300 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Collaborative Section - Other Users' Contributions */}
        {question.completedByUsers && question.completedByUsers.length > 0 && (
          <div className="mt-8 p-6 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Community Solutions ({question.completedByUsers.length} user{question.completedByUsers.length > 1 ? 's' : ''})
            </h3>
            
            <div className="space-y-6">
              {question.completedByUsers.map((userSolution: any, index: number) => (
                <div key={`${userSolution.username}-${index}`} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-sm font-bold text-emerald-700">
                        {userSolution.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {userSolution.username}
                        </div>
                        {userSolution.completedAt && (
                          <div className="text-xs text-slate-500">
                            Completed {new Date(userSolution.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Complexity Analysis */}
                    {(userSolution.timeComplexity || userSolution.spaceComplexity) && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Complexity</h4>
                        <div className="space-y-1">
                          {userSolution.timeComplexity && (
                            <div className="text-sm">
                              <span className="text-slate-600 dark:text-slate-400">Time: </span>
                              <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs font-mono">
                                {userSolution.timeComplexity}
                              </code>
                            </div>
                          )}
                          {userSolution.spaceComplexity && (
                            <div className="text-sm">
                              <span className="text-slate-600 dark:text-slate-400">Space: </span>
                              <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs font-mono">
                                {userSolution.spaceComplexity}
                              </code>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Notes/Explanation */}
                    {(userSolution.notes || userSolution.explanation) && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          {userSolution.explanation ? 'Explanation' : 'Notes'}
                        </h4>
                        <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 p-3 rounded">
                          {userSolution.explanation || userSolution.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
