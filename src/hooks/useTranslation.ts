import { useApp } from '@/context/appContext'

export function useTranslation() {
  const { t, locale, changeLanguage, isRTL, isLoading } = useApp()
  
  return {
    t,
    locale,
    changeLanguage,
    isRTL,
    isLoading
  }
} 