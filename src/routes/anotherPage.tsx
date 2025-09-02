import { createFileRoute } from '@tanstack/react-router'
import { api } from '../../convex/_generated/api'
import { useMutation } from 'convex/react'
import { useState } from 'react'

export const Route = createFileRoute('/anotherPage')({
  component: AddQuestionPage,
})

function AddQuestionPage() {
  const addQuestion = useMutation(api.myFunctions.addLeetCodeQuestion)
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Easy' as 'Easy' | 'Medium' | 'Hard',
    category: '',
    company: '',
    url: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.category) return

    setIsSubmitting(true)
    try {
      await addQuestion({
        title: formData.title,
        difficulty: formData.difficulty,
        category: formData.category,
        company: formData.company || undefined,
        url: formData.url || undefined,
        description: formData.description || undefined
      })
      
      setSuccess(true)
      setFormData({
        title: '',
        difficulty: 'Easy',
        category: '',
        company: '',
        url: '',
        description: ''
      })
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to add question:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <a href="/" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
              ← Problems
            </a>
            <div className="text-slate-300">|</div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Add New Problem</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Problem Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Two Sum"
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Difficulty *
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="e.g., Array, String, Dynamic Programming"
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Company (optional)
                </label>
                <select
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                >
                  <option value="">Select Company</option>
                  <option value="Google">Google</option>
                  <option value="Meta">Meta</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Apple">Apple</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Netflix">Netflix</option>
                  <option value="Tesla">Tesla</option>
                  <option value="Uber">Uber</option>
                  <option value="Airbnb">Airbnb</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Twitter">Twitter</option>
                  <option value="Salesforce">Salesforce</option>
                  <option value="Oracle">Oracle</option>
                  <option value="Adobe">Adobe</option>
                  <option value="Nvidia">Nvidia</option>
                  <option value="ByteDance">ByteDance</option>
                  <option value="Stripe">Stripe</option>
                  <option value="Palantir">Palantir</option>
                  <option value="Goldman Sachs">Goldman Sachs</option>
                  <option value="JPMorgan">JPMorgan</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                LeetCode URL (optional)
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                placeholder="https://leetcode.com/problems/..."
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Problem Description (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the problem..."
                rows={4}
                className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white resize-none"
              />
            </div>

            <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-600">
              <button
                type="submit"
                disabled={isSubmitting || !formData.title || !formData.category}
                className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Adding Problem...' : 'Add Problem'}
              </button>
              <a
                href="/"
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
                <span className="font-medium">Problem added successfully!</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}