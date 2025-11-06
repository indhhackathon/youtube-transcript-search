'use client'

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-youtube border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
        Searching transcripts...
      </p>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
        This may take a few moments
      </p>
    </div>
  )
}
