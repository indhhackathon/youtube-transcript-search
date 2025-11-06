'use client'

import VideoCard from './VideoCard'

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

interface VideoGridProps {
  results: SearchResult[]
  keyword: string
}

export default function VideoGrid({ results, keyword }: VideoGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {results.map((result) => (
        <VideoCard key={result.videoId} result={result} keyword={keyword} />
      ))}
    </div>
  )
}
