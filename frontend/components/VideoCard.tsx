'use client'

import { useState } from 'react'

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

interface VideoCardProps {
  result: SearchResult
  keyword: string
}

export default function VideoCard({ result, keyword }: VideoCardProps) {
  const [showAllMatches, setShowAllMatches] = useState(false)

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const displayedMatches = showAllMatches ? result.matches : result.matches.slice(0, 2)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <a href={result.url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="relative aspect-video overflow-hidden bg-gray-200 dark:bg-gray-700">
          <img
            src={result.thumbnailUrl}
            alt={result.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
            {result.matchCount} match{result.matchCount !== 1 ? 'es' : ''}
          </div>
        </div>
      </a>

      <div className="p-4">
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:text-youtube transition-colors"
        >
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2 mb-2">
            {result.title}
          </h3>
        </a>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
          {result.channel}
        </p>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
            Transcript Matches:
          </p>

          <div className="space-y-2">
            {displayedMatches.map((match, index) => (
              <a
                key={index}
                href={match.timestampUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-50 dark:bg-gray-700 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs font-mono text-youtube font-semibold">
                    {formatTime(match.start)}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
                <p
                  className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2"
                  dangerouslySetInnerHTML={{
                    __html: match.text.replace(
                      new RegExp(`(${keyword})`, 'gi'),
                      '<mark>$1</mark>'
                    ),
                  }}
                />
              </a>
            ))}
          </div>

          {result.matches.length > 2 && (
            <button
              onClick={() => setShowAllMatches(!showAllMatches)}
              className="mt-2 text-xs text-youtube hover:text-youtube-dark font-medium w-full text-center py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {showAllMatches
                ? 'Show Less'
                : `Show ${result.matches.length - 2} More Match${
                    result.matches.length - 2 !== 1 ? 'es' : ''
                  }`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
