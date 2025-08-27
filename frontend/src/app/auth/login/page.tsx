'use client'

import { useState } from 'react'
import { Github, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleGitHubLogin = () => {
    setIsLoading(true)
    // Redirect to backend GitHub OAuth endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/github`
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/" className="flex items-center text-blue-600 hover:text-blue-500">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
        
        <div className="text-center mt-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome to DevSync
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to build your portfolio and collaborate with developers
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <button
                onClick={handleGitHubLogin}
                disabled={isLoading}
                className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
                ) : (
                  <>
                    <Github className="h-5 w-5 mr-2" />
                    Continue with GitHub
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to DevSync?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                No account needed! Just sign in with GitHub to get started.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features preview */}
      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-6 px-4 shadow sm:rounded-lg sm:px-10">
          <h3 className="text-lg font-medium text-gray-900 mb-4">What you&apos;ll get:</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              Beautiful portfolio pages
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              Project collaboration tools
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              Skill endorsements
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              Real-time team chat
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
