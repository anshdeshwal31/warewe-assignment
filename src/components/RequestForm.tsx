'use client';

import { useState, useEffect } from 'react';
import { HttpRequest, HttpResponse } from '@/lib/types';

interface RequestFormProps {
  onSubmit: (request: HttpRequest) => void;
  loading: boolean;
  onLoadFromHistory: (request: HttpRequest) => void;
  initialRequest?: HttpRequest;
  environmentVariables?: Record<string, string>;
}

export default function RequestForm({ onSubmit, loading, onLoadFromHistory, initialRequest, environmentVariables = {} }: RequestFormProps) {
  const [request, setRequest] = useState<HttpRequest>(
    initialRequest || {
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '',
      name: '',
    }
  );

  const [showHeaders, setShowHeaders] = useState(false);
  const [headerInput, setHeaderInput] = useState('');

  // Update form when initialRequest changes
  useEffect(() => {
    if (initialRequest) {
      setRequest(initialRequest);
      setHeaderInput(JSON.stringify(initialRequest.headers || {}, null, 2));
    }
  }, [initialRequest]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Replace environment variables in request
    const processedRequest = {
      ...request,
      url: replaceVariables(request.url, environmentVariables),
      body: request.body ? replaceVariables(request.body, environmentVariables) : request.body,
      headers: Object.fromEntries(
        Object.entries(request.headers || {}).map(([key, value]) => [
          replaceVariables(key, environmentVariables),
          replaceVariables(value, environmentVariables)
        ])
      ),
    };
    
    onSubmit(processedRequest);
  };

  const replaceVariables = (text: string, variables: Record<string, string>): string => {
    let result = text;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  };

  const handleHeadersChange = (value: string) => {
    setHeaderInput(value);
    try {
      const headers = value ? JSON.parse(value) : {};
      setRequest(prev => ({ ...prev, headers }));
    } catch {
      // Invalid JSON, ignore
    }
  };

  const addHeader = (key: string, value: string) => {
    if (key && value) {
      setRequest(prev => ({
        ...prev,
        headers: { ...prev.headers, [key]: value }
      }));
    }
  };

  const removeHeader = (key: string) => {
    const newHeaders = { ...request.headers };
    delete newHeaders[key];
    setRequest(prev => ({ ...prev, headers: newHeaders }));
  };

  const loadRequest = (loadedRequest: HttpRequest) => {
    setRequest(loadedRequest);
    setHeaderInput(JSON.stringify(loadedRequest.headers || {}, null, 2));
    onLoadFromHistory(loadedRequest);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Request Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Request Name (optional)
          </label>
          <input
            type="text"
            value={request.name || ''}
            onChange={(e) => setRequest(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="My API Request"
          />
        </div>

        {/* URL and Method */}
        <div className="flex gap-2">
          <select
            value={request.method}
            onChange={(e) => setRequest(prev => ({ ...prev, method: e.target.value as any }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>
          <input
            type="url"
            value={request.url}
            onChange={(e) => setRequest(prev => ({ ...prev, url: e.target.value }))}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://api.example.com/endpoint"
            required
          />
        </div>

        {/* Headers Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Headers
            </label>
            <button
              type="button"
              onClick={() => setShowHeaders(!showHeaders)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showHeaders ? 'Hide' : 'Show'} Headers
            </button>
          </div>
          
          {showHeaders && (
            <div className="space-y-2">
              {/* Header List */}
              <div className="space-y-1">
                {Object.entries(request.headers || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">{key}</span>
                    <span className="text-gray-600">:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded flex-1">{value}</span>
                    <button
                      type="button"
                      onClick={() => removeHeader(key)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Add Header */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Header name"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const target = e.target as HTMLInputElement;
                      const valueInput = target.nextElementSibling as HTMLInputElement;
                      addHeader(target.value, valueInput.value);
                      target.value = '';
                      valueInput.value = '';
                    }
                  }}
                />
                <input
                  type="text"
                  placeholder="Header value"
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const target = e.target as HTMLInputElement;
                      const nameInput = target.previousElementSibling as HTMLInputElement;
                      addHeader(nameInput.value, target.value);
                      nameInput.value = '';
                      target.value = '';
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        {['POST', 'PUT', 'PATCH'].includes(request.method) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Request Body
            </label>
            <textarea
              value={request.body || ''}
              onChange={(e) => setRequest(prev => ({ ...prev, body: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={8}
              placeholder='{"key": "value"}'
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending Request...' : 'Send Request'}
        </button>
      </form>
    </div>
  );
}
