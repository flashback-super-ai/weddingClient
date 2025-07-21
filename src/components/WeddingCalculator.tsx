'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Progress } from './ui/progress'
import { AnimatedCounter } from './ui/animated-counter'
import { wedding_services_2025 } from '../lib/constant/wedding_range_isreal'
import { useTranslation } from '@/hooks/useTranslation'

interface BudgetItem {
  id: string
  category: string
  item: string
  estimatedCost: number
  actualCost: number
  notes: string
}

interface BudgetCategory {
  name: string
  percentage: number
  color: string
}

const getBudgetCategories = (currency: string): BudgetCategory[] => {
  if (currency === 'ILS') {
    return [
      { name: 'Venue & Catering', percentage: 45, color: 'bg-pink-500' },
      { name: 'Photography & Video', percentage: 12, color: 'bg-purple-500' },
      { name: 'Attire & Beauty', percentage: 15, color: 'bg-blue-500' },
      { name: 'Music & Entertainment', percentage: 8, color: 'bg-yellow-500' },
      { name: 'Flowers & Decor', percentage: 6, color: 'bg-green-500' },
      { name: 'Religious Services', percentage: 4, color: 'bg-orange-500' },
      { name: 'Stationery & Favors', percentage: 3, color: 'bg-indigo-500' },
      { name: 'Transportation & Hotel', percentage: 4, color: 'bg-red-500' },
      { name: 'Miscellaneous', percentage: 3, color: 'bg-gray-500' }
    ]
  } else {
    return [
      { name: 'Venue & Catering', percentage: 40, color: 'bg-pink-500' },
      { name: 'Photography & Video', percentage: 15, color: 'bg-purple-500' },
      { name: 'Attire & Beauty', percentage: 10, color: 'bg-blue-500' },
      { name: 'Flowers & Decor', percentage: 10, color: 'bg-green-500' },
      { name: 'Music & Entertainment', percentage: 8, color: 'bg-yellow-500' },
      { name: 'Transportation', percentage: 5, color: 'bg-red-500' },
      { name: 'Stationery & Favors', percentage: 5, color: 'bg-indigo-500' },
      { name: 'Miscellaneous', percentage: 7, color: 'bg-gray-500' }
    ]
  }
}

const getDefaultMealCost = (currency: string): number => {
  switch (currency) {
    case 'ILS':
      return 365 // Average of 180-550 range
    case 'EUR':
      return 85
    default: // USD
      return 95
  }
}

const getDefaultBudgetItems = (currency: string, guestCount: number, mealCostPerPerson: number): BudgetItem[] => {
  if (currency === 'ILS') {
    return [
      {
        id: '1',
        category: 'Venue & Catering',
        item: 'Meals',
        estimatedCost: Math.round(mealCostPerPerson * guestCount),
        actualCost: 0,
        notes: `Per person meal cost: ${currency === 'ILS' ? '₪' : currency === 'EUR' ? '€' : '$'}${mealCostPerPerson}`
      },
      {
        id: '2',
        category: 'Venue & Catering',
        item: 'Alcohol',
        estimatedCost: Math.round(((25 + 65) / 2) * guestCount),
        actualCost: 0,
        notes: 'Per person alcohol cost (25-65 ₪)'
      },
      {
        id: '3',
        category: 'Photography & Video',
        item: 'Photographers (Stills + Video)',
        estimatedCost: Math.round((9750 + 17000) / 2),
        actualCost: 0,
        notes: 'Professional photography and videography (9,750-17,000 ₪)'
      },
      {
        id: '4',
        category: 'Attire & Beauty',
        item: 'Bridal Dress',
        estimatedCost: Math.round((3250 + 19500) / 2),
        actualCost: 0,
        notes: 'Wedding dress (3,250-19,500 ₪)'
      },
      {
        id: '5',
        category: 'Music & Entertainment',
        item: 'Wedding DJ',
        estimatedCost: Math.round((5850 + 11000) / 2),
        actualCost: 0,
        notes: 'DJ services (5,850-11,000 ₪)'
      }
    ]
  } else {
    const baseCosts = currency === 'EUR' ? 
      { venue: 7500, photo: 2800 } : 
      { venue: 8000, photo: 3000 }
    
    return [
      {
        id: '1',
        category: 'Venue',
        item: 'Wedding Venue',
        estimatedCost: baseCosts.venue,
        actualCost: 0,
        notes: 'Main ceremony and reception venue'
      },
      {
        id: '2',
        category: 'Catering',
        item: 'Food & Beverages',
        estimatedCost: Math.round(mealCostPerPerson * guestCount),
        actualCost: 0,
        notes: `Per person catering cost: ${currency === 'EUR' ? '€' : '$'}${mealCostPerPerson}`
      },
      {
        id: '3',
        category: 'Photography',
        item: 'Photographer',
        estimatedCost: baseCosts.photo,
        actualCost: 0,
        notes: 'Full day coverage'
      }
    ]
  }
}



