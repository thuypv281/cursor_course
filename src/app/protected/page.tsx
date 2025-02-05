'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Protected() {
  const [apiKey, setApiKey] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Kiểm tra API key từ session
    const key = sessionStorage.getItem('apiKey');
    if (!key) {
      router.push('/playground');
      return;
    }

    // Mask API key để hiển thị
    setApiKey(key.replace(/^(tvly-[^-]{4}).*$/, '$1****'));
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Protected Page
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            This is protected page. You need a valid API Key to access.
          </p>
          {apiKey && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Currently using API Key:
              </p>
              <code className="text-purple-600 dark:text-purple-400">
                {apiKey}
              </code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 