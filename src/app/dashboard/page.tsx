'use client';

import { useState, useEffect } from 'react';
import { apiKeyService, ApiKey } from '../lib/api-service';
import Toast, { Toast as ToastType } from '@/app/components/Toast';
import Sidebar from '@/app/components/Sidebar';
import Link from 'next/link';

const generateApiKey = () => {
  const prefix = 'tvly-';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 32;
  const randomString = Array.from(
    { length }, 
    () => characters.charAt(Math.floor(Math.random() * characters.length))
  ).join('');
  
  return `${prefix}${randomString}`;
};

export default function Dashboard() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyUsage, setNewKeyUsage] = useState<number>(1000);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [showCopyTooltip, setShowCopyTooltip] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Set<string>>(new Set());
  const [toasts, setToasts] = useState<ToastType[]>([]);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true);
      const data = await apiKeyService.fetchApiKeys();
      setApiKeys(data);
    } catch (err) {
      setError('Failed to fetch API keys');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      setError('Key name is required');
      return;
    }
    
    try {
      const newKey = {
        name: newKeyName,
        value: generateApiKey(),
        usage: newKeyUsage
      };

      const data = await apiKeyService.createApiKey(newKey);
      setApiKeys(prevKeys => [data, ...prevKeys]);
      setNewKeyName('');
      setNewKeyUsage(1000);
      (document.getElementById('newKeyModal') as HTMLDialogElement)?.close();
      
      addToast({
        type: 'success',
        title: 'Success!',
        message: 'New API key has been created.'
      });
      
    } catch (err) {
      console.error('Error creating key:', err);
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    }
  };

  const handleUpdateKey = async (id: string, newName: string, newUsage: number) => {
    try {
      await apiKeyService.updateApiKey(id, { name: newName, usage: newUsage });
      setApiKeys(apiKeys.map(key => 
        key.id === id ? { ...key, name: newName, usage: newUsage } : key
      ));
      setEditingKey(null);
      
      addToast({
        type: 'success',
        title: 'Success!',
        message: 'API key has been updated.'
      });
      
    } catch (err) {
      setError('Failed to update API key');
      console.error(err);
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await apiKeyService.deleteApiKey(id);
      setApiKeys(apiKeys.filter(key => key.id !== id));
      
      addToast({
        type: 'error',
        title: 'API Key Deleted',
        message: 'The API key has been permanently deleted.'
      });
      
    } catch (err) {
      setError('Failed to delete API key');
      console.error(err);
    }
  };

  const toggleKeyVisibility = (id: string) => {
    setShowKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const addToast = (toast: Omit<ToastType, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const handleCopyKey = async (value: string, id: string) => {
    try {
      await navigator.clipboard.writeText(value);
      addToast({
        type: 'success',
        title: 'Congratulations!',
        message: 'API key copied to clipboard.'
      });
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Oh no!',
        message: 'Failed to copy API key.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Current Plan Card */}
        <div className="bg-gradient-to-r from-rose-200 to-blue-300 dark:from-rose-900 dark:to-blue-800 rounded-xl p-8 mb-8 relative">
          <div className="absolute top-4 left-0 right-0 flex justify-center">
            <Toast 
              toasts={toasts} 
              onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
            />
          </div>
          
          <div className="text-sm text-gray-700 dark:text-gray-200 mb-2">CURRENT PLAN</div>
          <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Researcher</h2>
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 mb-2">
              API Limit 
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <div className="bg-white/40 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-200">0/1,000 Requests</div>
          </div>
          <button className="absolute top-6 right-6 bg-white/30 dark:bg-black/30 px-4 py-2 rounded-lg text-sm text-gray-800 dark:text-white hover:bg-white/40 dark:hover:bg-black/40 transition-all">
            Manage Plan
          </button>
        </div>

        {/* API Keys Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">API Keys</h2>
            <button
              onClick={() => (document.getElementById('newKeyModal') as HTMLDialogElement)?.showModal()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <div className="border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">NAME</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">USAGE</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">KEY</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-500 dark:text-gray-400">OPTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {apiKeys.map((apiKey) => (
                  <tr key={apiKey.id} className="text-gray-700 dark:text-gray-300">
                    <td className="p-4">
                      {editingKey?.id === apiKey.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingKey.name}
                            onChange={(e) => setEditingKey({ ...editingKey, name: e.target.value })}
                            className="px-2 py-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          />
                          <button
                            onClick={() => handleUpdateKey(apiKey.id, editingKey.name, editingKey.usage)}
                            className="text-green-600 hover:text-green-700 dark:text-green-500"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingKey(null)}
                            className="text-gray-600 hover:text-gray-700 dark:text-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span>{apiKey.name}</span>
                      )}
                    </td>
                    <td className="p-4">{apiKey.usage}</td>
                    <td className="p-4 font-mono text-gray-600 dark:text-gray-400">
                      {showKeys.has(apiKey.id) ? apiKey.value : '••••••••••••••••'}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end items-center">
                        <button
                          onClick={() => {
                            setEditingKey(apiKey);
                            (document.getElementById('editKeyModal') as HTMLDialogElement)?.showModal();
                          }}
                          className="p-2 text-gray-400 hover:text-blue-500 rounded"
                          title="Edit key"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          title={showKeys.has(apiKey.id) ? "Hide key" : "Show key"}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {showKeys.has(apiKey.id) ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            )}
                          </svg>
                        </button>
                        <button
                          onClick={() => handleCopyKey(apiKey.value, apiKey.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 relative"
                          title="Copy to clipboard"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          {showCopyTooltip === apiKey.id && (
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded">
                              Copied!
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteKey(apiKey.id)}
                          className="p-2 text-gray-400 hover:text-red-500"
                          title="Delete key"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Enhanced New Key Modal */}
      <dialog id="newKeyModal" className="rounded-xl p-0 shadow-xl backdrop:bg-black/50 dark:bg-gray-800">
        <div className="w-[500px]">
          <div className="border-b dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create New API Key</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This API key will have full access to all API endpoints.
            </p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                API Key Name
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Development, Production, Testing"
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Limit monthly usage
              </label>
              <input
                type="number"
                value={newKeyUsage}
                onChange={(e) => setNewKeyUsage(Number(e.target.value))}
                min="0"
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Your API key will be displayed only once after creation.</p>
              <p>Make sure to copy it and store it securely.</p>
            </div>
          </div>

          <div className="border-t dark:border-gray-700 p-6 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={() => (document.getElementById('newKeyModal') as HTMLDialogElement)?.close()}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateKey}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
            >
              Create API Key
            </button>
          </div>
        </div>
      </dialog>

      {/* Edit Key Modal */}
      <dialog id="editKeyModal" className="rounded-xl p-0 shadow-xl backdrop:bg-black/50 dark:bg-gray-800">
        <div className="w-[500px]">
          <div className="border-b dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Edit API Key</h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                API Key Name
              </label>
              <input
                type="text"
                value={editingKey?.name || ''}
                onChange={(e) => setEditingKey(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Monthly Usage Limit
              </label>
              <input
                type="number"
                value={editingKey?.usage || 0}
                onChange={(e) => setEditingKey(prev => prev ? { ...prev, usage: Number(e.target.value) } : null)}
                min="0"
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="border-t dark:border-gray-700 p-6 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={() => {
                setEditingKey(null);
                (document.getElementById('editKeyModal') as HTMLDialogElement)?.close();
              }}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (editingKey) {
                  handleUpdateKey(editingKey.id, editingKey.name, editingKey.usage);
                  (document.getElementById('editKeyModal') as HTMLDialogElement)?.close();
                }
              }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </dialog>      
    </div>
  );
}