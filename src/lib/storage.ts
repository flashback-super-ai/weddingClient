interface BudgetItem {
  id: string
  category: string
  item: string
  estimatedCost: number
  actualCost: number
  notes: string
}

interface ChecklistItem {
  id: string
  label: string
  checked: boolean
}

interface ChecklistCategory {
  id: string
  name: string
  items: ChecklistItem[]
  isExpanded: boolean
}

interface StorageData {
  checklist: {
    categories: ChecklistCategory[]
    lastUpdated: number
    version: string
  }
  calculator: {
    totalBudget: number
    guestCount: number
    currency: string
    mealCostPerPerson: number
    budgetItems: BudgetItem[]
    lastUpdated: number
    version: string
  }
  userProfile: {
    preferences: Record<string, any>
    lastUpdated: number
    version: string
  }
  appSettings: {
    locale: string
    lastUpdated: number
    version: string
  }
}

type StorageKey = keyof StorageData
type StorageValue<T extends StorageKey> = StorageData[T]

class WeddingStorage {
  private readonly STORAGE_PREFIX = 'wedding_app_'
  private readonly CURRENT_VERSION = '1.0.0'

  private getStorageKey(key: StorageKey): string {
    return `${this.STORAGE_PREFIX}${key}`
  }

  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__test__'
      localStorage.setItem(testKey, 'test')
      localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }

  private createDefaultData<T extends StorageKey>(key: T): StorageValue<T> {
    const defaults: StorageData = {
      checklist: {
        categories: [],
        lastUpdated: Date.now(),
        version: this.CURRENT_VERSION
      },
      calculator: {
        totalBudget: 25000,
        guestCount: 100,
        currency: 'USD',
        mealCostPerPerson: 95,
        budgetItems: [],
        lastUpdated: Date.now(),
        version: this.CURRENT_VERSION
      },
      userProfile: {
        preferences: {},
        lastUpdated: Date.now(),
        version: this.CURRENT_VERSION
      },
      appSettings: {
        locale: 'he',
        lastUpdated: Date.now(),
        version: this.CURRENT_VERSION
      }
    }
    
    return defaults[key] as StorageValue<T>
  }

  private migrateData<T extends StorageKey>(key: T, data: any): StorageValue<T> {
    if (!data.version || data.version !== this.CURRENT_VERSION) {
      console.log(`Migrating ${key} data from version ${data.version || 'unknown'} to ${this.CURRENT_VERSION}`)
      
      const migrated = {
        ...this.createDefaultData(key),
        ...data,
        version: this.CURRENT_VERSION,
        lastUpdated: Date.now()
      }
      
      this.save(key, migrated)
      return migrated
    }
    
    return data as StorageValue<T>
  }

  load<T extends StorageKey>(key: T): StorageValue<T> {
    if (!this.isLocalStorageAvailable()) {
      console.warn('LocalStorage not available, using default data')
      return this.createDefaultData(key)
    }

    try {
      const storageKey = this.getStorageKey(key)
      const stored = localStorage.getItem(storageKey)
      
      if (!stored) {
        const defaultData = this.createDefaultData(key)
        this.save(key, defaultData)
        return defaultData
      }

      const parsed = JSON.parse(stored)
      return this.migrateData(key, parsed)
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
      return this.createDefaultData(key)
    }
  }

  save<T extends StorageKey>(key: T, data: StorageValue<T>): boolean {
    if (!this.isLocalStorageAvailable()) {
      console.warn('LocalStorage not available, data not saved')
      return false
    }

    try {
      const dataToSave = {
        ...data,
        lastUpdated: Date.now(),
        version: this.CURRENT_VERSION
      }
      
      const storageKey = this.getStorageKey(key)
      localStorage.setItem(storageKey, JSON.stringify(dataToSave))
      
      console.log(`Successfully saved ${key} to localStorage`)
      return true
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error)
      return false
    }
  }

  update<T extends StorageKey>(key: T, updater: (current: StorageValue<T>) => StorageValue<T>): boolean {
    const current = this.load(key)
    const updated = updater(current)
    return this.save(key, updated)
  }

  remove(key: StorageKey): boolean {
    if (!this.isLocalStorageAvailable()) {
      return false
    }

    try {
      const storageKey = this.getStorageKey(key)
      localStorage.removeItem(storageKey)
      console.log(`Successfully removed ${key} from localStorage`)
      return true
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error)
      return false
    }
  }

  clear(): boolean {
    if (!this.isLocalStorageAvailable()) {
      return false
    }

    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
      console.log('Successfully cleared all wedding app data from localStorage')
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  }

  getLastUpdated(key: StorageKey): number {
    const data = this.load(key)
    return data.lastUpdated || 0
  }

  exportData(): string {
    const exportData: any = {}
    
    const keys: StorageKey[] = ['checklist', 'calculator', 'userProfile', 'appSettings']
    keys.forEach(key => {
      exportData[key] = this.load(key)
    })
    
    return JSON.stringify(exportData, null, 2)
  }

  importData(jsonData: string): boolean {
    try {
      const importData = JSON.parse(jsonData)
      
      const keys: StorageKey[] = ['checklist', 'calculator', 'userProfile', 'appSettings']
      keys.forEach(key => {
        if (importData[key]) {
          this.save(key, importData[key])
        }
      })
      
      console.log('Successfully imported data')
      return true
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }

  getStorageSize(): number {
    if (!this.isLocalStorageAvailable()) {
      return 0
    }

    let totalSize = 0
    const keys = Object.keys(localStorage)
    
    keys.forEach(key => {
      if (key.startsWith(this.STORAGE_PREFIX)) {
        const value = localStorage.getItem(key)
        if (value) {
          totalSize += new Blob([value]).size
        }
      }
    })
    
    return totalSize
  }
}

export const weddingStorage = new WeddingStorage()

export type { StorageData, StorageKey, StorageValue, BudgetItem, ChecklistItem, ChecklistCategory } 