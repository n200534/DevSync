'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
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
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

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

        // Mock trending data - replace with actual API calls
        const mockTrendingProjects: TrendingProject[] = [
          {
            id: '1',
            title: 'AI-Powered Code Review Assistant',
            description: 'An intelligent tool that automatically reviews code, suggests improvements, and identifies potential bugs using machine learning.',
            techStack: ['Python', 'TensorFlow', 'React', 'Node.js', 'Docker'],
            githubUrl: 'https://github.com/example/ai-code-review',
            liveUrl: 'https://ai-code-review.demo.com',
            isOpenForCollaboration: true,
            maxCollaborators: 8,
            createdAt: '2024-01-15T10:00:00Z',
            owner: {
              id: '1',
              username: 'ai_dev',
              name: 'Sarah Chen',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
              title: 'AI Research Engineer',
              company: 'TechCorp'
            },
            stats: {
              views: 12500,
              likes: 890,
              applications: 45,
              trendingScore: 95
            },
            trendingReason: 'hot'
          },
          {
            id: '2',
            title: 'Real-time Collaboration Platform',
            description: 'A modern platform for real-time code collaboration with video calls, screen sharing, and integrated development environment.',
            techStack: ['TypeScript', 'WebRTC', 'Socket.io', 'React', 'Express'],
            githubUrl: 'https://github.com/example/collab-platform',
            isOpenForCollaboration: true,
            maxCollaborators: 12,
            createdAt: '2024-01-10T14:30:00Z',
            owner: {
              id: '2',
              username: 'collab_master',
              name: 'Alex Rodriguez',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
              title: 'Full Stack Developer',
              company: 'StartupXYZ'
            },
            stats: {
              views: 8900,
              likes: 567,
              applications: 32,
              trendingScore: 88
            },
            trendingReason: 'popular'
          },
          {
            id: '3',
            title: 'Blockchain Voting System',
            description: 'A secure, transparent voting system built on blockchain technology with smart contracts and cryptographic verification.',
            techStack: ['Solidity', 'Web3.js', 'React', 'Node.js', 'Ethereum'],
            githubUrl: 'https://github.com/example/blockchain-voting',
            isOpenForCollaboration: true,
            maxCollaborators: 6,
            createdAt: '2024-01-20T09:15:00Z',
            owner: {
              id: '3',
              username: 'blockchain_dev',
              name: 'Maya Patel',
              avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
              title: 'Blockchain Developer',
              company: 'CryptoCorp'
            },
            stats: {
              views: 15600,
              likes: 1200,
              applications: 78,
              trendingScore: 92
            },
            trendingReason: 'featured'
          }
        ]

        const mockTrendingDevelopers: TrendingDeveloper[] = [
          {
            id: '1',
            username: 'ai_researcher',
            name: 'Dr. Emily Watson',
            title: 'Senior AI Research Scientist',
            company: 'DeepMind',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            skills: ['Machine Learning', 'Python', 'TensorFlow', 'Research'],
            trendingScore: 98,
            recentActivity: 'Published groundbreaking research on transformer architectures'
          },
          {
            id: '2',
            username: 'web3_builder',
            name: 'James Kim',
            title: 'Blockchain Architect',
            company: 'Ethereum Foundation',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            skills: ['Solidity', 'Web3', 'DeFi', 'Smart Contracts'],
            trendingScore: 95,
            recentActivity: 'Launched innovative DeFi protocol with $10M TVL'
          },
          {
            id: '3',
            username: 'devops_guru',
            name: 'Lisa Zhang',
            title: 'Principal DevOps Engineer',
            company: 'Google Cloud',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
            skills: ['Kubernetes', 'Docker', 'AWS', 'CI/CD'],
            trendingScore: 92,
            recentActivity: 'Open-sourced scalable infrastructure toolkit'
          }
        ]

        setTrendingProjects(mockTrendingProjects)
        setTrendingDevelopers(mockTrendingDevelopers)
        
      } catch (error) {
        console.error('Error initializing trending:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeTrending()
  }, [router])

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
                onClick={() => setActiveTab(tab.id as any)}
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
            {[
              { name: 'React', growth: '+25%', color: 'bg-blue-100 text-blue-800' },
              { name: 'TypeScript', growth: '+18%', color: 'bg-blue-100 text-blue-800' },
              { name: 'Python', growth: '+15%', color: 'bg-green-100 text-green-800' },
              { name: 'Docker', growth: '+12%', color: 'bg-blue-100 text-blue-800' },
              { name: 'Kubernetes', growth: '+20%', color: 'bg-purple-100 text-purple-800' },
              { name: 'AWS', growth: '+8%', color: 'bg-orange-100 text-orange-800' },
              { name: 'Machine Learning', growth: '+30%', color: 'bg-pink-100 text-pink-800' },
              { name: 'Blockchain', growth: '+22%', color: 'bg-yellow-100 text-yellow-800' },
              { name: 'GraphQL', growth: '+14%', color: 'bg-purple-100 text-purple-800' },
              { name: 'Rust', growth: '+16%', color: 'bg-red-100 text-red-800' },
              { name: 'Go', growth: '+10%', color: 'bg-cyan-100 text-cyan-800' },
              { name: 'Vue.js', growth: '+7%', color: 'bg-green-100 text-green-800' }
            ].map(skill => (
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
