'use client';

import { useState } from 'react';
import RequestForm from '@/components/RequestForm';
import ResponseViewer from '@/components/ResponseViewer';
import HistoryPanel from '@/components/HistoryPanel';
import CollectionManager from '@/components/CollectionManager';
import EnvironmentManager from '@/components/EnvironmentManager';
import ExportImportManager from '@/components/ExportImportManager';
import { HttpRequest, HttpResponse } from '@/lib/types';

export default function Home() {
  const [response, setResponse] = useState<HttpResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshHistoryTrigger, setRefreshHistoryTrigger] = useState(0);
  const [currentRequest, setCurrentRequest] = useState<HttpRequest>({
    url: '',
    method: 'GET',
    headers: {},
    body: '',
    name: '',
  });
  const [activeTab, setActiveTab] = useState<'history' | 'collections'>('history');
  const [environmentVariables, setEnvironmentVariables] = useState<Record<string, string>>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRequest = async (request: HttpRequest) => {
    setCurrentRequest(request);
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.error || 'Request failed');
        if (data.status && data.statusText) {
          // Even failed requests return response data
          setResponse(data);
        }
      }
      
      // Refresh history after each request
      setRefreshHistoryTrigger((prev: number) => prev + 1);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadFromHistory = (request: HttpRequest) => {
    setCurrentRequest(request);
    // Clear previous response when loading from history
    setResponse(null);
    setError(null);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">REST Client</h1>
          <p className="text-gray-600">A Postman-like REST API client built with Next.js and MikroORM</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Request Form */}
          <div className="lg:col-span-2 space-y-6">
            <EnvironmentManager onVariableChange={setEnvironmentVariables} />
            <ExportImportManager onImportComplete={handleRefresh} />
            <RequestForm 
              onSubmit={handleRequest} 
              loading={loading}
              onLoadFromHistory={handleLoadFromHistory}
              initialRequest={currentRequest}
              environmentVariables={environmentVariables}
            />
          </div>

          {/* Right Sidebar */}
          <div>
            {/* Tab Navigation */}
            <div className="bg-white rounded-t-lg shadow-md">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    activeTab === 'history'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  History
                </button>
                <button
                  onClick={() => setActiveTab('collections')}
                  className={`flex-1 px-4 py-3 text-sm font-medium ${
                    activeTab === 'collections'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Collections
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-b-lg shadow-md p-6">
              {activeTab === 'history' ? (
                <HistoryPanel 
                  onLoadRequest={handleLoadFromHistory}
                  refreshTrigger={refreshHistoryTrigger + refreshTrigger}
                />
              ) : (
                <CollectionManager
                  currentRequest={currentRequest}
                  onLoadRequest={handleLoadFromHistory}
                  key={refreshTrigger} // Force re-render on import
                />
              )}
            </div>
          </div>
        </div>

        {/* Response Viewer */}
        <div className="mt-6">
          <ResponseViewer 
            response={response} 
            loading={loading} 
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
