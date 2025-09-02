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
        url: formData.url || undefined,
        description: formData.description || undefined
      })
      
      setSuccess(true)
      setFormData({
        title: '',
        difficulty: 'Easy',
        category: '',
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
    <main className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-2">
          ➕ Add New Question
        </h1>
        <p className="text-gray-600 text-center">
          Add a new LeetCode question to track
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Question Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Two Sum"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Difficulty *
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => handleInputChange('difficulty', e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category *
            </label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              placeholder="e.g., Array, String, Dynamic Programming"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              LeetCode URL (optional)
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => handleInputChange('url', e.target.value)}
              placeholder="https://leetcode.com/problems/..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of the problem..."
              rows={3}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !formData.title || !formData.category}
              className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Question'}
            </button>
            <a
              href="/"
              className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-center"
            >
              Cancel
            </a>
          </div>
        </form>

        {success && (
          <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
            ✅ Question added successfully!
          </div>
        )}
      </div>
    </main>
  )
}