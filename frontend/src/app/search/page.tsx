'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from '@/components/Navigation'
import ProjectCard from '@/components/ProjectCard'
import { 
  Search, 
  Filter, 
  Users, 
  Code, 
  Star,
  MapPin,
  Building,
  Calendar,
  TrendingUp,
  Award
} from 'lucide-react'

interface SearchResult {
  type: 'developer' | 'project' | 'skill'
  id: string
  title: string
  description: string
  avatar?: string
  username?: string
  location?: string
  company?: string
  skills?: string[]
  techStack?: string[]
  followers?: number
  projects?: number
  endorsements?: number
  isOpenForCollaboration?: boolean
  createdAt?: string
  owner?: {
    id: string
    username: string
    name: string
    avatar: string
  }
  stats?: {
    views: number
    likes: number
    applications: number
  }
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [searchTerm, setSearchTerm] = useState(query)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'developers' | 'projects' | 'skills'>('all')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const initializeSearch = async () => {
      try {
        // Check authentication
        const token = localStorage.getItem('devsync_token')
        const userData = localStorage.getItem('devsync_user')
        
        if (!token || !userData) {
          router.push('/auth/login')
          return
        }

        const currentUser = JSON.parse(userData)
        setUser(currentUser)

        if (query) {
          performSearch(query)
        }
      } catch (error) {
        console.error('Error initializing search:', error)
      }
    }

    initializeSearch()
  }, [router, query])

  const performSearch = async (term: string) => {
    if (!term.trim()) return

    setLoading(true)
    try {
      // Mock search results - replace with actual API call
      const mockResults: SearchResult[] = [
        {
          type: 'developer',
          id: '1',
          title: 'Sarah Johnson',
          description: 'Senior Full Stack Developer with 5+ years of experience in React, Node.js, and cloud technologies.',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          username: 'sarah_dev',
          location: 'San Francisco, CA',
          company: 'TechCorp',
          skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
          followers: 1250,
          projects: 45,
          endorsements: 89
        },
        {
          type: 'project',
          id: '2',
          title: 'AI-Powered Code Review Assistant',
          description: 'An intelligent tool that automatically reviews code, suggests improvements, and identifies potential bugs using machine learning.',
          techStack: ['Python', 'TensorFlow', 'React', 'Node.js', 'Docker'],
          isOpenForCollaboration: true,
          createdAt: '2024-01-15T10:00:00Z',
          owner: {
            id: '1',
            username: 'ai_dev',
            name: 'Sarah Chen',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
          },
          stats: {
            views: 12500,
            likes: 890,
            applications: 45
          }
        },
        {
          type: 'developer',
          id: '3',
          title: 'Alex Chen',
          description: 'DevOps Engineer specializing in cloud infrastructure, automation, and scalable systems.',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          username: 'alex_coder',
          location: 'Seattle, WA',
          company: 'CloudTech',
          skills: ['Docker', 'Kubernetes', 'Python', 'Terraform', 'AWS'],
          followers: 890,
          projects: 32,
          endorsements: 67
        },
        {
          type: 'project',
          id: '4',
          title: 'Real-time Collaboration Platform',
          description: 'A modern platform for real-time code collaboration with video calls, screen sharing, and integrated development environment.',
          techStack: ['TypeScript', 'WebRTC', 'Socket.io', 'React', 'Express'],
          isOpenForCollaboration: true,
          createdAt: '2024-01-10T14:30:00Z',
          owner: {
            id: '2',
            username: 'collab_master',
            name: 'Alex Rodriguez',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          },
          stats: {
            views: 8900,
            likes: 567,
            applications: 32
          }
        },
        {
          type: 'skill',
          id: '5',
          title: 'React',
          description: 'A JavaScript library for building user interfaces, particularly web applications.',
          followers: 15420,
          projects: 2840
        }
      ]

      // Filter results based on search term
      const filteredResults = mockResults.filter(result =>
        result.title.toLowerCase().includes(term.toLowerCase()) ||
        result.description.toLowerCase().includes(term.toLowerCase()) ||
        result.skills?.some(skill => skill.toLowerCase().includes(term.toLowerCase())) ||
        result.techStack?.some(tech => tech.toLowerCase().includes(term.toLowerCase()))
      )

      setResults(filteredResults)
    } catch (error) {
      console.error('Error performing search:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
      performSearch(searchTerm.trim())
    }
  }

  const filteredResults = results.filter(result => {
    if (activeTab === 'all') return true
    return result.type === activeTab.slice(0, -1) // Remove 's' from plural
  })

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'developer':
        return <Users className="h-5 w-5 text-blue-500" />
      case 'project':
        return <Code className="h-5 w-5 text-green-500" />
      case 'skill':
        return <Star className="h-5 w-5 text-yellow-500" />
      default:
        return <Search className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Results</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search developers, projects, skills..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>
          </form>
        </div>

        {/* Results Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'all', label: 'All Results', count: results.length },
              { id: 'developers', label: 'Developers', count: results.filter(r => r.type === 'developer').length },
              { id: 'projects', label: 'Projects', count: results.filter(r => r.type === 'project').length },
              { id: 'skills', label: 'Skills', count: results.filter(r => r.type === 'skill').length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Results */}
        {!loading && (
          <div className="space-y-6">
            {filteredResults.map(result => (
              <div key={`${result.type}-${result.id}`} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                {result.type === 'developer' && (
                  <div className="flex items-start space-x-4">
                    <img 
                      src={result.avatar} 
                      alt={result.title}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {result.title}
                          </h3>
                          <p className="text-gray-600 mb-2">@{result.username}</p>
                          <p className="text-gray-700 mb-3">{result.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            {result.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{result.location}</span>
                              </div>
                            )}
                            {result.company && (
                              <div className="flex items-center space-x-1">
                                <Building className="h-4 w-4" />
                                <span>{result.company}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {result.skills?.slice(0, 5).map(skill => (
                              <span 
                                key={skill}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{result.followers} followers</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Code className="h-4 w-4" />
                              <span>{result.projects} projects</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Award className="h-4 w-4" />
                              <span>{result.endorsements} endorsements</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {getResultIcon(result.type)}
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Connect
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {result.type === 'project' && (
                  <ProjectCard 
                    project={{
                      id: result.id,
                      title: result.title,
                      description: result.description,
                      techStack: result.techStack || [],
                      isOpenForCollaboration: result.isOpenForCollaboration || false,
                      maxCollaborators: 5,
                      createdAt: result.createdAt || new Date().toISOString(),
                      owner: result.owner || {
                        id: '1',
                        username: 'unknown',
                        name: 'Unknown',
                        avatar: ''
                      },
                      stats: result.stats
                    }}
                    showActions={true}
                    onApply={(projectId) => console.log('Apply to project:', projectId)}
                    onLike={(projectId) => console.log('Like project:', projectId)}
                  />
                )}

                {result.type === 'skill' && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getResultIcon(result.type)}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {result.title}
                        </h3>
                        <p className="text-gray-600 mb-2">{result.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{result.followers} developers</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Code className="h-4 w-4" />
                            <span>{result.projects} projects</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">+15% trending</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredResults.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or browse our trending content
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
