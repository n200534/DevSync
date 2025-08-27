'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Project, User, Application } from '@/types'
import { 
  ArrowLeft,
  Users,
  Code,
  Globe,
  Calendar,
  Star,
  Plus,
  Send,
  ExternalLink,
  Github as GitHub,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

interface ProjectDetailData {
  project: Project
  applications: Application[]
  isOwner: boolean
  hasApplied: boolean
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  
  const [projectData, setProjectData] = useState<ProjectDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Check authentication
        const token = localStorage.getItem('devsync_token')
        const userData = localStorage.getItem('devsync_user')
        
        if (!token || !userData) {
          router.push('/auth/login')
          return
        }

        const currentUser = JSON.parse(userData)
        setUser(currentUser)

        // Fetch project data
        const [projectResponse, applicationsResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/applications`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ])

        if (!projectResponse.ok) {
          throw new Error('Project not found')
        }

        const project = await projectResponse.json()
        const applications = applicationsResponse.ok ? await applicationsResponse.json() : []
        
        const isOwner = project.owner.id === currentUser.id
        const hasApplied = applications.some((app: Application) => app.applicant.id === currentUser.id)

        setProjectData({ project, applications, isOwner, hasApplied })
      } catch (error) {
        console.error('Error fetching project:', error)
        setError(error instanceof Error ? error.message : 'Failed to load project')
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchData()
    }
  }, [projectId, router])

  const handleApply = async () => {
    if (!applicationMessage.trim()) return

    try {
      setSubmitting(true)
      const token = localStorage.getItem('devsync_token')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: applicationMessage.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit application')
      }

      // Refresh project data
      window.location.reload()
    } catch (error) {
      console.error('Error applying:', error)
      setError(error instanceof Error ? error.message : 'Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('devsync_token')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: action === 'approve' ? 'approved' : 'rejected'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update application')
      }

      // Refresh project data
      window.location.reload()
    } catch (error) {
      console.error('Error updating application:', error)
      setError('Failed to update application')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !projectData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'Something went wrong'}</p>
          <button 
            onClick={() => router.push('/projects')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </button>
        </div>
      </div>
    )
  }

  const { project, applications, isOwner, hasApplied } = projectData

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                <p className="text-gray-600">by {project.owner.name}</p>
              </div>
            </div>
            
            {!isOwner && project.isOpenForCollaboration && !hasApplied && (
              <button
                onClick={() => setShowApplyForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Apply to Join
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Description */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Project</h2>
              <p className="text-gray-700 leading-relaxed">{project.description}</p>
            </div>

            {/* Tech Stack */}
            {project.techStack.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Code className="h-5 w-5 mr-2" />
                  Tech Stack
                </h2>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Project Links */}
            {(project.githubUrl || project.liveUrl) && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Project Links
                </h2>
                <div className="space-y-3">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <GitHub className="h-4 w-4" />
                      <span>View on GitHub</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Live Demo</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Requirements */}
            {project.requirements && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements for Collaborators</h2>
                <p className="text-gray-700">{project.requirements}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Project Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Collaboration</span>
                  <span className="text-sm font-medium">
                    {project.isOpenForCollaboration ? 'Open' : 'Closed'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Max Collaborators</span>
                  <span className="text-sm font-medium">{project.maxCollaborators}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="text-sm font-medium">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Owner Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Owner</h3>
              <div className="flex items-center space-x-3">
                {project.owner.avatar ? (
                  <img 
                    src={project.owner.avatar} 
                    alt={project.owner.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <Users className="h-6 w-6 text-gray-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{project.owner.name}</p>
                  <p className="text-sm text-gray-600">@{project.owner.username}</p>
                </div>
              </div>
            </div>

            {/* Collaborators */}
            {project.collaborators && project.collaborators.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Collaborators</h3>
                <div className="space-y-3">
                  {project.collaborators.map((collaborator) => (
                    <div key={collaborator.id} className="flex items-center space-x-3">
                      {collaborator.avatar ? (
                        <img 
                          src={collaborator.avatar} 
                          alt={collaborator.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <Users className="h-4 w-4 text-gray-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{collaborator.name}</p>
                        <p className="text-xs text-gray-600">@{collaborator.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Applications Section (Owner Only) */}
        {isOwner && applications.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Applications ({applications.length})</h2>
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        {application.applicant.avatar ? (
                          <img 
                            src={application.applicant.avatar} 
                            alt={application.applicant.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{application.applicant.name}</p>
                          <p className="text-sm text-gray-600">@{application.applicant.username}</p>
                        </div>
                      </div>
                      
                      {application.message && (
                        <p className="text-gray-700 mb-3">{application.message}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(application.createdAt).toLocaleDateString()}</span>
                        </span>
                        <span className={`flex items-center space-x-1 ${
                          application.status === 'pending' ? 'text-yellow-600' :
                          application.status === 'approved' ? 'text-green-600' :
                          'text-red-600'
                        }`}>
                          {application.status === 'pending' ? <Clock className="h-4 w-4" /> :
                           application.status === 'approved' ? <CheckCircle className="h-4 w-4" /> :
                           <XCircle className="h-4 w-4" />}
                          <span className="capitalize">{application.status}</span>
                        </span>
                      </div>
                    </div>
                    
                    {application.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApplicationAction(application.id, 'approve')}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApplicationAction(application.id, 'reject')}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Application Form Modal */}
        {showApplyForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply to Join Project</h3>
              
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Why would you like to join this project?
                </label>
                <textarea
                  id="message"
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell the project owner about your interest and relevant skills..."
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowApplyForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={submitting || !applicationMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Application</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
