'use client';

import { useState, useEffect } from 'react';
import { HttpRequest } from '@/lib/types';

interface Collection {
  id: string;
  name: string;
  requests: HttpRequest[];
}

interface CollectionManagerProps {
  currentRequest: HttpRequest;
  onLoadRequest: (request: HttpRequest) => void;
}

export default function CollectionManager({ currentRequest, onLoadRequest }: CollectionManagerProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  // Load collections from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('rest-client-collections');
    if (saved) {
      try {
        setCollections(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load collections:', error);
      }
    }
  }, []);

  // Save collections to localStorage whenever collections change
  useEffect(() => {
    localStorage.setItem('rest-client-collections', JSON.stringify(collections));
  }, [collections]);

  const createCollection = () => {
    if (!newCollectionName.trim()) return;

    const newCollection: Collection = {
      id: Date.now().toString(),
      name: newCollectionName.trim(),
      requests: [],
    };

    setCollections(prev => [...prev, newCollection]);
    setNewCollectionName('');
    setShowCreateForm(false);
  };

  const deleteCollection = (id: string) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;
    setCollections(prev => prev.filter(c => c.id !== id));
    if (selectedCollection === id) {
      setSelectedCollection(null);
    }
  };

  const saveRequestToCollection = (collectionId: string) => {
    if (!currentRequest.url) {
      alert('Please enter a URL first');
      return;
    }

    const requestToSave: HttpRequest = {
      ...currentRequest,
      name: currentRequest.name || `${currentRequest.method} ${currentRequest.url}`,
    };

    setCollections(prev => prev.map(collection => 
      collection.id === collectionId
        ? { ...collection, requests: [...collection.requests, requestToSave] }
        : collection
    ));

    alert('Request saved to collection!');
  };

  const removeRequestFromCollection = (collectionId: string, requestIndex: number) => {
    setCollections(prev => prev.map(collection =>
      collection.id === collectionId
        ? { ...collection, requests: collection.requests.filter((_, i) => i !== requestIndex) }
        : collection
    ));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Collections</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          + New Collection
        </button>
      </div>

      {/* Create Collection Form */}
      {showCreateForm && (
        <div className="mb-4 p-3 border border-gray-200 rounded-md">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && createCollection()}
            />
            <button
              onClick={createCollection}
              className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewCollectionName('');
              }}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Collections List */}
      <div className="space-y-2">
        {collections.map((collection) => (
          <div key={collection.id} className="border border-gray-200 rounded-md">
            <div 
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
              onClick={() => setSelectedCollection(
                selectedCollection === collection.id ? null : collection.id
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {selectedCollection === collection.id ? '▼' : '▶'}
                </span>
                <span className="font-medium">{collection.name}</span>
                <span className="text-sm text-gray-500">
                  ({collection.requests.length} requests)
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    saveRequestToCollection(collection.id);
                  }}
                  className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Save Current
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCollection(collection.id);
                  }}
                  className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Requests in Collection */}
            {selectedCollection === collection.id && (
              <div className="border-t border-gray-200 p-3 space-y-2">
                {collection.requests.length === 0 ? (
                  <p className="text-gray-500 text-sm">No requests in this collection</p>
                ) : (
                  collection.requests.map((request, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                            {request.method}
                          </span>
                          <span className="text-sm font-medium truncate">
                            {request.name || request.url}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 truncate mt-1">
                          {request.url}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => onLoadRequest(request)}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => removeRequestFromCollection(collection.id, index)}
                          className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {collections.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <p>No collections yet.</p>
          <p className="text-sm">Create a collection to organize your requests.</p>
        </div>
      )}
    </div>
  );
}
