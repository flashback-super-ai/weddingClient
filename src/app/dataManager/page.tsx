'use client'

import React from 'react'
import NavBar from '../../components/navBar'
import StorageManager from '../../components/StorageManager'
import { useTranslation } from '@/hooks/useTranslation'

export default function DataManager() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-1 bg-gradient-to-br from-blue-100 to-indigo-100 p-6">
        <div className="w-full px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4 text-content">
              {t('storage.title', 'Data Management')}
            </h1>
            <p className="text-lg text-gray-600 text-content">
              {t('storage.description', 'Manage your wedding planning data - export, import, or clear all saved information')}
            </p>
          </div>
          <StorageManager />
        </div>
      </div>
    </div>
  )
} 