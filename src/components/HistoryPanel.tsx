'use client';

import { useState, useEffect } from 'react';
import { RequestHistoryItem, PaginatedResponse, HttpRequest } from '@/lib/types';

interface HistoryPanelProps {
  onLoadRequest: (request: HttpRequest) => void;
  refreshTrigger: number;
}

export default function HistoryPanel({ onLoadRequest, refreshTrigger }: HistoryPanelProps) {
  const [history, setHistory] = useState<PaginatedResponse<RequestHistoryItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  const fetchHistory = async (currentPage = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(search && { search }),
        ...(methodFilter && { method: methodFilter }),
      });

      const response = await fetch(`/api/history?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setHistory(data);
      } else {
        console.error('Failed to fetch history:', data.error);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page);
  }, [page, search, methodFilter, refreshTrigger]);

  const deleteHistoryItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this request from history?')) {
      return;
    }

    try {
      const response = await fetch(`/api/history?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchHistory(page);
      } else {
        console.error('Failed to delete history item');
      }
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  };

  const loadRequestFromHistory = (item: RequestHistoryItem) => {
    const request: HttpRequest = {
      url: item.url,
      method: item.method as any,
      headers: item.headers ? JSON.parse(item.headers) : {},
      body: item.body || '',
      name: item.name || '',
    };
    onLoadRequest(request);
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'bg-gray-100 text-gray-600';
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-600';
    if (status >= 300 && status < 400) return 'bg-yellow-100 text-yellow-600';
    if (status >= 400 && status < 500) return 'bg-red-100 text-red-600';
    if (status >= 500) return 'bg-red-200 text-red-800';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Request History</h3>
      </div>
      
      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by URL or name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={methodFilter}
          onChange={(e) => {
            setMethodFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Methods</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>
      </div>

      {/* History List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      ) : history?.data.length ? (
        <div className="space-y-2">
          {history.data.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.statusCode)}`}>
                    {item.method}
                  </span>
                  {item.statusCode && (
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(item.statusCode)}`}>
                      {item.statusCode}
                    </span>
                  )}
                  {item.responseTime && (
                    <span className="text-xs text-gray-500">{item.responseTime}ms</span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => loadRequestFromHistory(item)}
                    className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-300 rounded hover:bg-blue-50"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => deleteHistoryItem(item.id)}
                    className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="text-sm">
                {item.name && (
                  <div className="font-medium text-gray-900 mb-1">{item.name}</div>
                )}
                <div className="text-gray-600 truncate">{item.url}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          No requests found
        </div>
      )}

      {/* Pagination */}
      {history && history.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Page {history.page} of {history.totalPages} ({history.total} total)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(history.totalPages, page + 1))}
              disabled={page === history.totalPages}
              className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
