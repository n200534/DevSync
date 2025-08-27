'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import CreatePostModal from '@/components/CreatePostModal'
import { User } from '@/types'
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark, 
  MoreHorizontal,
  Code,
  Trophy,
  Star,
  Users,
  GitBranch,
  Award,
  TrendingUp,
  Plus,
  Filter,
  Search
} from 'lucide-react'

interface Post {
  id: string
  type: 'achievement' | 'project' | 'milestone' | 'learning' | 'collaboration'
  author: {
    id: string
    username: string
    name: string
    avatar: string
    title: string
    company: string
  }
  content: string
  image?: string
  project?: {
    id: string
    title: string
    description: string
    techStack: string[]
    githubUrl?: string
    liveUrl?: string
  }
  achievement?: {
    title: string
    description: string
    icon: string
    badge?: string
  }
  stats: {
    likes: number
    comments: number
    shares: number
    bookmarks: number
  }
  isLiked: boolean
  isBookmarked: boolean
  createdAt: string
  tags: string[]
}

interface TrendingTopic {
  id: string
  title: string
  posts: number
  trend: 'up' | 'down' | 'stable'
  category: 'technology' | 'framework' | 'language' | 'tool'
}

export default function FeedPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'achievements' | 'projects' | 'learning'>('all')
  const [showCreatePost, setShowCreatePost] = useState(false)

  useEffect(() => {
    const initializeFeed = async () => {
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

        // Fetch posts from API
        const postsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (postsResponse.ok) {
          const postsData = await postsResponse.json()
          // Transform API data to match our Post interface
          const transformedPosts: Post[] = postsData.map((post: any) => ({
            id: post.id,
            type: post.type,
            author: {
              id: post.author.id,
              username: post.author.username,
              name: post.author.name,
              avatar: post.author.avatar || '',
              title: post.author.title || 'Developer',
              company: post.author.company || ''
            },
            content: post.content,
            project: post.project,
            achievement: post.achievement,
            stats: {
              likes: post.likes?.length || 0,
              comments: 0, // Comments not implemented yet
              shares: 0, // Shares not implemented yet
              bookmarks: post.bookmarks?.length || 0
            },
            isLiked: post.likes?.includes(currentUser.id) || false,
            isBookmarked: post.bookmarks?.includes(currentUser.id) || false,
            createdAt: post.createdAt,
            tags: post.tags || []
          }))
          setPosts(transformedPosts)
        } else {
          console.error('Failed to fetch posts:', postsResponse.status)
        }

        // For now, keep trending topics as mock data since we don't have a trending API yet
        const mockTrendingTopics: TrendingTopic[] = [
          { id: '1', title: 'React Server Components', posts: 156, trend: 'up', category: 'framework' },
          { id: '2', title: 'WebRTC', posts: 89, trend: 'up', category: 'technology' },
          { id: '3', title: 'TypeScript', posts: 234, trend: 'stable', category: 'language' },
          { id: '4', title: 'Kubernetes', posts: 67, trend: 'down', category: 'tool' },
          { id: '5', title: 'DeFi', posts: 123, trend: 'up', category: 'technology' }
        ]
        setTrendingTopics(mockTrendingTopics)
        
      } catch (error) {
        console.error('Error initializing feed:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeFeed()
  }, [router])

  const filteredPosts = posts.filter(post => {
    if (activeFilter === 'all') return true
    return post.type === activeFilter
  })

  const handleLike = async (postId: string) => {
    const token = localStorage.getItem('devsync_token')
    if (!token) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isLiked: data.isLiked,
                stats: {
                  ...post.stats,
                  likes: data.likesCount
                }
              }
            : post
        ))
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleBookmark = async (postId: string) => {
    const token = localStorage.getItem('devsync_token')
    if (!token) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isBookmarked: data.isBookmarked,
                stats: {
                  ...post.stats,
                  bookmarks: data.bookmarksCount
                }
              }
            : post
        ))
      }
    } catch (error) {
      console.error('Error bookmarking post:', error)
    }
  }

  const handleCreatePost = async (postData: {
    type: 'achievement' | 'project' | 'milestone' | 'learning' | 'collaboration';
    content: string;
    tags: string[];
    project?: {
      title: string;
      description: string;
      techStack: string[];
      githubUrl?: string;
      liveUrl?: string;
    };
    achievement?: {
      title: string;
      description: string;
      icon: string;
      badge?: string;
    };
  }) => {
    if (!user) return;
    
    const token = localStorage.getItem('devsync_token')
    if (!token) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: postData.type,
          content: postData.content,
          tags: postData.tags,
          project: postData.project,
          achievement: postData.achievement
        })
      })

      if (response.ok) {
        const newPostData = await response.json()
        const newPost: Post = {
          id: newPostData.id,
          type: newPostData.type,
          author: {
            id: newPostData.author.id,
            username: newPostData.author.username,
            name: newPostData.author.name,
            avatar: newPostData.author.avatar || '',
            title: newPostData.author.title || 'Developer',
            company: newPostData.author.company || ''
          },
          content: newPostData.content,
          project: newPostData.project,
          achievement: newPostData.achievement,
          stats: {
            likes: 0,
            comments: 0,
            shares: 0,
            bookmarks: 0
          },
          isLiked: false,
          isBookmarked: false,
          createdAt: newPostData.createdAt,
          tags: newPostData.tags || []
        }
        
        setPosts(prev => [newPost, ...prev])
      } else {
        console.error('Failed to create post:', response.status)
      }
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="h-5 w-5 text-yellow-500" />
      case 'project': return <Code className="h-5 w-5 text-blue-500" />
      case 'milestone': return <Star className="h-5 w-5 text-purple-500" />
      case 'learning': return <Bookmark className="h-5 w-5 text-green-500" />
      case 'collaboration': return <Users className="h-5 w-5 text-orange-500" />
      default: return <Code className="h-5 w-5 text-gray-500" />
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
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
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-3">
            {/* Feed Header */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Developer Feed</h1>
                <button 
                  onClick={() => setShowCreatePost(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Post
                </button>
              </div>
              
              {/* Filter Tabs */}
              <div className="flex space-x-4">
                {[
                  { id: 'all', label: 'All Posts', icon: Code },
                  { id: 'achievements', label: 'Achievements', icon: Trophy },
                  { id: 'projects', label: 'Projects', icon: GitBranch },
                  { id: 'learning', label: 'Learning', icon: Bookmark }
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id as 'all' | 'achievements' | 'projects' | 'learning')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      activeFilter === filter.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <filter.icon className="h-4 w-4" />
                    <span>{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {filteredPosts.map(post => (
                <div key={post.id} className="bg-white rounded-lg shadow-sm border p-6">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={post.author.avatar} 
                        alt={post.author.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                        <p className="text-sm text-gray-600">{post.author.title} at {post.author.company}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          {getPostIcon(post.type)}
                          <span>{formatTime(post.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <p className="text-gray-800 leading-relaxed">{post.content}</p>
                    
                    {/* Achievement Badge */}
                    {post.achievement && (
                      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{post.achievement.icon}</span>
                          <div>
                            <h4 className="font-semibold text-yellow-800">{post.achievement.title}</h4>
                            <p className="text-sm text-yellow-700">{post.achievement.description}</p>
                            {post.achievement.badge && (
                              <span className="inline-block mt-1 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                                {post.achievement.badge} Badge
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Project Card */}
                    {post.project && (
                      <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">{post.project.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{post.project.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.project.techStack.map(tech => (
                            <span 
                              key={tech}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        <div className="flex space-x-3">
                          {post.project.githubUrl && (
                            <a 
                              href={post.project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View on GitHub
                            </a>
                          )}
                          {post.project.liveUrl && (
                            <a 
                              href={post.project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Live Demo
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.tags.map(tag => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center space-x-2 transition-colors ${
                          post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span>{post.stats.likes}</span>
                      </button>
                      
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                        <MessageCircle className="h-5 w-5" />
                        <span>{post.stats.comments}</span>
                      </button>
                      
                      <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
                        <Share className="h-5 w-5" />
                        <span>{post.stats.shares}</span>
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleBookmark(post.id)}
                      className={`transition-colors ${
                        post.isBookmarked ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
                      }`}
                    >
                      <Bookmark className={`h-5 w-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trending Topics */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Trending Topics
              </h3>
              <div className="space-y-3">
                {trendingTopics.map(topic => (
                  <div key={topic.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{topic.title}</p>
                      <p className="text-sm text-gray-500">{topic.posts} posts</p>
                    </div>
                    <div className={`flex items-center space-x-1 ${
                      topic.trend === 'up' ? 'text-green-500' :
                      topic.trend === 'down' ? 'text-red-500' :
                      'text-gray-500'
                    }`}>
                      <TrendingUp className={`h-4 w-4 ${
                        topic.trend === 'down' ? 'rotate-180' : ''
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <Code className="h-5 w-5 text-blue-500" />
                  <span>Share a Project</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span>Share Achievement</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <Bookmark className="h-5 w-5 text-green-500" />
                  <span>Share Learning</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <Users className="h-5 w-5 text-orange-500" />
                  <span>Find Collaborators</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  )
}
