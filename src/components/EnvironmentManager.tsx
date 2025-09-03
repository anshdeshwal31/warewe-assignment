'use client';

import { useState, useEffect } from 'react';

interface Environment {
  id: string;
  name: string;
  variables: Record<string, string>;
}

interface EnvironmentManagerProps {
  onVariableChange: (variables: Record<string, string>) => void;
}

export default function EnvironmentManager({ onVariableChange }: EnvironmentManagerProps) {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [activeEnvId, setActiveEnvId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');
  const [showEditEnv, setShowEditEnv] = useState<string | null>(null);
  const [editingVariables, setEditingVariables] = useState<Record<string, string>>({});

  // Load environments from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('rest-client-environments');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setEnvironments(data.environments || []);
        setActiveEnvId(data.activeEnvId || null);
      } catch (error) {
        console.error('Failed to load environments:', error);
      }
    }
  }, []);

  // Save environments to localStorage
  useEffect(() => {
    localStorage.setItem('rest-client-environments', JSON.stringify({
      environments,
      activeEnvId,
    }));
  }, [environments, activeEnvId]);

  // Notify parent of variable changes
  useEffect(() => {
    const activeEnv = environments.find(env => env.id === activeEnvId);
    onVariableChange(activeEnv?.variables || {});
  }, [activeEnvId, environments, onVariableChange]);

  const createEnvironment = () => {
    if (!newEnvName.trim()) return;

    const newEnv: Environment = {
      id: Date.now().toString(),
      name: newEnvName.trim(),
      variables: {},
    };

    setEnvironments(prev => [...prev, newEnv]);
    setNewEnvName('');
    setShowCreateForm(false);
  };

  const deleteEnvironment = (id: string) => {
    if (!confirm('Are you sure you want to delete this environment?')) return;
    
    setEnvironments(prev => prev.filter(env => env.id !== id));
    if (activeEnvId === id) {
      setActiveEnvId(null);
    }
  };

  const startEditingEnvironment = (env: Environment) => {
    setEditingVariables({ ...env.variables });
    setShowEditEnv(env.id);
  };

  const saveEnvironmentVariables = (envId: string) => {
    setEnvironments(prev => prev.map(env =>
      env.id === envId
        ? { ...env, variables: { ...editingVariables } }
        : env
    ));
    setShowEditEnv(null);
    setEditingVariables({});
  };

  const addVariable = (key: string, value: string) => {
    if (key && value) {
      setEditingVariables(prev => ({ ...prev, [key]: value }));
    }
  };

  const removeVariable = (key: string) => {
    const newVars = { ...editingVariables };
    delete newVars[key];
    setEditingVariables(newVars);
  };

  const replaceVariables = (text: string, variables: Record<string, string>): string => {
    let result = text;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-900">Environments</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          + New Environment
        </button>
      </div>

      {/* Create Environment Form */}
      {showCreateForm && (
        <div className="mb-3 p-3 border border-gray-200 rounded-md">
          <div className="flex gap-2">
            <input
              type="text"
              value={newEnvName}
              onChange={(e) => setNewEnvName(e.target.value)}
              placeholder="Environment name"
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              onKeyPress={(e) => e.key === 'Enter' && createEnvironment()}
            />
            <button
              onClick={createEnvironment}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewEnvName('');
              }}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Environment Selection */}
      {environments.length > 0 && (
        <div className="mb-3">
          <select
            value={activeEnvId || ''}
            onChange={(e) => setActiveEnvId(e.target.value || null)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="">No Environment</option>
            {environments.map(env => (
              <option key={env.id} value={env.id}>{env.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Environment List */}
      <div className="space-y-2">
        {environments.map(env => (
          <div key={env.id} className="border border-gray-200 rounded-md">
            <div className="flex items-center justify-between p-2 bg-gray-50">
              <span className="font-medium text-sm">{env.name}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => startEditingEnvironment(env)}
                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteEnvironment(env.id)}
                  className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Edit Variables Form */}
            {showEditEnv === env.id && (
              <div className="p-3 border-t border-gray-200">
                <div className="space-y-2">
                  {Object.entries(editingVariables).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <input
                        type="text"
                        value={key}
                        onChange={(e) => {
                          const newKey = e.target.value;
                          const newVars = { ...editingVariables };
                          delete newVars[key];
                          if (newKey) newVars[newKey] = value;
                          setEditingVariables(newVars);
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Variable name"
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => {
                          setEditingVariables(prev => ({ ...prev, [key]: e.target.value }));
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Variable value"
                      />
                      <button
                        onClick={() => removeVariable(key)}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  
                  {/* Add Variable */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Variable name"
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          const valueInput = target.nextElementSibling as HTMLInputElement;
                          addVariable(target.value, valueInput.value);
                          target.value = '';
                          valueInput.value = '';
                        }
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Variable value"
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          const nameInput = target.previousElementSibling as HTMLInputElement;
                          addVariable(nameInput.value, target.value);
                          nameInput.value = '';
                          target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => saveEnvironmentVariables(env.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowEditEnv(null);
                      setEditingVariables({});
                    }}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {environments.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          <p className="text-sm">No environments yet.</p>
          <p className="text-xs">Create an environment to manage variables like {'{{'} baseUrl {'}}'}</p>
        </div>
      )}
    </div>
  );
}
