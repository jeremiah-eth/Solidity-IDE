import React from 'react';

export default function App() {
  console.log('App component is rendering');
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold">Solidity IDE is working!</h1>
      <p className="mt-4">If you can see this, the React app is loading correctly.</p>
      <p className="mt-2 text-gray-400">Check the browser console for any errors.</p>
    </div>
  );
}
