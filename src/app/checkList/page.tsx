'use client';

import React from 'react';
import NavBar from '../../components/navBar';
import WeddingChecklist from '../../components/WeddingChecklist';

export default function CheckList() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-1 bg-gradient-to-br from-pink-100 to-purple-100 p-6">
        <div className="w-full px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Wedding Checklist</h1>
            <p className="text-lg text-gray-600">Stay organized and never miss a detail</p>
          </div>
          <WeddingChecklist />
        </div>
      </div>
    </div>
  );
}
