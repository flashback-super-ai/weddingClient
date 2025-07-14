'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { motion, type Transition } from 'motion/react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/animate-ui/radix/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LiquidButton } from '@/components/animate-ui/buttons/liquid';
import { RippleButton } from '@/components/animate-ui/buttons/ripple';
import { ChecklistCategory } from '@/types/checklist';
import { getTranslatedCategories } from '@/initial data/translatedWeddingChecklistData';
import { useTranslation } from '@/hooks/useTranslation';

const getPathAnimate = (isChecked: boolean) => ({
  pathLength: isChecked ? 1 : 0,
  opacity: isChecked ? 1 : 0,
});

const getPathTransition = (isChecked: boolean): Transition => ({
  pathLength: { duration: 1, ease: 'easeInOut' },
  opacity: {
    duration: 0.01,
    delay: isChecked ? 0 : 1,
  },
});

function WeddingChecklist() {
  const { t } = useTranslation()
  const [categories, setCategories] = useState<ChecklistCategory[]>(() => getTranslatedCategories(t));
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newItemLabel, setNewItemLabel] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const toggleItem = useCallback((categoryId: string, itemId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? {
        ...cat,
        items: cat.items.map(item => 
          item.id === itemId ? { ...item, checked: !item.checked } : item
        )
      } : cat
    ));
  }, []);

  const addCategory = useCallback(() => {
    if (newCategoryName.trim()) {
      const newCategory: ChecklistCategory = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        items: [],
        isExpanded: true,
      };
      setCategories(prev => [newCategory, ...prev]);
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  }, [newCategoryName]);

  const addItem = useCallback((categoryId: string) => {
    if (newItemLabel.trim()) {
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? {
          ...cat,
          items: [...cat.items, {
            id: `${categoryId}-${Date.now()}`,
            label: newItemLabel.trim(),
            checked: false,
          }]
        } : cat
      ));
      setNewItemLabel('');
      setShowAddItem(null);
    }
  }, [newItemLabel]);

  const deleteCategory = useCallback((categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  }, []);

  const deleteItem = useCallback((categoryId: string, itemId: string) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId ? {
        ...cat,
        items: cat.items.filter(item => item.id !== itemId)
      } : cat
    ));
  }, []);

  const updateCategoryName = useCallback((categoryId: string) => {
    if (newCategoryName.trim()) {
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? { ...cat, name: newCategoryName.trim() } : cat
      ));
      setNewCategoryName('');
      setEditingCategory(null);
    }
  }, [newCategoryName]);

  const updateItemLabel = useCallback((categoryId: string, itemId: string) => {
    if (newItemLabel.trim()) {
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? {
          ...cat,
          items: cat.items.map(item => 
            item.id === itemId ? { ...item, label: newItemLabel.trim() } : item
          )
        } : cat
      ));
      setNewItemLabel('');
      setEditingItem(null);
    }
  }, [newItemLabel]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  }, []);

  const progress = useMemo(() => {
    const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
    const completedItems = categories.reduce((sum, cat) => 
      sum + cat.items.filter(item => item.checked).length, 0
    );
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  }, [categories]);

  const exportToExcel = useCallback(() => {
    setIsExporting(true);
    try {
      let csvContent = "Category,Task,Status\n";
      
      categories.forEach(category => {
        category.items.forEach(item => {
          csvContent += `"${category.name}","${item.label}","${item.checked ? 'Completed' : 'Pending'}"\n`;
        });
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', 'wedding_checklist.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting checklist:', error);
    } finally {
      setIsExporting(false);
    }
  }, [categories]);

  return (
    <div className="space-y-8 w-full h-full force-ltr">
      <div className="bg-white rounded-2xl p-6 shadow-lg w-[70%] mx-auto force-ltr">
        <div className="flex items-center justify-between mb-4 force-ltr">
          <h2 className="text-2xl font-bold text-gray-800 text-content">{t('checklist.progress')}</h2>
          <div className="flex items-center space-x-4 force-ltr">
            <RippleButton
              onClick={exportToExcel}
              variant="secondary"
              size="sm"
              disabled={isExporting}
              rippleColor="rgba(147, 51, 234, 0.3)"
              className="text-sm font-medium relative group"
            >
              <motion.div
                className="flex items-center gap-2"
                animate={isExporting ? {
                  opacity: [1, 0.7, 1],
                } : { opacity: 1 }}
                transition={{
                  duration: 1,
                  repeat: isExporting ? Infinity : 0,
                  ease: "linear"
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-transform group-hover:translate-y-0.5"
                >
                  <path d="M12 3v13" />
                  <path d="m9 13 3 3 3-3" />
                  <path d="M20 21H4" />
                  <path d="M4 12v9" />
                  <path d="M20 12v9" />
                </svg>
                {isExporting ? t('checklist.exporting') : t('checklist.exportList')}
              </motion.div>
            </RippleButton>
            <LiquidButton
              onClick={() => setShowAddCategory(true)}
              variant="default"
              size="sm"
              className="text-sm font-medium"
            >
              + {t('checklist.addCategory')}
            </LiquidButton>
            <div className="text-right">
              <div className="text-2xl font-bold text-pink-600">{progress}%</div>
              <div className="text-sm text-gray-600">{t('checklist.complete')}</div>
            </div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {showAddCategory && (
        <div className="bg-white rounded-xl p-4 shadow-lg force-ltr">
          <div className="flex items-center space-x-3 force-ltr">
            <Input
              placeholder={t('checklist.enterCategoryName')}
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, addCategory)}
              className="flex-1"
              autoFocus
            />
            <Button onClick={addCategory} className="text-content">{t('checklist.addCategory')}</Button>
            <Button variant="outline" onClick={() => setShowAddCategory(false)} className="text-content">{t('common.cancel')}</Button>
          </div>
        </div>
      )}

      <div className="w-full force-ltr">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 force-ltr">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl shadow-lg overflow-hidden min-h-[400px] max-h-[600px] force-ltr">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-purple-50 force-ltr">
                <div className="flex items-center space-x-3 force-ltr">
                  {editingCategory === category.id ? (
                    <div className="flex items-center space-x-2 force-ltr">
                      <Input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, () => updateCategoryName(category.id))}
                        className="w-40 text-sm"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => updateCategoryName(category.id)} className="text-content">Save</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)} className="text-content">Cancel</Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <h3 className="text-base font-semibold text-gray-800 text-content">{category.name}</h3>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddItem(category.id)}
                    className="text-xs px-3 py-1"
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingCategory(category.id);
                      setNewCategoryName(category.name);
                    }}
                    className="text-xs px-3 py-1"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteCategory(category.id)}
                    className="text-xs px-3 py-1"
                  >
                    Del
                  </Button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[500px] force-ltr">
                <div className="p-4 space-y-3 force-ltr">
                  {showAddItem === category.id && (
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg force-ltr">
                      <Input
                        placeholder={t('checklist.enterTaskName')}
                        value={newItemLabel}
                        onChange={(e) => setNewItemLabel(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, () => addItem(category.id))}
                        className="flex-1 text-sm"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => addItem(category.id)} className="text-xs px-3 py-1 text-content">{t('common.add')}</Button>
                      <Button size="sm" variant="outline" onClick={() => setShowAddItem(null)} className="text-xs px-3 py-1 text-content">{t('common.cancel')}</Button>
                    </div>
                  )}

                  {category.items.map((item, idx) => (
                    <div key={item.id} className="space-y-3 force-ltr">
                      <div className="flex items-center space-x-3 force-ltr">
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={() => toggleItem(category.id, item.id)}
                          id={`checkbox-${item.id}`}
                        />
                        <div className="relative flex-1 force-ltr">
                          {editingItem === item.id ? (
                            <div className="flex items-center space-x-2">
                              <Input
                                value={newItemLabel}
                                onChange={(e) => setNewItemLabel(e.target.value)}
                                onKeyPress={(e) => handleKeyPress(e, () => updateItemLabel(category.id, item.id))}
                                className="flex-1 text-sm"
                                autoFocus
                              />
                              <Button size="sm" onClick={() => updateItemLabel(category.id, item.id)} className="text-xs px-3 py-1">Save</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingItem(null)} className="text-xs px-3 py-1">Cancel</Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between force-ltr">
                              <div className="relative flex-1">
                                <Label htmlFor={`checkbox-${item.id}`} className="text-sm text-gray-700 cursor-pointer block text-content">
                                  {item.label}
                                </Label>
                                <motion.svg
                                  width="100%"
                                  height="16"
                                  viewBox="0 0 300 16"
                                  className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none z-20 w-full h-4"
                                >
                                  <motion.path
                                    d="M 5 8 s 30 -4 60 -4 c 20 0.02 -25 5.5 -15 7.5 c 8 2 50 -10 65 -6 c 12 3 -15 8 5 9 c 15 1 80 -8 120 -8 c 25 0 50 2 50 2"
                                    vectorEffect="non-scaling-stroke"
                                    strokeWidth={1.5}
                                    strokeLinecap="round"
                                    strokeMiterlimit={10}
                                    fill="none"
                                    initial={false}
                                    animate={getPathAnimate(item.checked)}
                                    transition={getPathTransition(item.checked)}
                                    className="stroke-pink-500"
                                  />
                                </motion.svg>
                              </div>
                              <div className="flex items-center space-x-1 ml-3 force-ltr">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingItem(item.id);
                                    setNewItemLabel(item.label);
                                  }}
                                  className="text-xs px-2 py-1 h-7 text-content"
                                >
                                  {t('common.edit')}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteItem(category.id, item.id)}
                                  className="text-xs px-2 py-1 h-7 text-content"
                                >
                                  {t('common.delete')}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {idx !== category.items.length - 1 && (
                        <div className="border-t border-gray-200" />
                      )}
                    </div>
                  ))}

                  {category.items.length === 0 && (
                    <div className="text-center text-gray-500 py-4 text-sm">
                      No tasks yet. Add your first task above!
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WeddingChecklist; 