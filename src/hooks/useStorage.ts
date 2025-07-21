import { useState, useEffect, useCallback, useRef } from 'react'
import { weddingStorage, StorageKey, StorageValue, BudgetItem, ChecklistCategory } from '@/lib/storage'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

function useLocalStorage<T extends StorageKey>(
  key: T,
  options: {
    autoSave?: boolean
    debounceDelay?: number
  } = {}
) {
  const { autoSave = true, debounceDelay = 1000 } = options
  const [data, setData] = useState<StorageValue<T>>(() => weddingStorage.load(key))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debouncedData = useDebounce(data, debounceDelay)

  const save = useCallback((newData: StorageValue<T>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const success = weddingStorage.save(key, newData)
      if (!success) {
        throw new Error('Failed to save data to localStorage')
      }
      setData(newData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [key])

  const update = useCallback((updater: (current: StorageValue<T>) => StorageValue<T>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const success = weddingStorage.update(key, updater)
      if (!success) {
        throw new Error('Failed to update data in localStorage')
      }
      setData(weddingStorage.load(key))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [key])

  const remove = useCallback(() => {
    setIsLoading(true)
    setError(null)
    
    try {
      const success = weddingStorage.remove(key)
      if (!success) {
        throw new Error('Failed to remove data from localStorage')
      }
      setData(weddingStorage.load(key))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [key])

  useEffect(() => {
    if (autoSave) {
      save(debouncedData)
    }
  }, [debouncedData, autoSave, save])

  return {
    data,
    setData,
    save,
    update,
    remove,
    isLoading,
    error,
    lastUpdated: weddingStorage.getLastUpdated(key)
  }
}

export function useChecklistStorage() {
  const storage = useLocalStorage('checklist', { debounceDelay: 500 })
  
  const updateCategories = useCallback((categories: ChecklistCategory[]) => {
    storage.setData({
      ...storage.data,
      categories
    })
  }, [storage])

  const toggleItem = useCallback((categoryId: string, itemId: string) => {
    storage.update(current => ({
      ...current,
      categories: current.categories.map(cat => 
        cat.id === categoryId ? {
          ...cat,
          items: cat.items.map(item => 
            item.id === itemId ? { ...item, checked: !item.checked } : item
          )
        } : cat
      )
    }))
  }, [storage])

  const addCategory = useCallback((category: ChecklistCategory) => {
    storage.update(current => ({
      ...current,
      categories: [category, ...current.categories]
    }))
  }, [storage])

  const removeCategory = useCallback((categoryId: string) => {
    storage.update(current => ({
      ...current,
      categories: current.categories.filter(cat => cat.id !== categoryId)
    }))
  }, [storage])

  const updateCategoryName = useCallback((categoryId: string, name: string) => {
    storage.update(current => ({
      ...current,
      categories: current.categories.map(cat => 
        cat.id === categoryId ? { ...cat, name } : cat
      )
    }))
  }, [storage])

  const addItem = useCallback((categoryId: string, item: { id: string; label: string; checked: boolean }) => {
    storage.update(current => ({
      ...current,
      categories: current.categories.map(cat => 
        cat.id === categoryId ? {
          ...cat,
          items: [...cat.items, item]
        } : cat
      )
    }))
  }, [storage])

  const removeItem = useCallback((categoryId: string, itemId: string) => {
    storage.update(current => ({
      ...current,
      categories: current.categories.map(cat => 
        cat.id === categoryId ? {
          ...cat,
          items: cat.items.filter(item => item.id !== itemId)
        } : cat
      )
    }))
  }, [storage])

  const updateItemLabel = useCallback((categoryId: string, itemId: string, label: string) => {
    storage.update(current => ({
      ...current,
      categories: current.categories.map(cat => 
        cat.id === categoryId ? {
          ...cat,
          items: cat.items.map(item => 
            item.id === itemId ? { ...item, label } : item
          )
        } : cat
      )
    }))
  }, [storage])

  const toggleCategoryExpansion = useCallback((categoryId: string) => {
    storage.update(current => ({
      ...current,
      categories: current.categories.map(cat => 
        cat.id === categoryId ? { ...cat, isExpanded: !cat.isExpanded } : cat
      )
    }))
  }, [storage])

  return {
    ...storage,
    categories: storage.data.categories,
    updateCategories,
    toggleItem,
    addCategory,
    removeCategory,
    updateCategoryName,
    addItem,
    removeItem,
    updateItemLabel,
    toggleCategoryExpansion
  }
}

export function useCalculatorStorage() {
  const storage = useLocalStorage('calculator', { debounceDelay: 800 })
  
  const updateBudget = useCallback((totalBudget: number) => {
    storage.setData({
      ...storage.data,
      totalBudget
    })
  }, [storage])

  const updateGuestCount = useCallback((guestCount: number) => {
    storage.setData({
      ...storage.data,
      guestCount
    })
  }, [storage])

  const updateCurrency = useCallback((currency: string) => {
    storage.setData({
      ...storage.data,
      currency
    })
  }, [storage])

  const updateMealCostPerPerson = useCallback((mealCostPerPerson: number) => {
    storage.setData({
      ...storage.data,
      mealCostPerPerson
    })
  }, [storage])

  const updateBudgetItems = useCallback((budgetItems: BudgetItem[]) => {
    storage.setData({
      ...storage.data,
      budgetItems
    })
  }, [storage])

  const addBudgetItem = useCallback((item: BudgetItem) => {
    storage.update(current => ({
      ...current,
      budgetItems: [...current.budgetItems, item]
    }))
  }, [storage])

  const removeBudgetItem = useCallback((itemId: string) => {
    storage.update(current => ({
      ...current,
      budgetItems: current.budgetItems.filter(item => item.id !== itemId)
    }))
  }, [storage])

  const updateBudgetItem = useCallback((itemId: string, updates: Partial<BudgetItem>) => {
    storage.update(current => ({
      ...current,
      budgetItems: current.budgetItems.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    }))
  }, [storage])

  return {
    ...storage,
    totalBudget: storage.data.totalBudget,
    guestCount: storage.data.guestCount,
    currency: storage.data.currency,
    mealCostPerPerson: storage.data.mealCostPerPerson,
    budgetItems: storage.data.budgetItems,
    updateBudget,
    updateGuestCount,
    updateCurrency,
    updateMealCostPerPerson,
    updateBudgetItems,
    addBudgetItem,
    removeBudgetItem,
    updateBudgetItem
  }
}

export function useUserProfileStorage() {
  const storage = useLocalStorage('userProfile')
  
  const updatePreferences = useCallback((preferences: Record<string, any>) => {
    storage.setData({
      ...storage.data,
      preferences
    })
  }, [storage])

  const updatePreference = useCallback((key: string, value: any) => {
    storage.update(current => ({
      ...current,
      preferences: {
        ...current.preferences,
        [key]: value
      }
    }))
  }, [storage])

  const removePreference = useCallback((key: string) => {
    storage.update(current => ({
      ...current,
      preferences: Object.fromEntries(
        Object.entries(current.preferences).filter(([k]) => k !== key)
      )
    }))
  }, [storage])

  return {
    ...storage,
    preferences: storage.data.preferences,
    updatePreferences,
    updatePreference,
    removePreference
  }
}

export function useAppSettingsStorage() {
  const storage = useLocalStorage('appSettings')
  
  const updateLocale = useCallback((locale: string) => {
    storage.setData({
      ...storage.data,
      locale
    })
  }, [storage])

  return {
    ...storage,
    locale: storage.data.locale,
    updateLocale
  }
}

export function useStorageManager() {
  const exportAllData = useCallback(() => {
    return weddingStorage.exportData()
  }, [])

  const importAllData = useCallback((jsonData: string) => {
    return weddingStorage.importData(jsonData)
  }, [])

  const clearAllData = useCallback(() => {
    return weddingStorage.clear()
  }, [])

  const getStorageSize = useCallback(() => {
    return weddingStorage.getStorageSize()
  }, [])

  const getFormattedStorageSize = useCallback(() => {
    const size = weddingStorage.getStorageSize()
    if (size < 1024) return `${size} B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
    return `${(size / (1024 * 1024)).toFixed(2)} MB`
  }, [])

  return {
    exportAllData,
    importAllData,
    clearAllData,
    getStorageSize,
    getFormattedStorageSize
  }
} 