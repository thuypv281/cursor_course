'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiKeyService } from '../lib/api-service';
import Toast, { Toast as ToastType } from '../components/Toast';

export default function Playground() {
  const [apiKey, setApiKey] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const router = useRouter();

  const addToast = (toast: Omit<ToastType, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsVerifying(true);
    try {
      const isValid = await apiKeyService.verifyApiKey(apiKey);
      
      if (isValid) {
        sessionStorage.setItem('apiKey', apiKey);
        
        addToast({
          type: 'success',
          title: 'Success!',
          message: 'Valid API Key'
        });

        setTimeout(() => {
          router.push('/protected');
        }, 500);
      } else {
        addToast({
          type: 'error',
          title: 'Error!',
          message: 'Invalid API Key'
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Error!',
        message: 'Failed to verify API key'
      });
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <Toast 
          toasts={toasts} 
          onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} 
        />
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            API Playground
          </h1>
          
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label 
                htmlFor="apiKey"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Enter your API Key
              </label>
              <input
                id="apiKey"
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="tvly-..."
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <button
              type="submit"
              disabled={isVerifying}
              className={`w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all ${
                isVerifying ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isVerifying ? 'Verifying...' : 'Verify API Key'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 