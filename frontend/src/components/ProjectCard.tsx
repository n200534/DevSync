'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Code, 
  Users, 
  Calendar, 
  ExternalLink, 
  Github, 
  Eye, 
  Star,
  TrendingUp,
  MessageCircle,
  UserPlus
} from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  githubUrl?: string
  liveUrl?: string
  isOpenForCollaboration: boolean
  maxCollaborators: number
  createdAt: string
  owner: {
    id: string
    username: string
    name: string
    avatar: string
    title?: string
    company?: string
  }
  collaborators?: Array<{
    id: string
    username: string
    name: string
    avatar: string
  }>
  applications?: Array<{
    id: string
    status: string
    user: {
      id: string
      username: string
      name: string
      avatar: string
    }
  }>
  stats?: {
    views: number
    likes: number
    applications: number
  }
}

interface ProjectCardProps {
  project: Project
  showActions?: boolean
  onApply?: (projectId: string) => void
  onLike?: (projectId: string) => void
}

export default function ProjectCard({ 
  project, 
  showActions = true, 
  onApply, 
  onLike 
}: ProjectCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  const handleLike = () => {
    setIsLiked(!isLiked)
    onLike?.(project.id)
  }

  const handleApply = async () => {
    setIsApplying(true)
    try {
      await onApply?.(project.id)
    } finally {
      setIsApplying(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link 
              href={`/projects/${project.id}`}
              className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {project.title}
            </Link>
            <p className="text-gray-600 mt-1 line-clamp-2">{project.description}</p>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            {project.isOpenForCollaboration && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                Open for Collaboration
              </span>
            )}
            <button
              onClick={handleLike}
              className={`p-2 rounded-lg transition-colors ${
                isLiked 
                  ? 'text-red-500 bg-red-50' 
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Star className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Owner Info */}
        <div className="flex items-center space-x-3 mb-4">
          <img 
            src={project.owner.avatar || '/default-avatar.png'} 
            alt={project.owner.name}
            className="h-8 w-8 rounded-full object-cover"
          />
          <div>
            <Link 
              href={`/profile/${project.owner.username}`}
              className="text-sm font-medium text-gray-900 hover:text-blue-600"
            >
              {project.owner.name}
            </Link>
            <p className="text-xs text-gray-500">
              {project.owner.title && `${project.owner.title} at ${project.owner.company}`}
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.techStack.slice(0, 6).map((tech, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium"
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 6 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
              +{project.techStack.length - 6} more
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{project.collaborators?.length || 0} collaborators</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(project.createdAt)}</span>
          </div>
          {project.stats && (
            <>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{project.stats.views}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{project.stats.applications}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="p-4 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Project Links */}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="View on GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                title="View Live Demo"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href={`/projects/${project.id}`}
              className="px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm"
            >
              View Details
            </Link>
            
            {project.isOpenForCollaboration && (
              <button
                onClick={handleApply}
                disabled={isApplying}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center space-x-1"
              >
                {isApplying ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span>Applying...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3 w-3" />
                    <span>Apply to Join</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
