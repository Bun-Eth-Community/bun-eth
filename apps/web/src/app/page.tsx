'use client';

import dynamic from 'next/dynamic';

// Dynamically import the client component with no SSR
const HomeClient = dynamic(() => import('@/components/home-client'), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </main>
  ),
});

export default function Home() {
  return <HomeClient />;
}
