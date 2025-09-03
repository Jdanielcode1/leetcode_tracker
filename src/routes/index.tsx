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
  const { data: companies } = useSuspenseQuery(
    convexQuery(api.myFunctions.getCompanies, {})
  )
  
  const updateProgress = useMutation(api.myFunctions.updateUserProgress)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [noteText, setNoteText] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<string>("All")
  
  // Filter questions by company
  const filteredQuestions = selectedCompany === "All" 
    ? questions 
    : questions.filter(q => q.company === selectedCompany)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200'
      case 'DONE': return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'TODO': return '○'
      case 'IN_PROGRESS': return '◐'
      case 'DONE': return '●'
      default: return '○'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50 border-green-200'
      case 'Medium': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'Hard': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const updateQuestionStatus = (questionId: string, newStatus: string, notes?: string) => {
    updateProgress({
      questionId: questionId as any,
      status: newStatus as any,
      notes: notes || undefined
    })
  }

  const saveNotes = (questionId: string, currentStatus: string) => {
    updateQuestionStatus(questionId, currentStatus, noteText)
    setEditingNotes(null)
    setNoteText("")
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                LeetCode Tracker
              </h1>
              {/* Progress Summary - Inline */}
              <div className="hidden md:flex items-center gap-6 ml-8">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {filteredQuestions.filter(q => q.status === 'TODO').length} Todo
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {filteredQuestions.filter(q => q.status === 'IN_PROGRESS').length} In Progress
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {filteredQuestions.filter(q => q.status === 'DONE').length} Solved
                  </span>
                </div>
                <div className="text-sm text-slate-500">
                  {filteredQuestions.length} total
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Company Filter */}
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="All">All Companies</option>
                {companies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
              <a
                href="/calendar"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                📅 Calendar
              </a>
              <a
                href="/anotherPage"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                + Add Problem
              </a>
            </div>
          </div>
          
          {/* Mobile Progress Summary */}
          <div className="md:hidden mt-3 flex justify-between text-sm">
            <span className="text-slate-600">{filteredQuestions.filter(q => q.status === 'TODO').length} Todo</span>
            <span className="text-yellow-600">{filteredQuestions.filter(q => q.status === 'IN_PROGRESS').length} In Progress</span>
            <span className="text-green-600">{filteredQuestions.filter(q => q.status === 'DONE').length} Solved</span>
            <span className="text-slate-500">{filteredQuestions.length} Total</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Questions Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Table Header */}
          <div className="bg-slate-50 dark:bg-slate-700 px-6 py-3 border-b border-slate-200 dark:border-slate-600">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-slate-700 dark:text-slate-300">
              <div className="col-span-1">Status</div>
              <div className="col-span-3">Problem</div>
              <div className="col-span-2">Difficulty</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Company</div>
              <div className="col-span-1">Complexity</div>
              <div className="col-span-1">Topics</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredQuestions.map((question) => (
              <div key={question._id} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Status Column */}
                  <div className="col-span-1">
                    <div className="flex gap-1">
                      {['TODO', 'IN_PROGRESS', 'DONE'].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateQuestionStatus(question._id, status, question.notes)}
                          className={`w-6 h-6 rounded-full text-xs font-bold transition-all ${
                            question.status === status
                              ? getStatusColor(status)
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200 border border-slate-300'
                          }`}
                          title={status.replace('_', ' ')}
                        >
                          {getStatusIcon(status)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Problem Title Column */}
                  <div className="col-span-3">
                    <a 
                      href={`/question/${question._id}`}
                      className="text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
                    >
                      {question.title}
                    </a>
                    {question.notes && (
                      <div className="text-xs text-slate-500 mt-1 truncate">
                        {question.notes.substring(0, 40)}...
                      </div>
                    )}
                  </div>

                  {/* Difficulty Column */}
                  <div className="col-span-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                  </div>

                  {/* Category Column */}
                  <div className="col-span-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-600 px-2 py-1 rounded text-xs">
                      {question.category}
                    </span>
                  </div>

                  {/* Company Column */}
                  <div className="col-span-2">
                    {question.company ? (
                      <span className="text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 px-2 py-1 rounded text-xs font-medium">
                        {question.company}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </div>

                  {/* Complexity Column */}
                  <div className="col-span-1">
                    <div className="text-xs space-y-1">
                      {question.timeComplexity && (
                        <div className="font-mono text-slate-600 dark:text-slate-400">
                          T: {question.timeComplexity}
                        </div>
                      )}
                      {question.spaceComplexity && (
                        <div className="font-mono text-slate-600 dark:text-slate-400">
                          S: {question.spaceComplexity}
                        </div>
                      )}
                      {!question.timeComplexity && !question.spaceComplexity && (
                        <span className="text-slate-400 italic">-</span>
                      )}
                    </div>
                  </div>

                  {/* Topics Column */}
                  <div className="col-span-1">
                    {question.topics && question.topics.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {question.topics.slice(0, 1).map((topic, index) => (
                          <span
                            key={index}
                            className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-xs"
                          >
                            {topic.length > 6 ? topic.substring(0, 6) + '...' : topic}
                          </span>
                        ))}
                        {question.topics.length > 1 && (
                          <span className="text-xs text-slate-500">
                            +{question.topics.length - 1}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </div>
                </div>

                {/* Expandable Notes Section */}
                {editingNotes === question._id && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add your notes..."
                      className="w-full p-3 text-sm border border-slate-300 rounded-md resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => saveNotes(question._id, question.status)}
                        className="px-3 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingNotes(null)}
                        className="px-3 py-1 text-xs bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {questions.length === 0 && (
          <div className="text-center text-slate-500 py-12">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-lg font-medium mb-2">No problems yet!</p>
            <p className="text-sm mb-4">Start building your LeetCode practice log</p>
            <a
              href="/anotherPage"
              className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Add Your First Problem
            </a>
          </div>
        )}
      </div>
    </main>
  )
}