const currencyOptions = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'ILS', label: 'ILS (₪)', symbol: '₪' }
]

export default function WeddingCalculator() {
  const { t } = useTranslation()
  const [totalBudget, setTotalBudget] = useState<number>(25000)
  const [guestCount, setGuestCount] = useState<number>(100)
  const [currency, setCurrency] = useState<string>('USD')
  const [mealCostPerPerson, setMealCostPerPerson] = useState<number>(95)
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])
  const [animateBudget, setAnimateBudget] = useState<number>(0)

  // Load calculator data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('wedding_app_calculator')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setTotalBudget(parsed.totalBudget || 25000)
        setGuestCount(parsed.guestCount || 100)
        setCurrency(parsed.currency || 'USD')
        setMealCostPerPerson(parsed.mealCostPerPerson || 95)
        setBudgetItems(parsed.budgetItems || [])
      } catch (error) {
        console.error('Error loading calculator data from localStorage:', error)
      }
    }
  }, [])

  // Save calculator data to localStorage whenever it changes
  useEffect(() => {
    const dataToSave = {
      totalBudget,
      guestCount,
      currency,
      mealCostPerPerson,
      budgetItems
    }
    localStorage.setItem('wedding_app_calculator', JSON.stringify(dataToSave))
  }, [totalBudget, guestCount, currency, mealCostPerPerson, budgetItems])

  const calculatedBudget = useMemo(() => {
    if (currency === 'ILS') {
      const services = wedding_services_2025.wedding_services_2025
      let totalCost = 0
      
      // Use user's meal cost input
      totalCost += mealCostPerPerson * guestCount
      
      // Add alcohol cost
      const alcoholCost = ((25 + 65) / 2) * guestCount
      totalCost += alcoholCost
      
      // Fixed costs from services
      const fixedServices = services.filter(service => !service.per_guest)
      fixedServices.forEach(service => {
        if ('price_fixed_nis' in service && service.price_fixed_nis) {
          totalCost += service.price_fixed_nis
        } else if ('price_range_nis' in service && service.price_range_nis) {
          const avgCost = (service.price_range_nis[0] + service.price_range_nis[1]) / 2
          totalCost += avgCost
        }
      })
      
      return Math.round(totalCost)
    } else {
      const baseBudget = totalBudget
      const guestMultiplier = guestCount / 100
      return Math.round(baseBudget * guestMultiplier)
    }
  }, [totalBudget, guestCount, currency, mealCostPerPerson])



  const totalEstimated = useMemo(() => {
    return budgetItems.reduce((sum, item) => sum + item.estimatedCost, 0)
  }, [budgetItems])

  const totalActual = useMemo(() => {
    return budgetItems.reduce((sum, item) => sum + item.actualCost, 0)
  }, [budgetItems])

  const addBudgetItem = () => {
    const newItem: BudgetItem = {
      id: Date.now().toString(),
      category: 'Miscellaneous',
      item: '',
      estimatedCost: 0,
      actualCost: 0,
      notes: ''
    }
    setBudgetItems(prev => [...prev, newItem])
  }

  const updateBudgetItem = (id: string, field: keyof BudgetItem, value: string | number) => {
    setBudgetItems(items =>
      items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const removeBudgetItem = (id: string) => {
    setBudgetItems(items => items.filter(item => item.id !== id))
  }

  const formatCurrency = (amount: number) => {
    const localeMap = {
      USD: 'en-US',
      EUR: 'en-EU',
      ILS: 'he-IL'
    }
    
    return new Intl.NumberFormat(localeMap[currency as keyof typeof localeMap] || 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateBudget(calculatedBudget)
    }, 100)
    return () => clearTimeout(timer)
  }, [calculatedBudget])

  // Update budget items when currency or meal cost changes
  useEffect(() => {
    setBudgetItems(getDefaultBudgetItems(currency, guestCount, mealCostPerPerson))
  }, [currency, guestCount, mealCostPerPerson])

  // Update meal cost when currency changes
  useEffect(() => {
    setMealCostPerPerson(getDefaultMealCost(currency))
  }, [currency])



  const budgetProgress = useMemo(() => {
    if (totalActual === 0) return 0
    return Math.min((totalActual / calculatedBudget) * 100, 100)
  }, [totalActual, calculatedBudget])

  const savingsAmount = useMemo(() => {
    return Math.max(calculatedBudget - totalActual, 0)
  }, [calculatedBudget, totalActual])

  const overBudgetAmount = useMemo(() => {
    return Math.max(totalActual - calculatedBudget, 0)
  }, [totalActual, calculatedBudget])



  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8 force-ltr">
      <div className="text-center space-y-4 force-ltr">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent text-content">
          {t('calculator.title')}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto text-content">
          {t('calculator.subtitle')}
        </p>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm force-ltr">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800 text-content">{t('calculator.budgetBreakdown')}</CardTitle>
          <CardDescription className="text-content">
            Key insights and breakdown for your wedding budget
          </CardDescription>
        </CardHeader>
        <CardContent className="force-ltr">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 force-ltr">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-800">
                <AnimatedCounter value={guestCount} className="text-2xl font-bold text-blue-800" />
              </div>
              <div className="text-sm text-blue-600">Guests</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-800">
                <AnimatedCounter 
                  value={currency === 'ILS' ? Math.round(calculatedBudget / guestCount) : Math.round(calculatedBudget / guestCount)} 
                  formatter={formatCurrency}
                  className="text-2xl font-bold text-green-800"
                />
              </div>
              <div className="text-sm text-green-600">Cost per Guest</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-800">
                <AnimatedCounter 
                  value={mealCostPerPerson} 
                  formatter={formatCurrency}
                  className="text-2xl font-bold text-purple-800"
                />
              </div>
              <div className="text-sm text-purple-600">Meal Cost/Guest</div>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-pink-800">
                100%
              </div>
              <div className="text-sm text-pink-600">Budget Allocated</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <Card className="bg-white/80 backdrop-blur-sm force-ltr">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800 text-content">{t('calculator.title')}</CardTitle>
            <CardDescription className="text-content">
              {t('calculator.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 force-ltr">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 force-ltr">
              <div className="space-y-2 force-ltr">
                <Label htmlFor="guests" className="text-content">{t('calculator.guestCount')}</Label>
                <Input
                  id="guests"
                  type="number"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  min="1"
                  max="1000"
                  placeholder="Enter number of guests"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  id="currency"
                  options={currencyOptions}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mealCost">Meal Cost per Person</Label>
              <Input
                id="mealCost"
                type="number"
                value={mealCostPerPerson}
                onChange={(e) => setMealCostPerPerson(Number(e.target.value))}
                min="0"
                placeholder={`Enter meal cost per person (${currency === 'ILS' ? '₪' : currency === 'EUR' ? '€' : '$'}${getDefaultMealCost(currency)})`}
              />
            </div>

            <div className="p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border-2 border-pink-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Estimated Total Budget</p>
                <p className="text-4xl font-bold text-gray-800 transition-all duration-500 mb-3">
                  <AnimatedCounter 
                    value={animateBudget} 
                    formatter={formatCurrency}
                    className="text-4xl font-bold text-gray-800"
                  />
                </p>
                <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
                  <div>
                    <div className="font-semibold text-gray-800">{formatCurrency(Math.round(calculatedBudget * 0.45))}</div>
                    <div>Venue & Catering</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{formatCurrency(Math.round(calculatedBudget * 0.15))}</div>
                    <div>Photography</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{formatCurrency(Math.round(calculatedBudget * 0.40))}</div>
                    <div>Other Services</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      <Card className="bg-white/80 backdrop-blur-sm force-ltr">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-800 text-content">💼 Budget Tracker</CardTitle>
          <CardDescription className="text-content">
            Track your actual expenses against estimates in real-time
          </CardDescription>
        </CardHeader>
          <CardContent className="space-y-6 force-ltr">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 force-ltr">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200 hover:shadow-lg transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-200 rounded-lg">
                    <span className="text-green-700 text-xl">💡</span>
                  </div>
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="text-sm font-medium text-green-600 mb-2">Estimated Total</div>
                <div className="text-2xl font-bold text-green-800 mb-1">
                  <AnimatedCounter 
                    value={totalEstimated} 
                    formatter={formatCurrency}
                    className="text-2xl font-bold text-green-800"
                  />
                </div>
                <div className="text-xs text-green-600">
                  {budgetItems.length} items tracked
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200 hover:shadow-lg transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <span className="text-blue-700 text-xl">💳</span>
                  </div>
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
                <div className="text-sm font-medium text-blue-600 mb-2">Actual Spent</div>
                <div className="text-2xl font-bold text-blue-800 mb-1">
                  <AnimatedCounter 
                    value={totalActual} 
                    formatter={formatCurrency}
                    className="text-2xl font-bold text-blue-800"
                  />
                </div>
                <div className="text-xs text-blue-600">
                  {budgetItems.filter(item => item.actualCost > 0).length} paid items
                </div>
              </div>
              
              <div className={`bg-gradient-to-br p-6 rounded-2xl border-2 hover:shadow-lg transition-all hover:scale-105 ${
                savingsAmount > 0 
                  ? 'from-emerald-50 to-emerald-100 border-emerald-200' 
                  : overBudgetAmount > 0 
                    ? 'from-red-50 to-red-100 border-red-200'
                    : 'from-gray-50 to-gray-100 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${
                    savingsAmount > 0 ? 'bg-emerald-200' : overBudgetAmount > 0 ? 'bg-red-200' : 'bg-gray-200'
                  }`}>
                    <span className={`text-xl ${
                      savingsAmount > 0 ? 'text-emerald-700' : overBudgetAmount > 0 ? 'text-red-700' : 'text-gray-700'
                    }`}>
                      {savingsAmount > 0 ? '💰' : overBudgetAmount > 0 ? '⚠️' : '⚖️'}
                    </span>
                  </div>
                  <div className={`w-4 h-4 rounded-full animate-pulse ${
                    savingsAmount > 0 ? 'bg-emerald-500' : overBudgetAmount > 0 ? 'bg-red-500' : 'bg-gray-500'
                  }`}></div>
                </div>
                <div className={`text-sm font-medium mb-2 ${
                  savingsAmount > 0 ? 'text-emerald-600' : overBudgetAmount > 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {savingsAmount > 0 ? 'Savings' : overBudgetAmount > 0 ? 'Over Budget' : 'Balance'}
                </div>
                <div className={`text-2xl font-bold mb-1 ${
                  savingsAmount > 0 ? 'text-emerald-800' : overBudgetAmount > 0 ? 'text-red-800' : 'text-gray-800'
                }`}>
                  <AnimatedCounter 
                    value={savingsAmount > 0 ? savingsAmount : overBudgetAmount > 0 ? overBudgetAmount : 0} 
                    formatter={formatCurrency}
                    className={`text-2xl font-bold ${
                      savingsAmount > 0 ? 'text-emerald-800' : overBudgetAmount > 0 ? 'text-red-800' : 'text-gray-800'
                    }`}
                  />
                </div>
                <div className={`text-xs ${
                  savingsAmount > 0 ? 'text-emerald-600' : overBudgetAmount > 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {budgetProgress.toFixed(1)}% used
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-200 hover:shadow-lg transition-all hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-200 rounded-lg">
                    <span className="text-purple-700 text-xl">📊</span>
                  </div>
                  <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
                <div className="text-sm font-medium text-purple-600 mb-2">Budget Progress</div>
                <div className="text-2xl font-bold text-purple-800 mb-2">
                  {Math.round(budgetProgress)}%
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-purple-600">
                  {formatCurrency(totalActual)} / {formatCurrency(calculatedBudget)}
                </div>
              </div>
            </div>
            
            {totalActual > 0 && (
              <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 p-6 rounded-2xl border-2 border-indigo-200">
                <div className="text-center mb-4">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    budgetProgress > 100 ? 'bg-red-100 text-red-800' : 
                    budgetProgress > 80 ? 'bg-amber-100 text-amber-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {budgetProgress > 100 ? '🚨 Over budget - consider adjustments' : 
                     budgetProgress > 80 ? '⚡ Approaching budget limit' : 
                     '✅ On track with your budget'}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 force-ltr">
              <Button
                onClick={addBudgetItem}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl font-medium text-content"
              >
                <span className="mr-2">➕</span>
                {t('calculator.addItem')}
              </Button>
            </div>

            <div className="grid gap-4 max-h-96 overflow-y-auto force-ltr">
              {budgetItems.map((item, index) => (
                <div key={item.id} className="group p-6 border-2 rounded-2xl bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-all duration-300 hover:border-purple-300 force-ltr">
                  <div className="flex justify-between items-start mb-4 force-ltr">
                    <div className="flex items-center space-x-3 force-ltr">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <Input
                          placeholder="Item name (e.g., Wedding Cake)"
                          value={item.item}
                          onChange={(e) => updateBudgetItem(item.id, 'item', e.target.value)}
                          className="font-medium text-lg border-0 bg-transparent p-0 focus:bg-white focus:border focus:p-2 rounded-lg transition-all"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => removeBudgetItem(item.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Category</Label>
                                             <Select
                         options={getBudgetCategories(currency).map(cat => ({ value: cat.name, label: cat.name }))}
                         value={item.category}
                         onChange={(e) => updateBudgetItem(item.id, 'category', e.target.value)}
                         className="mt-1"
                       />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Estimated</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={item.estimatedCost || ''}
                        onChange={(e) => updateBudgetItem(item.id, 'estimatedCost', Number(e.target.value))}
                        min="0"
                        className="mt-1 text-green-700 font-semibold"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Actual</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={item.actualCost || ''}
                        onChange={(e) => updateBudgetItem(item.id, 'actualCost', Number(e.target.value))}
                        min="0"
                        className="mt-1 text-blue-700 font-semibold"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Notes</Label>
                    <Input
                      placeholder="Add notes or details..."
                      value={item.notes}
                      onChange={(e) => updateBudgetItem(item.id, 'notes', e.target.value)}
                      className="mt-1 text-sm text-gray-600"
                    />
                  </div>
                  
                  {item.estimatedCost > 0 && item.actualCost > 0 && (
                    <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Variance:</span>
                        <span className={`font-semibold ${
                          item.actualCost > item.estimatedCost ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {item.actualCost > item.estimatedCost ? '+' : ''}{formatCurrency(item.actualCost - item.estimatedCost)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>



      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">💡 Smart Budget Tips</CardTitle>
          <CardDescription>
            Proven strategies to cut costs without sacrificing style
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <h4 className="font-semibold text-blue-800 mb-2">📅 Timing is Everything</h4>
              <p className="text-sm text-blue-700 mb-2">
                Save 20-40% by choosing off-peak dates
              </p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• Friday/Sunday vs Saturday</li>
                <li>• Winter months (Jan-Mar)</li>
                <li>• Avoid holidays & peak season</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
              <h4 className="font-semibold text-green-800 mb-2">🍽️ Food & Drinks</h4>
              <p className="text-sm text-green-700 mb-2">
                Biggest budget impact - optimize wisely
              </p>
              <ul className="text-xs text-green-600 space-y-1">
                <li>• Brunch/lunch vs dinner reception</li>
                <li>• Limited bar vs open bar</li>
                <li>• Buffet vs plated service</li>
              </ul>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
              <h4 className="font-semibold text-purple-800 mb-2">🎨 DIY & Decor</h4>
              <p className="text-sm text-purple-700 mb-2">
                Save 40-60% with creative alternatives
              </p>
              <ul className="text-xs text-purple-600 space-y-1">
                <li>• Digital invitations</li>
                <li>• Seasonal flowers</li>
                <li>• Handmade centerpieces</li>
              </ul>
            </div>
            
            <div className="p-4 bg-pink-50 rounded-lg border-l-4 border-pink-400">
              <h4 className="font-semibold text-pink-800 mb-2">📸 Photography</h4>
              <p className="text-sm text-pink-700 mb-2">
                Capture memories without breaking budget
              </p>
              <ul className="text-xs text-pink-600 space-y-1">
                <li>• Shorter coverage hours</li>
                <li>• Digital-only packages</li>
                <li>• Newer photographers</li>
              </ul>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
              <h4 className="font-semibold text-yellow-800 mb-2">🏛️ Venue Hacks</h4>
              <p className="text-sm text-yellow-700 mb-2">
                Find beautiful spaces for less
              </p>
              <ul className="text-xs text-yellow-600 space-y-1">
                <li>• Public parks & gardens</li>
                <li>• Museums & libraries</li>
                <li>• All-inclusive packages</li>
              </ul>
            </div>
            
            <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-400">
              <h4 className="font-semibold text-indigo-800 mb-2">👥 Guest List</h4>
              <p className="text-sm text-indigo-700 mb-2">
                Each guest = {currency === 'ILS' ? '₪500-850' : currency === 'EUR' ? '€140-230' : '$150-250'} total cost
              </p>
              <ul className="text-xs text-indigo-600 space-y-1">
                <li>• Adults-only celebration</li>
                <li>• Intimate ceremony + larger party</li>
                <li>• Plus-one guidelines</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}