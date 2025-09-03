'use client';

import { HttpResponse } from '@/lib/types';

interface ResponseViewerProps {
  response: HttpResponse | null;
  loading: boolean;
  error: string | null;
}

export default function ResponseViewer({ response, loading, error }: ResponseViewerProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Sending request...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500 py-8">
          Make a request to see the response here
        </div>
      </div>
    );
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-50';
    if (status >= 300 && status < 400) return 'text-yellow-600 bg-yellow-50';
    if (status >= 400 && status < 500) return 'text-red-600 bg-red-50';
    if (status >= 500) return 'text-red-800 bg-red-100';
    return 'text-gray-600 bg-gray-50';
  };

  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(response.status)}`}>
              {response.status} {response.statusText}
            </span>
            <span className="text-sm text-gray-600">
              {response.responseTime}ms
            </span>
          </div>
        </div>

        {/* Headers */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Response Headers</h3>
          <div className="bg-gray-50 rounded-md p-3 max-h-40 overflow-y-auto">
            <pre className="text-sm font-mono">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="mb-1">
                  <span className="text-blue-600">{key}:</span> {String(value)}
                </div>
              ))}
            </pre>
          </div>
        </div>

        {/* Body */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Response Body</h3>
          <div className="bg-gray-50 rounded-md p-3 max-h-96 overflow-auto">
            <pre className="text-sm font-mono whitespace-pre-wrap">
              {formatJson(response.data)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
