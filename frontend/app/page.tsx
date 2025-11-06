'use client'

import { useState } from 'react'
import SearchBar from '@/components/SearchBar'
import VideoGrid from '@/components/VideoGrid'
import LoadingSpinner from '@/components/LoadingSpinner'
import axios from 'axios'

interface TranscriptMatch {
  text: string
  start: number
  duration: number
  timestampUrl: string
}

interface SearchResult {
  videoId: string
  title: string
  channel: string
  thumbnailUrl: string
  matches: TranscriptMatch[]
  matchCount: number
  snippet: string
  url: string
}

interface ApiResponse {
  success: boolean
  cached: boolean
  keyword: string
  results: SearchResult[]
  count: number
  error?: string
}

export default function Home() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [cached, setCached] = useState(false)

  const handleSearch = async (searchKeyword: string) => {
    if (!searchKeyword.trim()) {
      setError('Please enter a keyword')
      return
    }

    setLoading(true)
    setError(null)
    setSearched(true)
    setKeyword(searchKeyword)
    setResults([])

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await axios.get<ApiResponse>(
        `${apiUrl}/api/search`,
        {
          params: {
            q: searchKeyword,
            limit: 10
          },
          timeout: 60000
        }
      )

      if (response.data.success) {
        setResults(response.data.results)
        setCached(response.data.cached)
      } else {
        setError(response.data.error || 'Search failed')
      }
    } catch (err: any) {
      console.error('Search error:', err)
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please try again.')
      } else if (err.message.includes('Network Error')) {
        setError('Cannot connect to API. Make sure the backend is running.')
      } else {
        setError(err.message || 'An error occurred during search')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-youtube mr-3"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
              YouTube Keyword Finder
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Search YouTube videos by transcript keywords. Find exactly where specific words or phrases are mentioned in videos.
          </p>
        </div>

        <SearchBar onSearch={handleSearch} loading={loading} />

        {error && (
          <div className="max-w-4xl mx-auto mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-500 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center mt-12">
            <LoadingSpinner />
          </div>
        )}

        {!loading && searched && results.length === 0 && !error && (
          <div className="max-w-4xl mx-auto mt-12 text-center">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8">
              <svg
                className="w-16 h-16 text-yellow-500 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Results Found
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                No videos found with the keyword "{keyword}". Try a different search term.
              </p>
            </div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="mt-8">
            <div className="max-w-7xl mx-auto mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Found {results.length} video{results.length !== 1 ? 's' : ''} with "{keyword}"
                </h2>
                {cached && (
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-medium px-3 py-1 rounded-full">
                    Cached Result
                  </span>
                )}
              </div>
            </div>
            <VideoGrid results={results} keyword={keyword} />
          </div>
        )}

        <footer className="mt-20 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>
            Built with Next.js, Express, MongoDB, Redis & Meilisearch
          </p>
          <p className="mt-2">
            Powered by YouTube Data API v3
          </p>
        </footer>
      </div>
    </main>
  )
}
