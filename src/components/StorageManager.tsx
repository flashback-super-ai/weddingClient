'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useTranslation } from '@/hooks/useTranslation'

export default function StorageManager() {
  const { t } = useTranslation()
  const [importData, setImportData] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const exportAllData = () => {
    const data = {
      checklist: localStorage.getItem('wedding_app_checklist'),
      calculator: localStorage.getItem('wedding_app_calculator'),
      locale: localStorage.getItem('wedding_app_locale'),
      timestamp: new Date().toISOString()
    }
    return JSON.stringify(data, null, 2)
  }

  const importAllData = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData)
      if (data.checklist) localStorage.setItem('wedding_app_checklist', data.checklist)
      if (data.calculator) localStorage.setItem('wedding_app_calculator', data.calculator)
      if (data.locale) localStorage.setItem('wedding_app_locale', data.locale)
      return true
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }

  const clearAllData = () => {
    localStorage.removeItem('wedding_app_checklist')
    localStorage.removeItem('wedding_app_calculator')
    localStorage.removeItem('wedding_app_locale')
    return true
  }

  const getFormattedStorageSize = () => {
    const checklist = localStorage.getItem('wedding_app_checklist') || ''
    const calculator = localStorage.getItem('wedding_app_calculator') || ''
    const locale = localStorage.getItem('wedding_app_locale') || ''
    const totalSize = new Blob([checklist, calculator, locale]).size
    
    if (totalSize < 1024) return `${totalSize} B`
    if (totalSize < 1024 * 1024) return `${(totalSize / 1024).toFixed(2)} KB`
    return `${(totalSize / (1024 * 1024)).toFixed(2)} MB`
  }

  const handleExport = () => {
    try {
      const data = exportAllData()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `wedding-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      setMessage(t('storage.exportSuccess', 'Data exported successfully!'))
    } catch (error) {
      setMessage(t('storage.exportError', 'Failed to export data'))
    }
  }

  const handleImport = async () => {
    if (!importData.trim()) {
      setMessage(t('storage.importDataRequired', 'Please enter data to import'))
      return
    }

    setIsLoading(true)
    try {
      const success = importAllData(importData)
      if (success) {
        setMessage(t('storage.importSuccess', 'Data imported successfully!'))
        setImportData('')
        setShowImport(false)
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setMessage(t('storage.importError', 'Failed to import data'))
      }
    } catch (error) {
      setMessage(t('storage.importError', 'Failed to import data'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = async () => {
    if (window.confirm(t('storage.clearConfirm', 'Are you sure you want to clear all data? This action cannot be undone.'))) {
      setIsLoading(true)
      try {
        const success = clearAllData()
        if (success) {
          setMessage(t('storage.clearSuccess', 'All data cleared successfully!'))
          setTimeout(() => window.location.reload(), 1500)
        } else {
          setMessage(t('storage.clearError', 'Failed to clear data'))
        }
      } catch (error) {
        setMessage(t('storage.clearError', 'Failed to clear data'))
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setImportData(content)
      }
      reader.readAsText(file)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t('storage.title', 'Data Management')}</CardTitle>
        <CardDescription>
          {t('storage.description', 'Manage your wedding planning data - export, import, or clear all saved information')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Storage Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">{t('storage.storageInfo', 'Storage Information')}</h3>
          <p className="text-sm text-gray-600">
            {t('storage.currentSize', 'Current storage size')}: {getFormattedStorageSize()}
          </p>
        </div>

        {/* Export Section */}
        <div className="space-y-3">
          <h3 className="font-semibold">{t('storage.exportTitle', 'Export Data')}</h3>
          <p className="text-sm text-gray-600">
            {t('storage.exportDescription', 'Download all your wedding planning data as a JSON file')}
          </p>
          <Button onClick={handleExport} disabled={isLoading}>
            {t('storage.exportButton', 'Export Data')}
          </Button>
        </div>

        {/* Import Section */}
        <div className="space-y-3">
          <h3 className="font-semibold">{t('storage.importTitle', 'Import Data')}</h3>
          <p className="text-sm text-gray-600">
            {t('storage.importDescription', 'Import previously exported data to restore your wedding planning information')}
          </p>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowImport(!showImport)} 
              variant="outline"
              disabled={isLoading}
            >
              {showImport ? t('common.cancel', 'Cancel') : t('storage.importButton', 'Import Data')}
            </Button>
            
            <Label htmlFor="file-import" className="cursor-pointer">
              <Button variant="outline" asChild disabled={isLoading}>
                <span>{t('storage.importFile', 'Import from File')}</span>
              </Button>
            </Label>
            <Input
              id="file-import"
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </div>

          {showImport && (
            <div className="space-y-3">
              <Label htmlFor="import-data">{t('storage.importDataLabel', 'Paste exported data here')}</Label>
              <textarea
                id="import-data"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder={t('storage.importPlaceholder', 'Paste your exported JSON data here...')}
                className="w-full h-32 p-3 border rounded-md resize-none"
                disabled={isLoading}
              />
              <Button 
                onClick={handleImport} 
                disabled={isLoading || !importData.trim()}
              >
                {isLoading ? t('common.loading', 'Loading...') : t('storage.importConfirm', 'Import Data')}
              </Button>
            </div>
          )}
        </div>

        {/* Clear Data Section */}
        <div className="space-y-3 border-t pt-4">
          <h3 className="font-semibold text-red-600">{t('storage.clearTitle', 'Clear All Data')}</h3>
          <p className="text-sm text-gray-600">
            {t('storage.clearDescription', 'Permanently delete all your wedding planning data. This action cannot be undone.')}
          </p>
          <Button 
            onClick={handleClear} 
            variant="destructive"
            disabled={isLoading}
          >
            {isLoading ? t('common.loading', 'Loading...') : t('storage.clearButton', 'Clear All Data')}
          </Button>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`p-3 rounded-md ${
            message.includes('success') || message.includes('successfully') 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 