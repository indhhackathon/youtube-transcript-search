'use client'

import { useState, FormEvent } from 'react'

interface SearchBarProps {
  onSearch: (keyword: string) => void
  loading: boolean
}

export default function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [keyword, setKeyword] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (keyword.trim()) {
      onSearch(keyword.trim())
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter a keyword or phrase (e.g., 'AI ethics', 'neural networks')"
            className="w-full px-6 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:border-youtube dark:focus:border-youtube bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !keyword.trim()}
            className="absolute right-2 px-8 py-3 bg-youtube hover:bg-youtube-dark text-white font-semibold rounded-full transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Searching...
              </span>
            ) : (
              <span className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Search
              </span>
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {['AI ethics', 'machine learning', 'climate change', 'quantum computing'].map(
          (example) => (
            <button
              key={example}
              onClick={() => {
                setKeyword(example)
                onSearch(example)
              }}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {example}
            </button>
          )
        )}
      </div>
    </div>
  )
}
