export interface User {
  id: string
  username: string
  name: string
  email: string
  bio?: string
  avatar?: string
  title?: string
  company?: string
  location?: string
  githubUrl?: string
  linkedinUrl?: string
  skills: string[]
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  githubUrl?: string
  liveUrl?: string
  isOpenForCollaboration: boolean
  maxCollaborators: number
  requirements?: string
  createdAt: string
  updatedAt: string
  owner: User
  collaborators?: User[]
  applications?: Application[]
}

export interface Application {
  id: string
  projectId: string
  applicantId: string
  message: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
  applicant: User
}

export interface Endorsement {
  id: string
  endorserId: string
  endorseeId: string
  skill: string
  message?: string
  createdAt: string
  endorser: User
  endorsee: User
}

export interface Connection {
  id: string
  requesterId: string
  receiverId: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
  updatedAt: string
  requester: User
  receiver: User
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  type: 'text' | 'image' | 'file'
  isRead: boolean
  createdAt: string
  sender: User
  receiver: User
}

export interface Notification {
  id: string
  userId: string
  type: 'connection' | 'message' | 'project' | 'endorsement' | 'trending' | 'system'
  title: string
  message: string
  isRead: boolean
  actionUrl?: string
  createdAt: string
  actor?: User
  metadata?: Record<string, unknown>
}
