'use client'

import { useState } from 'react'
import { 
  X, 
  Code, 
  Trophy, 
  Bookmark, 
  Users, 
  Star,
  Image,
  Link,
  Hash,
  Smile
} from 'lucide-react'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (post: any) => void
}

export default function CreatePostModal({ isOpen, onClose, onSubmit }: CreatePostModalProps) {
  const [postType, setPostType] = useState<'achievement' | 'project' | 'learning' | 'milestone' | 'collaboration'>('achievement')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    techStack: [] as string[],
    githubUrl: '',
    liveUrl: ''
  })
  const [achievementData, setAchievementData] = useState({
    title: '',
    description: '',
    badge: ''
  })

  const postTypes = [
    { id: 'achievement', label: 'Achievement', icon: Trophy, color: 'text-yellow-500' },
    { id: 'project', label: 'Project', icon: Code, color: 'text-blue-500' },
    { id: 'learning', label: 'Learning', icon: Bookmark, color: 'text-green-500' },
    { id: 'milestone', label: 'Milestone', icon: Star, color: 'text-purple-500' },
    { id: 'collaboration', label: 'Collaboration', icon: Users, color: 'text-orange-500' }
  ]

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const addTechStack = (tech: string) => {
    if (tech.trim() && !projectData.techStack.includes(tech.trim())) {
      setProjectData({
        ...projectData,
        techStack: [...projectData.techStack, tech.trim()]
      })
    }
  }

  const removeTechStack = (tech: string) => {
    setProjectData({
      ...projectData,
      techStack: projectData.techStack.filter(t => t !== tech)
    })
  }

  const handleSubmit = () => {
    const post = {
      type: postType,
      content,
      tags,
      ...(postType === 'project' && { project: projectData }),
      ...(postType === 'achievement' && { achievement: achievementData })
    }
    
    onSubmit(post)
    onClose()
    
    // Reset form
    setContent('')
    setTags([])
    setProjectData({ title: '', description: '', techStack: [], githubUrl: '', liveUrl: '' })
    setAchievementData({ title: '', description: '', badge: '' })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Post</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Post Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Post Type</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {postTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => setPostType(type.id as any)}
                  className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                    postType === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <type.icon className={`h-6 w-6 mb-2 ${type.color}`} />
                  <span className="text-sm font-medium text-gray-900">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What&apos;s on your mind?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Share your thoughts, achievements, or experiences..."
            />
          </div>

          {/* Project-specific fields */}
          {postType === 'project' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Project Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
                <input
                  type="text"
                  value={projectData.title}
                  onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter project title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={projectData.description}
                  onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your project"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tech Stack</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add technology"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTechStack((e.target as HTMLInputElement).value)
                        ;(e.target as HTMLInputElement).value = ''
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add technology"]') as HTMLInputElement
                      if (input) {
                        addTechStack(input.value)
                        input.value = ''
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {projectData.techStack.map(tech => (
                    <span
                      key={tech}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                    >
                      {tech}
                      <button
                        onClick={() => removeTechStack(tech)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GitHub URL</label>
                  <input
                    type="url"
                    value={projectData.githubUrl}
                    onChange={(e) => setProjectData({ ...projectData, githubUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://github.com/username/repo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Live Demo URL</label>
                  <input
                    type="url"
                    value={projectData.liveUrl}
                    onChange={(e) => setProjectData({ ...projectData, liveUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://your-project.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Achievement-specific fields */}
          {postType === 'achievement' && (
            <div className="space-y-4 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-gray-900">Achievement Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Achievement Title</label>
                <input
                  type="text"
                  value={achievementData.title}
                  onChange={(e) => setAchievementData({ ...achievementData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Open Source Contributor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={achievementData.description}
                  onChange={(e) => setAchievementData({ ...achievementData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 100+ contributions to open source projects"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Badge Level (Optional)</label>
                <select
                  value={achievementData.badge}
                  onChange={(e) => setAchievementData({ ...achievementData, badge: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select badge level</option>
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Hash className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-gray-600 hover:text-gray-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  )
}
