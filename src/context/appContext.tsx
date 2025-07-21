'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface AppContextType {
  locale: string
  translations: Record<string, any>
  changeLanguage: (locale: string) => void
  t: (key: string, fallback?: string) => string
  isRTL: boolean
  isLoading: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps {
  children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  const [locale, setLocale] = useState('he')
  const [translations, setTranslations] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load initial locale from localStorage, then cookie, then default
  useEffect(() => {
    const savedLocale = document.cookie
      .split('; ')
      .find(row => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1]
    
    const localStorageLocale = localStorage.getItem('wedding_app_locale')
    
    if (savedLocale && ['he', 'en'].includes(savedLocale)) {
      setLocale(savedLocale)
      localStorage.setItem('wedding_app_locale', savedLocale)
    } else if (localStorageLocale && ['he', 'en'].includes(localStorageLocale)) {
      setLocale(localStorageLocale)
    } else {
      setLocale('he')
      localStorage.setItem('wedding_app_locale', 'he')
    }
  }, [])

  useEffect(() => {
    loadTranslations(locale)
  }, [locale])

  const loadTranslations = async (lang: string) => {
    try {
      setIsLoading(true)
      const response = await import(`../locales/${lang}.json`)
      setTranslations(response.default)
      setIsLoading(false)
    } catch (error) {
      console.error(`Failed to load translations for ${lang}:`, error)
      if (lang !== 'he') {
        loadTranslations('he')
      } else {
        setIsLoading(false)
      }
    }
  }

  const changeLanguage = async (newLocale: string) => {
    if (newLocale === locale) return
    
    setIsLoading(true)
    
    // Set cookie for persistence
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`
    
    // Save to localStorage
    localStorage.setItem('wedding_app_locale', newLocale)
    
    // Load new translations first
    try {
      const response = await import(`../locales/${newLocale}.json`)
      setTranslations(response.default)
      setLocale(newLocale)
      setIsLoading(false)
    } catch (error) {
      console.error(`Failed to load translations for ${newLocale}:`, error)
      setIsLoading(false)
    }
  }

  const t = (key: string, fallback?: string): string => {
    if (isLoading) {
      return fallback || key
    }
    
    const keys = key.split('.')
    let value = translations
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return fallback || key
      }
    }
    
    return typeof value === 'string' ? value : fallback || key
  }

  const isRTL = locale === 'he'

  const value: AppContextType = {
    locale,
    translations,
    changeLanguage,
    t,
    isRTL,
    isLoading
  }

  return (
    <AppContext.Provider value={value}>
      <div className={`locale-${locale} ${isRTL ? 'rtl-text' : 'ltr-text'}`}>
        {children}
      </div>
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
