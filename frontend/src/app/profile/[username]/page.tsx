'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { User, Project, Endorsement } from '@/types'
import { 
  User as UserIcon, 
  MapPin, 
  Calendar, 
  Globe, 
  Star, 
  Users, 
  Code, 
  Award,
  ExternalLink,
  Mail
} from 'lucide-react'

interface ProfileData {
  user: User
  projects: Project[]
  endorsements: Endorsement[]
}

export default function PublicProfilePage() {
  const params = useParams()
  const username = params.username as string
  
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [userResponse, projectsResponse, endorsementsResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/${username}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${username}/projects`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${username}/endorsements`)
        ])

        if (!userResponse.ok) {
          throw new Error('User not found')
        }

        const user = await userResponse.json()
        const projects = projectsResponse.ok ? await projectsResponse.json() : []
        const endorsements = endorsementsResponse.ok ? await endorsementsResponse.json() : []

        setProfileData({ user, projects, endorsements })
      } catch (error) {
        console.error('Error fetching profile:', error)
        setError(error instanceof Error ? error.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchProfileData()
    }
  }, [username])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  if (!profileData) return null

  const { user, projects, endorsements } = profileData

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <UserIcon className="h-12 w-12 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
              <p className="text-xl text-gray-600 mb-3">@{user.username}</p>
              
              {user.bio && (
                <p className="text-gray-700 text-lg mb-4 max-w-2xl">{user.bio}</p>
              )}

              {/* Contact & Links */}
              <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-600">
                {user.githubUrl && (
                  <a 
                    href={user.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    <span>GitHub</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Skills & Endorsements */}
          <div className="lg:col-span-1 space-y-6">
            {/* Skills */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Skills
              </h2>
              {user.skills && user.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No skills listed yet</p>
              )}
            </div>

            {/* Endorsements */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Endorsements
              </h2>
              {endorsements.length > 0 ? (
                <div className="space-y-3">
                  {endorsements.slice(0, 5).map((endorsement) => (
                    <div key={endorsement.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {endorsement.endorser.avatar ? (
                          <img 
                            src={endorsement.endorser.avatar} 
                            alt={endorsement.endorser.name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {endorsement.endorser.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          endorsed {endorsement.skill}
                        </p>
                      </div>
                    </div>
                  ))}
                  {endorsements.length > 5 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{endorsements.length - 5} more endorsements
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No endorsements yet</p>
              )}
            </div>
          </div>

          {/* Right Column - Projects */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Projects ({projects.length})
              </h2>
              
              {projects.length > 0 ? (
                <div className="space-y-6">
                  {projects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {project.title}
                          </h3>
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {project.description}
                          </p>
                          
                          {/* Tech Stack */}
                          {project.techStack.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {project.techStack.map((tech, index) => (
                                <span 
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Project Meta */}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{project.collaborators?.length || 0} collaborators</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 ml-4">
                          <a 
                            href={`/projects/${project.id}`}
                            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            View Project
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No projects yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
