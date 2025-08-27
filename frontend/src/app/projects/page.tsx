'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  Code, 
  Users, 
  Calendar, 
  ExternalLink,
  Github,
  Plus,
  User as UserIcon
} from 'lucide-react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import ProjectCard from '@/components/ProjectCard'
import { User } from '@/types'

interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  repoUrl: string
  liveUrl: string
  isOpen: boolean
  createdAt: string
  owner: {
    id: string
    username: string
    name: string
    avatar: string
  }
  collaborations: Array<{
    user: {
      id: string
      username: string
      name: string
      avatar: string
    }
    role: string
  }>
  applications: Array<{
    id: string
    status: string
    user: {
      id: string
      username: string
      name: string
      avatar: string
    }
  }>
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTech, setSelectedTech] = useState<string[]>([])
  const [availableTech, setAvailableTech] = useState<string[]>([])
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const initializeProjects = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Check if user is authenticated
        const token = localStorage.getItem('devsync_token')
        const userData = localStorage.getItem('devsync_user')
        if (!token || !userData) {
          router.push('/auth/login')
          return
        }

        try {
          const currentUser = JSON.parse(userData)
          setUser(currentUser)
        } catch (error) {
          console.error('Error parsing user data:', error)
          router.push('/auth/login')
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setProjects(data)
          
          // Extract unique technologies for filter
          const techSet = new Set<string>()
          data.forEach((project: Project) => {
            project.techStack.forEach(tech => techSet.add(tech))
          })
          setAvailableTech(Array.from(techSet).sort())
        } else {
          console.error('Failed to fetch projects:', response.status)
          setError('Failed to load projects')
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
        setError('Failed to load projects')
      } finally {
        setLoading(false)
      }
    }

    initializeProjects()
  }, [router])

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTech = selectedTech.length === 0 || 
                       selectedTech.some(tech => project.techStack.includes(tech))
    
    return matchesSearch && matchesTech
  })

  const toggleTechFilter = (tech: string) => {
    setSelectedTech(prev => 
      prev.includes(tech) 
        ? prev.filter(t => t !== tech)
        : [...prev, tech]
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Projects</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Navigation */}
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Discover Amazing Projects
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find open source projects to contribute to, or collaborate with developers on exciting ideas
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Projects
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Technology Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Technology
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTech.map(tech => (
                  <button
                    key={tech}
                    onClick={() => toggleTechFilter(tech)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTech.includes(tech)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    <Link 
                      href={`/projects/${project.id}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {project.title}
                    </Link>
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    project.isOpen 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {project.collaborations.length} collaborators
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  {project.owner.avatar ? (
                    <img 
                      src={project.owner.avatar} 
                      alt={project.owner.name}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                  )}
                  <span className="text-sm text-gray-600">
                    by <span className="font-medium">@{project.owner.username}</span>
                  </span>
                </div>

                <div className="flex space-x-2">
                  {project.repoUrl && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Github className="h-4 w-4 mr-1" />
                      Repository
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Live Demo
                    </a>
                  )}
                </div>

                {project.isOpen && (
                  <Link
                    href={`/projects/${project.id}`}
                    className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center"
                  >
                    View Details & Apply
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Code className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedTech([])
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
