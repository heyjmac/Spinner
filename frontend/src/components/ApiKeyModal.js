import React, { useState } from 'react';

export const ApiKeyModal = ({ isOpen, onSave }) => {
  const [apiKey, setApiKey] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey);
      setApiKey('');
    } else {
      alert('Please enter a valid API key.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-lg shadow-md px-4 py-3 w-[300px] text-neutral-50">
        <h2 className="text-base font-title font-semibold mb-3">Enter your OpenAI API Key</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full border border-neutral-700 bg-neutral-800 text-neutral-50 text-sm p-2 rounded-md placeholder-neutral-500"
            placeholder="sk-..."
          />
          <button
            onClick={handleSave}
            className="bg-primary-500 text-sm text-white px-3 py-2 rounded-md hover:bg-primary-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
