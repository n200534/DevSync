'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { User } from '@/types'
import ProjectCard from '@/components/ProjectCard'
import { 
  TrendingUp, 
  Flame as Fire, 
  Star, 
  Users, 
  Code, 
  Calendar,
  Filter,
  Search,
  Award,
  Zap
} from 'lucide-react'

interface TrendingProject {
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
  stats: {
    views: number
    likes: number
    applications: number
    trendingScore: number
  }
  trendingReason: 'popular' | 'new' | 'hot' | 'featured'
}

interface TrendingDeveloper {
  id: string
  username: string
  name: string
  title: string
  company: string
  avatar: string
  skills: string[]
  trendingScore: number
  recentActivity: string
}

export default function TrendingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'projects' | 'developers' | 'skills'>('projects')
  const [trendingProjects, setTrendingProjects] = useState<TrendingProject[]>([])
  const [trendingDevelopers, setTrendingDevelopers] = useState<TrendingDeveloper[]>([])
  const [trendingSkills, setTrendingSkills] = useState<Array<{name: string, growth: string, color: string}>>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const initializeTrending = async () => {
      try {
        setLoading(true)
        
        // Check authentication
        const token = localStorage.getItem('devsync_token')
        const userData = localStorage.getItem('devsync_user')
        
        if (!token || !userData) {
          router.push('/auth/login')
          return
        }

        const currentUser = JSON.parse(userData)
        setUser(currentUser)

        // Fetch trending data from API
        const [projectsResponse, developersResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/trending/projects`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/trending/developers`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        ])

        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json()
          setTrendingProjects(projectsData)
        } else {
          console.error('Failed to fetch trending projects:', projectsResponse.status)
        }

        if (developersResponse.ok) {
          const developersData = await developersResponse.json()
          setTrendingDevelopers(developersData)
        } else {
          console.error('Failed to fetch trending developers:', developersResponse.status)
        }
        
      } catch (error) {
        console.error('Error initializing trending:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeTrending()
  }, [router])

  const loadTrendingSkills = async () => {
    const token = localStorage.getItem('devsync_token')
    if (!token) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trending/skills`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const skillsData = await response.json()
        setTrendingSkills(skillsData)
      } else {
        console.error('Failed to fetch trending skills:', response.status)
      }
    } catch (error) {
      console.error('Error loading trending skills:', error)
    }
  }

  const getTrendingIcon = (reason: string) => {
    switch (reason) {
      case 'hot': return <Fire className="h-4 w-4 text-red-500" />
      case 'popular': return <TrendingUp className="h-4 w-4 text-blue-500" />
      case 'featured': return <Award className="h-4 w-4 text-yellow-500" />
      case 'new': return <Zap className="h-4 w-4 text-green-500" />
      default: return <Star className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendingLabel = (reason: string) => {
    switch (reason) {
      case 'hot': return 'Hot'
      case 'popular': return 'Popular'
      case 'featured': return 'Featured'
      case 'new': return 'New'
      default: return 'Trending'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Trending</h1>
          </div>
          <p className="text-gray-600">Discover what&apos;s popular in the developer community</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'projects', label: 'Projects', icon: Code },
              { id: 'developers', label: 'Developers', icon: Users },
              { id: 'skills', label: 'Skills', icon: Star }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as 'projects' | 'developers' | 'skills')
                  if (tab.id === 'skills' && trendingSkills.length === 0) {
                    loadTrendingSkills()
                  }
                }}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {/* Trending Projects */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {trendingProjects.map(project => (
                <div key={project.id} className="relative">
                  {/* Trending Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <div className="flex items-center space-x-1 px-2 py-1 bg-white rounded-full shadow-sm border">
                      {getTrendingIcon(project.trendingReason)}
                      <span className="text-xs font-medium text-gray-700">
                        {getTrendingLabel(project.trendingReason)}
                      </span>
                    </div>
                  </div>
                  
                  <ProjectCard 
                    project={project} 
                    showActions={true}
                    onApply={(projectId) => console.log('Apply to project:', projectId)}
                    onLike={(projectId) => console.log('Like project:', projectId)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'developers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingDevelopers.map(developer => (
              <div key={developer.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={developer.avatar} 
                    alt={developer.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{developer.name}</h3>
                    <p className="text-sm text-gray-600">{developer.title}</p>
                    <p className="text-xs text-gray-500">{developer.company}</p>
                  </div>
                  <div className="flex items-center space-x-1 text-yellow-500">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm font-medium">{developer.trendingScore}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{developer.recentActivity}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {developer.skills.slice(0, 4).map(skill => (
                    <span 
                      key={skill}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Connect
                  </button>
                  <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trendingSkills.map(skill => (
              <div key={skill.name} className="bg-white rounded-lg shadow-sm border p-4 text-center hover:shadow-md transition-shadow">
                <h3 className="font-medium text-gray-900 mb-2">{skill.name}</h3>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${skill.color}`}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {skill.growth}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
