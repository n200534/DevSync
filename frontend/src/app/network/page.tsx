'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { User } from '@/types'
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MapPin, 
  Building, 
  Code, 
  Star,
  MessageCircle,
  ExternalLink,
  TrendingUp
} from 'lucide-react'

interface Developer {
  id: string
  username: string
  name: string
  title: string
  company: string
  location: string
  avatar: string
  skills: string[]
  bio: string
  githubUrl: string
  linkedinUrl: string
  followers: number
  following: number
  projects: number
  endorsements: number
  isConnected: boolean
  mutualConnections: number
}

export default function NetworkPage() {
  const router = useRouter()
  const [developers, setDevelopers] = useState<Developer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [availableSkills, setAvailableSkills] = useState<string[]>([])
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const initializeNetwork = async () => {
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

        // Fetch all users from API
        const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          // Transform API data to match our Developer interface
          const transformedDevelopers: Developer[] = usersData.map((user: any) => ({
            id: user.id,
            username: user.username,
            name: user.name,
            title: user.title || 'Developer',
            company: user.company || '',
            location: user.location || 'Not specified',
            avatar: user.avatar || '',
            skills: user.skills || [],
            bio: user.bio || '',
            githubUrl: user.githubUrl || '',
            linkedinUrl: user.linkedinUrl || '',
            followers: 0, // Not implemented yet
            following: 0, // Not implemented yet
            projects: 0, // Will be calculated from user's projects
            endorsements: 0, // Will be calculated from endorsements
            isConnected: false, // Not implemented yet
            mutualConnections: 0 // Not implemented yet
          }))
          setDevelopers(transformedDevelopers)
          
          // Extract unique skills for filter
          const skillSet = new Set<string>()
          transformedDevelopers.forEach(dev => {
            dev.skills.forEach(skill => skillSet.add(skill))
          })
          setAvailableSkills(Array.from(skillSet).sort())
        } else {
          console.error('Failed to fetch users:', usersResponse.status)
        }
        
      } catch (error) {
        console.error('Error initializing network:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeNetwork()
  }, [router])

  const filteredDevelopers = developers.filter(dev => {
    const matchesSearch = dev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dev.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dev.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dev.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesSkills = selectedSkills.length === 0 || 
                         selectedSkills.some(skill => dev.skills.includes(skill))
    
    return matchesSearch && matchesSkills
  })

  const toggleSkillFilter = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const handleConnect = async (developerId: string) => {
    // TODO: Implement connection logic
    console.log('Connecting to developer:', developerId)
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Developer Network</h1>
          <p className="text-gray-600">Connect with talented developers and build your professional network</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Developers
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, title, company, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Skills Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Skills
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSkills.map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSkillFilter(skill)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedSkills.includes(skill)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Developers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevelopers.map(developer => (
            <div key={developer.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img 
                    src={developer.avatar} 
                    alt={developer.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{developer.name}</h3>
                    <p className="text-sm text-gray-600">{developer.title}</p>
                    <p className="text-xs text-gray-500">{developer.company}</p>
                  </div>
                </div>
                
                {developer.isConnected ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Connected
                  </span>
                ) : (
                  <button
                    onClick={() => handleConnect(developer.id)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>

              {/* Bio */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{developer.bio}</p>

              {/* Location */}
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                {developer.location}
              </div>

              {/* Skills */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {developer.skills.slice(0, 4).map(skill => (
                    <span 
                      key={skill}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                  {developer.skills.length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                      +{developer.skills.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{developer.followers}</p>
                  <p className="text-gray-500">Followers</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{developer.projects}</p>
                  <p className="text-gray-500">Projects</p>
                </div>
              </div>

              {/* Mutual Connections */}
              {developer.mutualConnections > 0 && (
                <div className="text-sm text-gray-500 mb-4">
                  <Users className="h-4 w-4 inline mr-1" />
                  {developer.mutualConnections} mutual connections
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </button>
                <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDevelopers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No developers found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
