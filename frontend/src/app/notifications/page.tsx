'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { User } from '@/types'
import { 
  Bell, 
  Check, 
  X, 
  UserPlus, 
  MessageCircle, 
  Star, 
  Code, 
  Award,
  TrendingUp,
  Calendar,
  Filter
} from 'lucide-react'

interface Notification {
  id: string
  type: 'connection' | 'message' | 'project' | 'endorsement' | 'trending' | 'system'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  actionUrl?: string
  actor?: {
    id: string
    name: string
    avatar: string
    username: string
  }
  metadata?: {
    projectTitle?: string
    skillName?: string
    connectionCount?: number
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'connections' | 'projects'>('all')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const initializeNotifications = async () => {
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

        // Fetch notifications from API
        const notificationsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json()
          setNotifications(notificationsData)
        } else {
          console.error('Failed to fetch notifications:', notificationsResponse.status)
          // For now, show empty state if API fails
          setNotifications([])
        }
        
      } catch (error) {
        console.error('Error initializing notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeNotifications()
  }, [router])

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead
      case 'connections':
        return notification.type === 'connection'
      case 'projects':
        return notification.type === 'project'
      default:
        return true
    }
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'connection':
        return <UserPlus className="h-5 w-5 text-blue-500" />
      case 'message':
        return <MessageCircle className="h-5 w-5 text-green-500" />
      case 'project':
        return <Code className="h-5 w-5 text-purple-500" />
      case 'endorsement':
        return <Award className="h-5 w-5 text-yellow-500" />
      case 'trending':
        return <TrendingUp className="h-5 w-5 text-red-500" />
      case 'system':
        return <Bell className="h-5 w-5 text-gray-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'connection':
        return 'bg-blue-50 border-blue-200'
      case 'message':
        return 'bg-green-50 border-green-200'
      case 'project':
        return 'bg-purple-50 border-purple-200'
      case 'endorsement':
        return 'bg-yellow-50 border-yellow-200'
      case 'trending':
        return 'bg-red-50 border-red-200'
      case 'system':
        return 'bg-gray-50 border-gray-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const markAsRead = async (notificationId: string) => {
    const token = localStorage.getItem('devsync_token')
    if (!token) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        )
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    const token = localStorage.getItem('devsync_token')
    if (!token) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        )
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    const token = localStorage.getItem('devsync_token')
    if (!token) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notification => notification.id !== notificationId)
        )
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffMinutes = Math.ceil(diffTime / (1000 * 60))
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <div className="flex space-x-2">
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'connections', label: 'Connections' },
                { id: 'projects', label: 'Projects' }
              ].map(filterOption => (
                <button
                  key={filterOption.id}
                  onClick={() => setFilter(filterOption.id as 'all' | 'unread' | 'connections' | 'projects')}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    filter === filterOption.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-all ${
                !notification.isRead ? 'border-l-4 border-l-blue-500' : ''
              } ${getNotificationColor(notification.type)}`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      
                      {notification.actor && (
                        <div className="flex items-center space-x-2 mb-2">
                          <img 
                            src={notification.actor.avatar} 
                            alt={notification.actor.name}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                          <span className="text-sm text-gray-500">
                            {notification.actor.name}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatTime(notification.timestamp)}</span>
                        </div>
                        {!notification.isRead && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete notification"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {notification.actionUrl && (
                    <div className="mt-3">
                      <a
                        href={notification.actionUrl}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                        <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? "You're all caught up! Check back later for new notifications."
                : `No ${filter} notifications found.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
