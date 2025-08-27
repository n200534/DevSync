'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Project, User } from '@/types'
import { 
  Plus, 
  X, 
  Save, 
  ArrowLeft,
  Users,
  Code,
  Globe,
  FileText,
  AlertCircle
} from 'lucide-react'

interface CreateProjectForm {
  title: string
  description: string
  techStack: string[]
  githubUrl: string
  liveUrl: string
  isOpenForCollaboration: boolean
  maxCollaborators: number
  requirements: string
}

export default function CreateProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newTech, setNewTech] = useState('')
  
  const [form, setForm] = useState<CreateProjectForm>({
    title: '',
    description: '',
    techStack: [],
    githubUrl: '',
    liveUrl: '',
    isOpenForCollaboration: true,
    maxCollaborators: 5,
    requirements: ''
  })

  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('devsync_token')
    const userData = localStorage.getItem('devsync_user')
    
    if (!token || !userData) {
      router.push('/auth/login')
      return
    }

    try {
      setUser(JSON.parse(userData))
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/auth/login')
    }
  }, [router])

  const handleInputChange = (field: keyof CreateProjectForm, value: string | boolean | number | string[]) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const addTechStack = () => {
    if (newTech.trim() && !form.techStack.includes(newTech.trim())) {
      setForm(prev => ({
        ...prev,
        techStack: [...prev.techStack, newTech.trim()]
      }))
      setNewTech('')
    }
  }

  const removeTechStack = (tech: string) => {
    setForm(prev => ({
      ...prev,
      techStack: prev.techStack.filter(t => t !== tech)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('devsync_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          techStack: form.techStack,
          githubUrl: form.githubUrl.trim() || undefined,
          liveUrl: form.liveUrl.trim() || undefined,
          isOpenForCollaboration: form.isOpenForCollaboration,
          maxCollaborators: form.maxCollaborators,
          requirements: form.requirements.trim() || undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create project')
      }

      const project = await response.json()
      router.push(`/projects/${project.id}`)
    } catch (error) {
      console.error('Error creating project:', error)
      setError(error instanceof Error ? error.message : 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
              <p className="text-gray-600">Share your project with the DevSync community</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Basic Information
            </h2>
            
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={form.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your project title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your project, its goals, and what makes it unique"
                  required
                />
              </div>

              {/* Tech Stack */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tech Stack
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechStack())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Add a technology (e.g., React, Node.js)"
                    />
                    <button
                      type="button"
                      onClick={addTechStack}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add</span>
                    </button>
                  </div>
                  
                  {form.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.techStack.map((tech, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {tech}
                          <button
                            type="button"
                            onClick={() => removeTechStack(tech)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Project Links
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub Repository
                </label>
                <input
                  type="url"
                  id="githubUrl"
                  value={form.githubUrl}
                  onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div>
                <label htmlFor="liveUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Live Demo
                </label>
                <input
                  type="url"
                  id="liveUrl"
                  value={form.liveUrl}
                  onChange={(e) => handleInputChange('liveUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://your-project.com"
                />
              </div>
            </div>
          </div>

          {/* Collaboration Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Collaboration Settings
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isOpenForCollaboration"
                  checked={form.isOpenForCollaboration}
                  onChange={(e) => handleInputChange('isOpenForCollaboration', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isOpenForCollaboration" className="text-sm font-medium text-gray-700">
                  Open for collaboration
                </label>
              </div>

              {form.isOpenForCollaboration && (
                <div>
                  <label htmlFor="maxCollaborators" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Collaborators
                  </label>
                  <input
                    type="number"
                    id="maxCollaborators"
                    value={form.maxCollaborators}
                    onChange={(e) => handleInputChange('maxCollaborators', parseInt(e.target.value))}
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements for Collaborators
                </label>
                <textarea
                  id="requirements"
                  value={form.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What skills or experience are you looking for in collaborators?"
                />
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Create Project</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
