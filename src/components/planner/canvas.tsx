'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ReactInfiniteCanvas, ReactInfiniteCanvasHandle } from 'react-infinite-canvas';
import { cn } from '@/lib/utils';
import Table, { TableType } from './tables';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ZoomIn, ZoomOut, Move, Square, Circle, RotateCcw, Save, Grid3X3, MousePointer, Music, Utensils, Camera, Users, Sparkles, MapPin, RotateCw, Copy, Trash2, AlignCenter, Download, Upload, FolderOpen, History, Check, X, Loader2 } from 'lucide-react';

interface CanvasElement {
  id: string;
  type: 'table' | 'stage' | 'dancefloor' | 'bar' | 'entrance' | 'photobooth' | 'dj' | 'giftTable';
  x: number;
  y: number;
  rotation?: number;
  width?: number;
  height?: number;
  data?: any;
}

interface SavedLayout {
  id: string;
  name: string;
  elements: CanvasElement[];
  timestamp: number;
  thumbnail?: string;
}

interface CanvasHistory {
  past: CanvasElement[][];
  present: CanvasElement[];
  future: CanvasElement[][];
}

interface WeddingCanvasProps {
  elements?: CanvasElement[];
  onElementsChange?: (elements: CanvasElement[]) => void;
  className?: string;
  gridSize?: number;
  snapToGrid?: boolean;
  autoSaveInterval?: number;
}

interface DragState {
  isDragging: boolean;
  elementId: string | null;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  dragType: 'move' | 'resize' | 'rotate';
  resizeHandle?: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
}

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

const WeddingCanvas: React.FC<WeddingCanvasProps> = ({
  elements = [],
  onElementsChange,
  className,
  gridSize = 50,
  snapToGrid = true,
  autoSaveInterval = 30000 // 30 seconds
}) => {
  const canvasRef = useRef<ReactInfiniteCanvasHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTool, setSelectedTool] = useState<'select' | 'table-round' | 'table-square' | 'table-rectangle' | 'stage' | 'dancefloor' | 'bar' | 'entrance' | 'photobooth' | 'dj' | 'giftTable' | 'move'>('select');
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [showGrid, setShowGrid] = useState(true);
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>(elements);
  const [currentGridSize, setCurrentGridSize] = useState(gridSize);
  const [isSnapEnabled, setIsSnapEnabled] = useState(snapToGrid);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    elementId: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    dragType: 'move'
  });
  const [clipboard, setClipboard] = useState<CanvasElement[]>([]);
  const [savedLayouts, setSavedLayouts] = useState<SavedLayout[]>([]);
  const [currentLayoutName, setCurrentLayoutName] = useState<string>('Untitled Layout');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [history, setHistory] = useState<CanvasHistory>({
    past: [],
    present: elements,
    future: []
  });
  const [lastSaveTime, setLastSaveTime] = useState<number>(Date.now());
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [loadingOperation, setLoadingOperation] = useState<string>('');

  // Local storage keys
  const STORAGE_KEYS = {
    LAYOUTS: 'wedding-canvas-layouts',
    CURRENT_LAYOUT: 'wedding-canvas-current',
    AUTO_SAVE: 'wedding-canvas-autosave',
    SETTINGS: 'wedding-canvas-settings'
  };

  // Toast notification system
  const showToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const id = `toast-${Date.now()}`;
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 3000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Load saved data on component mount
  useEffect(() => {
    loadFromLocalStorage();
    loadSettings();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (!isAutoSaveEnabled) return;

    const interval = setInterval(() => {
      autoSaveLayout();
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [canvasElements, isAutoSaveEnabled, autoSaveInterval]);

  // Save to history for undo/redo
  const saveToHistory = useCallback((newElements: CanvasElement[]) => {
    setHistory(prev => ({
      past: [...prev.past, prev.present].slice(-50), // Keep last 50 states
      present: newElements,
      future: []
    }));
  }, []);

  const handleElementsUpdate = useCallback((newElements: CanvasElement[]) => {
    saveToHistory(canvasElements);
    setCanvasElements(newElements);
    onElementsChange?.(newElements);
  }, [onElementsChange, canvasElements, saveToHistory]);

  // Undo/Redo functionality
  const handleUndo = useCallback(() => {
    if (history.past.length === 0) return;

    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, history.past.length - 1);

    setHistory({
      past: newPast,
      present: previous,
      future: [history.present, ...history.future]
    });

    setCanvasElements(previous);
    onElementsChange?.(previous);
    
    showToast({
      type: 'info',
      title: 'Undone',
      message: 'Last action has been undone',
      duration: 2000
    });
  }, [history, onElementsChange, showToast]);

  const handleRedo = useCallback(() => {
    if (history.future.length === 0) return;

    const next = history.future[0];
    const newFuture = history.future.slice(1);

    setHistory({
      past: [...history.past, history.present],
      present: next,
      future: newFuture
    });

    setCanvasElements(next);
    onElementsChange?.(next);
    
    showToast({
      type: 'info',
      title: 'Redone',
      message: 'Action has been redone',
      duration: 2000
    });
  }, [history, onElementsChange, showToast]);

  // Local storage functions
  const saveToLocalStorage = useCallback((layouts: SavedLayout[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.LAYOUTS, JSON.stringify(layouts));
    } catch (error) {
      console.error('Failed to save layouts to localStorage:', error);
    }
  }, []);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedLayoutsData = localStorage.getItem(STORAGE_KEYS.LAYOUTS);
      if (savedLayoutsData) {
        const layouts = JSON.parse(savedLayoutsData);
        setSavedLayouts(layouts);
      }

      const autoSaveData = localStorage.getItem(STORAGE_KEYS.AUTO_SAVE);
      if (autoSaveData && canvasElements.length === 0) {
        const autoSave = JSON.parse(autoSaveData);
        setCanvasElements(autoSave.elements);
        setCurrentLayoutName(autoSave.name);
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  }, [canvasElements.length]);

  const saveSettings = useCallback(() => {
    try {
      const settings = {
        gridSize: currentGridSize,
        snapToGrid: isSnapEnabled,
        showGrid,
        autoSaveEnabled: isAutoSaveEnabled
      };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [currentGridSize, isSnapEnabled, showGrid, isAutoSaveEnabled]);

  const loadSettings = useCallback(() => {
    try {
      const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (settingsData) {
        const settings = JSON.parse(settingsData);
        setCurrentGridSize(settings.gridSize || 50);
        setIsSnapEnabled(settings.snapToGrid ?? true);
        setShowGrid(settings.showGrid ?? true);
        setIsAutoSaveEnabled(settings.autoSaveEnabled ?? true);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  // Auto-save current layout
  const autoSaveLayout = useCallback(() => {
    if (canvasElements.length === 0) return;

    try {
      const autoSave = {
        name: currentLayoutName,
        elements: canvasElements,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEYS.AUTO_SAVE, JSON.stringify(autoSave));
      setLastSaveTime(Date.now());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [canvasElements, currentLayoutName]);

  // Enhanced save layout with loading state
  const handleSaveLayout = useCallback(async (name?: string) => {
    setIsLoading(true);
    setLoadingOperation('Saving layout...');
    
    try {
      const layoutName = name || currentLayoutName;
      const newLayout: SavedLayout = {
        id: `layout-${Date.now()}`,
        name: layoutName,
        elements: canvasElements,
        timestamp: Date.now()
      };

      // Simulate async operation for UX
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedLayouts = [...savedLayouts, newLayout];
      setSavedLayouts(updatedLayouts);
      saveToLocalStorage(updatedLayouts);
      setCurrentLayoutName(layoutName);
      setShowSaveDialog(false);
      
      showToast({
        type: 'success',
        title: 'Layout Saved',
        message: `"${layoutName}" has been saved successfully`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save layout. Please try again.'
      });
    } finally {
      setIsLoading(false);
      setLoadingOperation('');
    }
  }, [canvasElements, currentLayoutName, savedLayouts, saveToLocalStorage, showToast]);

  // Enhanced load layout with loading state
  const handleLoadLayout = useCallback(async (layout: SavedLayout) => {
    setIsLoading(true);
    setLoadingOperation('Loading layout...');
    
    try {
      // Simulate async operation for UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      saveToHistory(canvasElements);
      setCanvasElements(layout.elements);
      setCurrentLayoutName(layout.name);
      setSelectedElements([]);
      setShowLoadDialog(false);
      onElementsChange?.(layout.elements);
      
      showToast({
        type: 'success',
        title: 'Layout Loaded',
        message: `"${layout.name}" has been loaded successfully`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Load Failed',
        message: 'Failed to load layout. Please try again.'
      });
    } finally {
      setIsLoading(false);
      setLoadingOperation('');
    }
  }, [canvasElements, saveToHistory, onElementsChange, showToast]);

  // Delete saved layout
  const handleDeleteLayout = useCallback((layoutId: string) => {
    const updatedLayouts = savedLayouts.filter(layout => layout.id !== layoutId);
    setSavedLayouts(updatedLayouts);
    saveToLocalStorage(updatedLayouts);
  }, [savedLayouts, saveToLocalStorage]);

  // Enhanced export with loading state
  const handleExportLayout = useCallback(async () => {
    setIsLoading(true);
    setLoadingOperation('Exporting layout...');
    
    try {
      const exportData = {
        name: currentLayoutName,
        elements: canvasElements,
        timestamp: Date.now(),
        version: '1.0'
      };

      // Simulate async operation for UX
      await new Promise(resolve => setTimeout(resolve, 200));

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentLayoutName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast({
        type: 'success',
        title: 'Export Complete',
        message: `Layout exported as "${link.download}"`
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export layout. Please try again.'
      });
    } finally {
      setIsLoading(false);
      setLoadingOperation('');
    }
  }, [canvasElements, currentLayoutName, showToast]);

  // Enhanced import with better UX
  const handleImportLayout = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setLoadingOperation('Importing layout...');

    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (importData.elements && Array.isArray(importData.elements)) {
        saveToHistory(canvasElements);
        setCanvasElements(importData.elements);
        setCurrentLayoutName(importData.name || 'Imported Layout');
        setSelectedElements([]);
        onElementsChange?.(importData.elements);
        
        showToast({
          type: 'success',
          title: 'Import Complete',
          message: `Imported "${importData.name || 'layout'}" with ${importData.elements.length} elements`
        });
      } else {
        throw new Error('Invalid file format');
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Import Failed',
        message: 'Invalid file format. Please select a valid layout file.'
      });
    } finally {
      setIsLoading(false);
      setLoadingOperation('');
    }
    
    event.target.value = '';
  }, [canvasElements, saveToHistory, onElementsChange, showToast]);

  // Clear canvas
  const handleClearCanvas = useCallback(() => {
    if (canvasElements.length === 0) return;
    
    if (confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
      saveToHistory(canvasElements);
      setCanvasElements([]);
      setSelectedElements([]);
      setCurrentLayoutName('Untitled Layout');
      onElementsChange?.([]);
    }
  }, [canvasElements, saveToHistory, onElementsChange]);

  // Enhanced delete with confirmation
  const handleDeleteSelected = useCallback(() => {
    if (selectedElements.length === 0) return;
    
    const elementCount = selectedElements.length;
    const confirmMessage = elementCount === 1 
      ? 'Are you sure you want to delete this element?'
      : `Are you sure you want to delete ${elementCount} elements?`;
    
    if (confirm(confirmMessage)) {
      const newElements = canvasElements.filter(el => !selectedElements.includes(el.id));
      handleElementsUpdate(newElements);
      setSelectedElements([]);
      
      showToast({
        type: 'success',
        title: 'Elements Deleted',
        message: `${elementCount} element${elementCount > 1 ? 's' : ''} deleted`
      });
    }
  }, [selectedElements, canvasElements, handleElementsUpdate, showToast]);

  // Keyboard shortcuts for save/load
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            setShowSaveDialog(true);
            break;
          case 'o':
            event.preventDefault();
            setShowLoadDialog(true);
            break;
          case 'e':
            event.preventDefault();
            handleExportLayout();
            break;
          case 'z':
            if (event.shiftKey) {
              event.preventDefault();
              handleRedo();
            } else {
              event.preventDefault();
              handleUndo();
            }
            break;
          case 'y':
            event.preventDefault();
            handleRedo();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleExportLayout, handleUndo, handleRedo]);

  // Save settings when they change
  useEffect(() => {
    saveSettings();
  }, [saveSettings]);

  // Format timestamp for display
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get time since last save
  const getTimeSinceLastSave = () => {
    const seconds = Math.floor((Date.now() - lastSaveTime) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const snapToGridPosition = useCallback((x: number, y: number) => {
    if (!isSnapEnabled) return { x, y };
    return {
      x: Math.round(x / currentGridSize) * currentGridSize,
      y: Math.round(y / currentGridSize) * currentGridSize
    };
  }, [currentGridSize, isSnapEnabled]);

  const getElementBounds = (element: CanvasElement) => {
    if (element.type === 'table') {
      // Use table component bounds
      const seats = element.data?.seats || 8;
      const baseSize = Math.max(120, Math.min(200, 80 + seats * 8));
      return {
        width: element.data?.type === 'rectangle' ? baseSize * 1.4 : baseSize,
        height: element.data?.type === 'rectangle' ? baseSize * 0.8 : baseSize
      };
    }
    return {
      width: element.width || element.data?.width || 100,
      height: element.height || element.data?.height || 100
    };
  };

  const handleCopySelected = () => {
    const elementsToCopy = canvasElements.filter(el => selectedElements.includes(el.id));
    setClipboard(elementsToCopy);
  };

  const handlePasteSelected = () => {
    if (clipboard.length > 0) {
      const pastedElements = clipboard.map(el => ({
        ...el,
        id: `${el.type}-${Date.now()}-${Math.random()}`,
        x: el.x + 50,
        y: el.y + 50,
        data: {
          ...el.data,
          tableNumber: el.type === 'table' 
            ? canvasElements.filter(elem => elem.type === 'table').length + 1
            : el.data?.tableNumber,
          tableName: el.type === 'table'
            ? `Table ${canvasElements.filter(elem => elem.type === 'table').length + 1}`
            : el.data?.tableName
        }
      }));
      
      handleElementsUpdate([...canvasElements, ...pastedElements]);
      setSelectedElements(pastedElements.map(el => el.id));
      
      showToast({
        type: 'success',
        title: 'Elements Pasted',
        message: `${pastedElements.length} element${pastedElements.length > 1 ? 's' : ''} pasted`
      });
    }
  };

  const handleDuplicateSelected = () => {
    if (selectedElements.length > 0) {
      const elementsToDuplicate = canvasElements.filter(el => selectedElements.includes(el.id));
      const duplicatedElements = elementsToDuplicate.map(el => ({
        ...el,
        id: `${el.type}-${Date.now()}-${Math.random()}`,
        x: el.x + 50,
        y: el.y + 50,
        data: {
          ...el.data,
          tableNumber: el.type === 'table' 
            ? canvasElements.filter(elem => elem.type === 'table').length + elementsToDuplicate.filter(dup => dup.type === 'table').length + 1
            : el.data?.tableNumber,
          tableName: el.type === 'table'
            ? `Table ${canvasElements.filter(elem => elem.type === 'table').length + elementsToDuplicate.filter(dup => dup.type === 'table').length + 1}`
            : el.data?.tableName
        }
      }));
      
      handleElementsUpdate([...canvasElements, ...duplicatedElements]);
      setSelectedElements(duplicatedElements.map(el => el.id));
      
      showToast({
        type: 'success',
        title: 'Elements Duplicated',
        message: `${duplicatedElements.length} element${duplicatedElements.length > 1 ? 's' : ''} duplicated`
      });
    }
  };

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
        return;
      }

      switch (event.key) {
        case 'Delete':
        case 'Backspace':
          handleDeleteSelected();
          break;
        case 'c':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleCopySelected();
          }
          break;
        case 'v':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handlePasteSelected();
          }
          break;
        case 'd':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            handleDuplicateSelected();
          }
          break;
        case 'a':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            setSelectedElements(canvasElements.map(el => el.id));
          }
          break;
        case 'Escape':
          setSelectedElements([]);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canvasElements, selectedElements, handleDeleteSelected, handleCopySelected, handlePasteSelected, handleDuplicateSelected]);

  const handleCanvasClick = (event: React.MouseEvent) => {
    if ((selectedTool.startsWith('table-') || ['stage', 'dancefloor', 'bar', 'entrance', 'photobooth', 'dj', 'giftTable'].includes(selectedTool)) && !dragState.isDragging) {
      const rect = event.currentTarget.getBoundingClientRect();
      const rawX = event.clientX - rect.left;
      const rawY = event.clientY - rect.top;
      
      const { x, y } = snapToGridPosition(rawX, rawY);
      
      let newElement: CanvasElement;
      
      if (selectedTool.startsWith('table-')) {
        const tableType = selectedTool.replace('table-', '') as TableType;
        newElement = {
          id: `table-${Date.now()}`,
          type: 'table',
          x,
          y,
          data: {
            type: tableType,
            seats: 8,
            guests: [],
            tableNumber: canvasElements.filter(el => el.type === 'table').length + 1,
            tableName: `Table ${canvasElements.filter(el => el.type === 'table').length + 1}`
          }
        };
      } else {
        const elementData = getElementData(selectedTool);
        newElement = {
          id: `${selectedTool}-${Date.now()}`,
          type: selectedTool as any,
          x,
          y,
          width: elementData.width,
          height: elementData.height,
          rotation: 0,
          data: elementData
        };
      }
      
      handleElementsUpdate([...canvasElements, newElement]);
      setSelectedTool('select');
    } else if (selectedTool === 'select') {
      if (!event.ctrlKey && !event.metaKey) {
        setSelectedElements([]);
      }
    }
  };

  const getElementData = (type: string) => {
    switch (type) {
      case 'stage':
        return { width: 200, height: 100, label: 'Stage/Altar' };
      case 'dancefloor':
        return { width: 150, height: 150, label: 'Dance Floor' };
      case 'bar':
        return { width: 120, height: 60, label: 'Bar Station' };
      case 'entrance':
        return { width: 80, height: 40, label: 'Entrance' };
      case 'photobooth':
        return { width: 100, height: 100, label: 'Photo Booth' };
      case 'dj':
        return { width: 80, height: 80, label: 'DJ/Band' };
      case 'giftTable':
        return { width: 120, height: 60, label: 'Gift Table' };
      default:
        return { width: 100, height: 100 };
    }
  };

  // Handle drag and drop from toolbar
  const handleCanvasDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    
    try {
      const dropData = JSON.parse(event.dataTransfer.getData('application/json'));
      
      if (dropData.source === 'toolbar') {
        const canvasRect = event.currentTarget.getBoundingClientRect();
        const rawX = event.clientX - canvasRect.left;
        const rawY = event.clientY - canvasRect.top;
        
        const { x, y } = snapToGridPosition(rawX, rawY);
        
        let newElement: CanvasElement;
        
        if (dropData.tool.startsWith('table-')) {
          const tableType = dropData.tool.replace('table-', '') as TableType;
          newElement = {
            id: `table-${Date.now()}`,
            type: 'table',
            x,
            y,
            data: {
              type: tableType,
              seats: 8,
              guests: [],
              tableNumber: canvasElements.filter(el => el.type === 'table').length + 1,
              tableName: `Table ${canvasElements.filter(el => el.type === 'table').length + 1}`
            }
          };
        } else {
          const elementData = getElementData(dropData.tool);
          newElement = {
            id: `${dropData.tool}-${Date.now()}`,
            type: dropData.tool as any,
            x,
            y,
            width: elementData.width,
            height: elementData.height,
            rotation: 0,
            data: elementData
          };
        }
        
        handleElementsUpdate([...canvasElements, newElement]);
        
        showToast({
          type: 'success',
          title: 'Element Added',
          message: `${dropData.label} has been added to the canvas`,
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  }, [canvasElements, snapToGridPosition, getElementData, handleElementsUpdate, showToast]);

  const handleCanvasDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  }, []);

  // Drag handlers for toolbar items
  const handleToolbarDragStart = useCallback((event: React.DragEvent, tool: string, label: string) => {
    const dragData = {
      source: 'toolbar',
      tool,
      label
    };
    
    event.dataTransfer.setData('application/json', JSON.stringify(dragData));
    event.dataTransfer.effectAllowed = 'copy';
    
    showToast({
      type: 'info',
      title: 'Drag to Canvas',
      message: `Drag ${label} to the canvas to add it`,
      duration: 2000
    });
  }, [showToast]);

  const handleElementClick = (elementId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    if (event?.ctrlKey || event?.metaKey) {
      // Multi-select
      setSelectedElements(prev => 
        prev.includes(elementId) 
          ? prev.filter(id => id !== elementId)
          : [...prev, elementId]
      );
    } else {
      setSelectedElements([elementId]);
    }
  };

  const handleElementMouseDown = (elementId: string, event: React.MouseEvent, dragType: 'move' | 'resize' | 'rotate' = 'move', resizeHandle?: string) => {
    if (selectedTool !== 'select') return;
    
    event.stopPropagation();
    event.preventDefault();
    
    const element = canvasElements.find(el => el.id === elementId);
    if (!element) return;

    const startX = event.clientX;
    const startY = event.clientY;
    
    setDragState({
      isDragging: true,
      elementId,
      startX,
      startY,
      offsetX: startX - element.x,
      offsetY: startY - element.y,
      dragType,
      resizeHandle: resizeHandle as any
    });
    
    if (!selectedElements.includes(elementId)) {
      setSelectedElements([elementId]);
    }
  };

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!dragState.isDragging || !dragState.elementId) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    if (dragState.dragType === 'move') {
      const newX = event.clientX - dragState.offsetX;
      const newY = event.clientY - dragState.offsetY;
      const { x, y } = snapToGridPosition(newX, newY);

      setCanvasElements(prev => 
        prev.map(el => 
          selectedElements.includes(el.id)
            ? { ...el, x: el.id === dragState.elementId ? x : el.x + deltaX, y: el.id === dragState.elementId ? y : el.y + deltaY }
            : el
        )
      );
    } else if (dragState.dragType === 'resize') {
      const element = canvasElements.find(el => el.id === dragState.elementId);
      if (!element) return;

      const bounds = getElementBounds(element);
      let newWidth = bounds.width;
      let newHeight = bounds.height;
      let newX = element.x;
      let newY = element.y;

      switch (dragState.resizeHandle) {
        case 'se':
          newWidth = Math.max(40, bounds.width + deltaX);
          newHeight = Math.max(40, bounds.height + deltaY);
          break;
        case 'sw':
          newWidth = Math.max(40, bounds.width - deltaX);
          newHeight = Math.max(40, bounds.height + deltaY);
          newX = element.x + deltaX;
          break;
        case 'ne':
          newWidth = Math.max(40, bounds.width + deltaX);
          newHeight = Math.max(40, bounds.height - deltaY);
          newY = element.y + deltaY;
          break;
        case 'nw':
          newWidth = Math.max(40, bounds.width - deltaX);
          newHeight = Math.max(40, bounds.height - deltaY);
          newX = element.x + deltaX;
          newY = element.y + deltaY;
          break;
      }

      setCanvasElements(prev =>
        prev.map(el =>
          el.id === dragState.elementId
            ? { ...el, x: newX, y: newY, width: newWidth, height: newHeight, data: { ...el.data, width: newWidth, height: newHeight } }
            : el
        )
      );
    } else if (dragState.dragType === 'rotate') {
      const element = canvasElements.find(el => el.id === dragState.elementId);
      if (!element) return;

      const bounds = getElementBounds(element);
      const centerX = element.x + bounds.width / 2;
      const centerY = element.y + bounds.height / 2;
      
      const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
      const rotation = (angle * 180) / Math.PI;

      setCanvasElements(prev =>
        prev.map(el =>
          el.id === dragState.elementId
            ? { ...el, rotation }
            : el
        )
      );
    }
  }, [dragState, snapToGridPosition, selectedElements, canvasElements]);

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging) {
      setDragState({
        isDragging: false,
        elementId: null,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0,
        dragType: 'move'
      });
      
      onElementsChange?.(canvasElements);
    }
  }, [dragState.isDragging, canvasElements, onElementsChange]);

  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  const renderSelectionHandles = (element: CanvasElement) => {
    if (!selectedElements.includes(element.id)) return null;

    const bounds = getElementBounds(element);
    const handleSize = 8;

    return (
      <>
        {/* Resize Handles */}
        {element.type !== 'table' && (
          <>
            {/* Corner handles */}
            <div
              className="absolute bg-primary border-2 border-white rounded-sm cursor-nw-resize"
              style={{
                width: handleSize,
                height: handleSize,
                left: -handleSize / 2,
                top: -handleSize / 2
              }}
              onMouseDown={(e) => handleElementMouseDown(element.id, e, 'resize', 'nw')}
            />
            <div
              className="absolute bg-primary border-2 border-white rounded-sm cursor-ne-resize"
              style={{
                width: handleSize,
                height: handleSize,
                right: -handleSize / 2,
                top: -handleSize / 2
              }}
              onMouseDown={(e) => handleElementMouseDown(element.id, e, 'resize', 'ne')}
            />
            <div
              className="absolute bg-primary border-2 border-white rounded-sm cursor-sw-resize"
              style={{
                width: handleSize,
                height: handleSize,
                left: -handleSize / 2,
                bottom: -handleSize / 2
              }}
              onMouseDown={(e) => handleElementMouseDown(element.id, e, 'resize', 'sw')}
            />
            <div
              className="absolute bg-primary border-2 border-white rounded-sm cursor-se-resize"
              style={{
                width: handleSize,
                height: handleSize,
                right: -handleSize / 2,
                bottom: -handleSize / 2
              }}
              onMouseDown={(e) => handleElementMouseDown(element.id, e, 'resize', 'se')}
            />
          </>
        )}

        {/* Rotation Handle */}
        <div
          className="absolute bg-blue-500 border-2 border-white rounded-full cursor-crosshair flex items-center justify-center"
          style={{
            width: 20,
            height: 20,
            left: bounds.width / 2 - 10,
            top: -30
          }}
          onMouseDown={(e) => handleElementMouseDown(element.id, e, 'rotate')}
          title="Rotate"
        >
          <RotateCw className="h-3 w-3 text-white" />
        </div>

        {/* Connection line to rotation handle */}
        <div
          className="absolute border-l border-dashed border-blue-500"
          style={{
            left: bounds.width / 2,
            top: -30,
            height: 20
          }}
        />
      </>
    );
  };

  const renderWeddingElement = (element: CanvasElement) => {
    if (element.type === 'table') {
      return (
        <Table
          id={element.id}
          type={element.data.type}
          seats={element.data.seats}
          guests={element.data.guests}
          tableNumber={element.data.tableNumber}
          tableName={element.data.tableName}
          isSelected={selectedElements.includes(element.id)}
          onTableClick={() => handleElementClick(element.id)}
        />
      );
    }

    // Render other wedding elements
    const { width = 100, height = 100, label = '' } = element.data || {};
    
    const getElementStyle = (type: string) => {
      switch (type) {
        case 'stage':
          return 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300';
        case 'dancefloor':
          return 'bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300';
        case 'bar':
          return 'bg-gradient-to-br from-orange-100 to-orange-200 border-orange-300';
        case 'entrance':
          return 'bg-gradient-to-br from-green-100 to-green-200 border-green-300';
        case 'photobooth':
          return 'bg-gradient-to-br from-pink-100 to-pink-200 border-pink-300';
        case 'dj':
          return 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300';
        case 'giftTable':
          return 'bg-gradient-to-br from-red-100 to-red-200 border-red-300';
        default:
          return 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300';
      }
    };

    const getElementIcon = (type: string) => {
      switch (type) {
        case 'stage':
          return <Sparkles className="h-5 w-5" />;
        case 'dancefloor':
          return <Music className="h-5 w-5" />;
        case 'bar':
          return <Utensils className="h-5 w-5" />;
        case 'entrance':
          return <MapPin className="h-5 w-5" />;
        case 'photobooth':
          return <Camera className="h-5 w-5" />;
        case 'dj':
          return <Music className="h-5 w-5" />;
        case 'giftTable':
          return <Users className="h-5 w-5" />;
        default:
          return null;
      }
    };

    return (
      <div
        className={cn(
          "border-2 rounded-lg shadow-lg flex flex-col items-center justify-center text-center p-2",
          getElementStyle(element.type),
          selectedElements.includes(element.id) 
            ? "border-primary shadow-xl scale-105" 
            : "group-hover:border-gray-400 group-hover:shadow-xl"
        )}
        style={{ width, height }}
      >
        <div className="text-gray-700 mb-1">
          {getElementIcon(element.type)}
        </div>
        <div className="text-xs font-medium text-gray-700">
          {label}
        </div>
      </div>
    );
  };

  const handleGridSizeChange = (newSize: number) => {
    setCurrentGridSize(newSize);
  };

  const toggleSnapToGrid = () => {
    setIsSnapEnabled(!isSnapEnabled);
  };

  const handleSave = () => {
    console.log('Saving canvas state:', canvasElements);
  };

  const handleZoomIn = () => {
    console.log('Zoom in - handled by canvas');
  };

  const handleZoomOut = () => {
    console.log('Zoom out - handled by canvas');
  };

  const handleFitToView = () => {
    canvasRef.current?.fitContentToView({ scale: 1 });
  };

  const handleResetCanvas = () => {
    canvasRef.current?.fitContentToView({ scale: 1 });
  };

  const handleCanvasMount = (handle: ReactInfiniteCanvasHandle) => {
    console.log('Canvas mounted');
  };

  // Toast component
  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Card
          key={toast.id}
          className={cn(
            "p-4 min-w-80 shadow-lg border-l-4 animate-in slide-in-from-right-full duration-300",
            toast.type === 'success' && "border-l-green-500 bg-green-50 text-green-900",
            toast.type === 'error' && "border-l-red-500 bg-red-50 text-red-900",
            toast.type === 'info' && "border-l-blue-500 bg-blue-50 text-blue-900"
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {toast.type === 'success' && (
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              )}
              {toast.type === 'error' && (
                <X className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              )}
              {toast.type === 'info' && (
                <ZoomIn className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <div className="font-medium text-sm">{toast.title}</div>
                {toast.message && (
                  <div className="text-xs mt-1 opacity-80">{toast.message}</div>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-60 hover:opacity-100"
              onClick={() => dismissToast(toast.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );

  // Loading overlay component
  const LoadingOverlay = () => (
    isLoading && (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center">
        <Card className="p-6 shadow-xl">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <div>
              <div className="font-medium">Processing...</div>
              <div className="text-sm text-muted-foreground">{loadingOperation}</div>
            </div>
          </div>
        </Card>
      </div>
    )
  );

  return (
    <div className={cn("flex h-full bg-background", className)}>
      {/* Toast notifications */}
      <ToastContainer />
      
      {/* Loading overlay */}
      <LoadingOverlay />

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportLayout}
        accept=".json"
        style={{ display: 'none' }}
      />

      {/* Enhanced Tools Panel */}
      <Card className="w-20 flex flex-col items-center gap-1 p-2 m-2 shadow-lg max-h-[calc(100vh-2rem)] overflow-y-auto backdrop-blur-sm bg-background/95 border-border/50">
        <Button
          variant={selectedTool === 'select' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setSelectedTool('select')}
          className={cn(
            "w-16 h-12 text-xs flex flex-col gap-1 transition-all duration-200",
            selectedTool === 'select' && "shadow-md scale-105"
          )}
          title="Select & Drag"
        >
          <MousePointer className="h-4 w-4" />
          <span className="text-xs">Select</span>
        </Button>
        
        <Button
          variant={selectedTool === 'move' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setSelectedTool('move')}
          className={cn(
            "w-16 h-12 text-xs flex flex-col gap-1 transition-all duration-200",
            selectedTool === 'move' && "shadow-md scale-105"
          )}
          title="Pan Canvas"
        >
          <Move className="h-4 w-4" />
          <span className="text-xs">Pan</span>
        </Button>
        
        <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent my-2" />
        
        {/* Tables Section with enhanced styling */}
        <div className="text-xs font-medium text-muted-foreground mb-1 bg-muted/50 px-2 py-1 rounded">Tables</div>
        
        {/* Enhanced buttons with animations and better visual feedback */}
        {[
          { tool: 'table-round', icon: Circle, label: 'Round', title: 'Add Round Table' },
          { tool: 'table-square', icon: Square, label: 'Square', title: 'Add Square Table' },
          { tool: 'table-rectangle', icon: () => <div className="w-4 h-2 border border-current rounded-sm" />, label: 'Rect', title: 'Add Rectangle Table' }
        ].map(({ tool, icon: Icon, label, title }) => (
          <Button
            key={tool}
            variant={selectedTool === tool ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setSelectedTool(tool as any)}
            draggable
            onDragStart={(e) => handleToolbarDragStart(e, tool, label)}
            className={cn(
              "w-16 h-12 text-xs flex flex-col gap-1 transition-all duration-200 hover:scale-105 cursor-pointer",
              selectedTool === tool && "shadow-md scale-105 bg-primary text-primary-foreground"
            )}
            title={`${title} (Click to select or drag to canvas)`}
          >
            <Icon className="h-4 w-4" />
            <span className="text-xs">{label}</span>
          </Button>
        ))}
        
        <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent my-2" />
        
        {/* Venue Elements with enhanced styling */}
        <div className="text-xs font-medium text-muted-foreground mb-1 bg-muted/50 px-2 py-1 rounded">Venue</div>
        
        {[
          { tool: 'stage', icon: Sparkles, label: 'Stage', title: 'Add Stage/Altar' },
          { tool: 'dancefloor', icon: Music, label: 'Dance', title: 'Add Dance Floor' },
          { tool: 'bar', icon: Utensils, label: 'Bar', title: 'Add Bar Station' },
          { tool: 'photobooth', icon: Camera, label: 'Photo', title: 'Add Photo Booth' },
          { tool: 'dj', icon: Music, label: 'DJ', title: 'Add DJ/Band Area' },
          { tool: 'giftTable', icon: Users, label: 'Gifts', title: 'Add Gift Table' },
          { tool: 'entrance', icon: MapPin, label: 'Entry', title: 'Add Entrance' }
        ].map(({ tool, icon: Icon, label, title }) => (
          <Button
            key={tool}
            variant={selectedTool === tool ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setSelectedTool(tool as any)}
            draggable
            onDragStart={(e) => handleToolbarDragStart(e, tool, label)}
            className={cn(
              "w-16 h-12 text-xs flex flex-col gap-1 transition-all duration-200 hover:scale-105 cursor-pointer",
              selectedTool === tool && "shadow-md scale-105 bg-primary text-primary-foreground"
            )}
            title={`${title} (Click to select or drag to canvas)`}
          >
            <Icon className="h-4 w-4" />
            <span className="text-xs">{label}</span>
          </Button>
        ))}
      </Card>

      {/* Enhanced Canvas Area */}
      <div className="flex-1 relative">
        {/* Enhanced Top Controls with glassmorphism */}
        <Card className="absolute top-4 left-4 z-10 flex items-center gap-2 p-2 shadow-xl backdrop-blur-sm bg-background/95 border-border/50">
          {/* Enhanced controls with loading states */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomIn}
            className="hover:scale-110 transition-transform duration-200"
            title="Zoom In (Mouse Wheel)"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleZoomOut}
            className="hover:scale-110 transition-transform duration-200"
            title="Zoom Out (Mouse Wheel)"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFitToView}
            className="hover:scale-110 transition-transform duration-200"
            title="Fit to View"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-1" />
          
          <Button
            variant={showGrid ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setShowGrid(!showGrid)}
            className="hover:scale-110 transition-transform duration-200"
            title="Toggle Grid"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>

          <Button
            variant={isSnapEnabled ? 'default' : 'ghost'}
            size="icon"
            onClick={toggleSnapToGrid}
            className="hover:scale-110 transition-transform duration-200 relative"
            title="Snap to Grid"
          >
            <Grid3X3 className="h-4 w-4" />
            {isSnapEnabled && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            )}
          </Button>

          <div className="flex items-center gap-1 ml-2">
            <span className="text-xs text-muted-foreground">Grid:</span>
            <select
              value={currentGridSize}
              onChange={(e) => handleGridSizeChange(Number(e.target.value))}
              className="text-xs bg-background border rounded px-1 py-0.5"
            >
              <option value={25}>25px</option>
              <option value={50}>50px</option>
              <option value={75}>75px</option>
              <option value={100}>100px</option>
            </select>
          </div>
          
          <div className="w-px h-6 bg-border mx-1" />
          
          {/* Save/Load Controls */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSaveDialog(true)}
            disabled={isLoading}
            className="hover:scale-110 transition-transform duration-200"
            title="Save Layout (Ctrl+S)"
          >
            {isLoading && loadingOperation.includes('Saving') ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowLoadDialog(true)}
            className="hover:scale-110 transition-transform duration-200"
            title="Load Layout (Ctrl+O)"
          >
            <FolderOpen className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExportLayout}
            disabled={isLoading}
            className="hover:scale-110 transition-transform duration-200"
            title="Export Layout (Ctrl+E)"
          >
            {isLoading && loadingOperation.includes('Exporting') ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="hover:scale-110 transition-transform duration-200"
            title="Import Layout"
          >
            {isLoading && loadingOperation.includes('Importing') ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>

          <div className="w-px h-6 bg-border mx-1" />
          
          {/* Undo/Redo Controls */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUndo}
            disabled={history.past.length === 0}
            className="hover:scale-110 transition-transform duration-200"
            title="Undo (Ctrl+Z)"
          >
            <History className="h-4 w-4 scale-x-[-1]" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRedo}
            disabled={history.future.length === 0}
            className="hover:scale-110 transition-transform duration-200"
            title="Redo (Ctrl+Y)"
          >
            <History className="h-4 w-4" />
          </Button>

          {selectedElements.length > 0 && (
            <>
              <div className="w-px h-6 bg-border mx-1" />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopySelected}
                className="hover:scale-110 transition-transform duration-200"
                title="Copy (Ctrl+C)"
              >
                <Copy className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDuplicateSelected}
                className="hover:scale-110 transition-transform duration-200"
                title="Duplicate (Ctrl+D)"
              >
                <Copy className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeleteSelected}
                className="hover:scale-110 transition-transform duration-200 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                title="Delete (Del)"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </Card>

        {/* Selection Info Panel */}
        {selectedElements.length > 0 && (
          <Card className="absolute top-4 right-4 z-10 p-3 shadow-lg min-w-48 backdrop-blur-sm bg-background/95 border-border/50">
            <div className="text-xs font-medium mb-2">
              Selection ({selectedElements.length} item{selectedElements.length > 1 ? 's' : ''})
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-xs text-muted-foreground">
                {selectedElements.length === 1 
                  ? `ID: ${selectedElements[0]}` 
                  : `Multiple items selected`
                }
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopySelected}
                  className="text-xs h-7"
                >
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDuplicateSelected}
                  className="text-xs h-7"
                >
                  Duplicate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDeleteSelected}
                  className="text-xs h-7 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  Delete
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Keyboard: Ctrl+C (copy), Ctrl+V (paste), Ctrl+D (duplicate), Del (delete)
              </div>
            </div>
          </Card>
        )}

        {/* Grid Settings Panel */}
        {showGrid && !selectedElements.length && (
          <Card className="absolute top-4 right-4 z-10 p-3 shadow-lg backdrop-blur-sm bg-background/95 border-border/50">
            <div className="text-xs font-medium mb-2">Grid Settings</div>
            <div className="flex items-center gap-2 text-xs">
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={isSnapEnabled}
                  onChange={toggleSnapToGrid}
                  className="w-3 h-3"
                />
                Snap to Grid
              </label>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Size: {currentGridSize}px
            </div>
            {dragState.isDragging && (
              <div className="mt-1 text-xs text-primary">
                Dragging...
              </div>
            )}
          </Card>
        )}

        {/* Infinite Canvas */}
        <div className="w-full h-full">
          <ReactInfiniteCanvas
            ref={canvasRef}
            onCanvasMount={handleCanvasMount}
            minZoom={0.1}
            maxZoom={4}
            customComponents={[]}
          >
            <div 
              className={cn(
                "relative w-full h-full transition-all duration-200",
                selectedTool.startsWith('table-') || ['stage', 'dancefloor', 'bar', 'entrance', 'photobooth', 'dj', 'giftTable'].includes(selectedTool) 
                  ? "cursor-crosshair" 
                  : "cursor-default",
                dragState.isDragging ? "cursor-grabbing" : "",
                isLoading && "pointer-events-none opacity-50"
              )}
              onClick={handleCanvasClick}
              onDrop={handleCanvasDrop}
              onDragOver={handleCanvasDragOver}
              style={{ width: '2000px', height: '2000px' }}
            >
              {/* Enhanced grid with better visual appeal */}
              {showGrid && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
                  style={{ zIndex: 0 }}
                >
                  <defs>
                    <pattern
                      id="grid"
                      width={currentGridSize}
                      height={currentGridSize}
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d={`M ${currentGridSize} 0 L 0 0 0 ${currentGridSize}`}
                        fill="none"
                        stroke="hsl(var(--border))"
                        strokeWidth="1"
                        opacity="0.3"
                      />
                      <circle
                        cx={currentGridSize / 2}
                        cy={currentGridSize / 2}
                        r="1.5"
                        fill="hsl(var(--muted-foreground))"
                        opacity="0.4"
                      />
                    </pattern>
                    <pattern
                      id="major-grid"
                      width={currentGridSize * 4}
                      height={currentGridSize * 4}
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d={`M ${currentGridSize * 4} 0 L 0 0 0 ${currentGridSize * 4}`}
                        fill="none"
                        stroke="hsl(var(--border))"
                        strokeWidth="1.5"
                        opacity="0.2"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  <rect width="100%" height="100%" fill="url(#major-grid)" />
                </svg>
              )}

              {/* Enhanced canvas elements with better animations */}
              {canvasElements.map((element) => (
                <div
                  key={element.id}
                  className={cn(
                    "absolute z-10 transition-all duration-200 group",
                    selectedElements.includes(element.id) ? "z-20" : "",
                    dragState.elementId === element.id && dragState.isDragging 
                      ? "cursor-grabbing shadow-2xl" 
                      : selectedTool === 'select' 
                        ? "cursor-grab hover:scale-[1.02] hover:shadow-lg" 
                        : "cursor-default"
                  )}
                  style={{
                    left: element.x,
                    top: element.y,
                    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined
                  }}
                  onMouseDown={(e) => handleElementMouseDown(element.id, e, 'move')}
                  onClick={(e) => handleElementClick(element.id, e)}
                >
                  {renderWeddingElement(element)}
                  {renderSelectionHandles(element)}
                </div>
              ))}
            </div>
          </ReactInfiniteCanvas>
        </div>

        {/* Enhanced Status Bar */}
        <Card className="absolute bottom-4 left-4 right-4 p-3 shadow-xl backdrop-blur-sm bg-background/95 border-border/50">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="font-medium">
              Layout: <span className="text-foreground">{currentLayoutName}</span>
            </span>
            <span>
              Elements: <span className="text-foreground font-mono">{canvasElements.length}</span>
            </span>
            <span>
              {selectedElements.length > 0 
                ? <>Selected: <span className="text-primary font-mono">{selectedElements.length}</span></>
                : 'No selection'
              }
            </span>
            <span className="font-mono text-xs">
              Undo: {history.past.length} | Redo: {history.future.length}
            </span>
            {clipboard.length > 0 && (
              <span className="text-blue-600 font-mono">
                Clipboard: {clipboard.length}
              </span>
            )}
          </div>
        </Card>

        {/* Enhanced dialogs with animations */}
        {showSaveDialog && (
          <>
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in duration-200" />
            <Card className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-6 shadow-2xl min-w-96 animate-in zoom-in-95 duration-200">
              <div className="text-xl font-semibold mb-4 text-foreground">Save Layout</div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Layout Name</label>
                  <input
                    type="text"
                    value={currentLayoutName}
                    onChange={(e) => setCurrentLayoutName(e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder="Enter layout name..."
                    disabled={isLoading}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={() => handleSaveLayout()}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSaveDialog(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Enhanced load dialog */}
        {showLoadDialog && (
          <>
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in duration-200" />
            <Card className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-6 shadow-2xl min-w-96 animate-in zoom-in-95 duration-200">
              <div className="text-xl font-semibold mb-4 text-foreground">Load Layout</div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Layout Name</label>
                  <input
                    type="text"
                    value={currentLayoutName}
                    onChange={(e) => setCurrentLayoutName(e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder="Enter layout name..."
                    disabled={isLoading}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={() => handleLoadLayout({ id: 'temp', name: currentLayoutName, elements: canvasElements, timestamp: Date.now() })}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FolderOpen className="h-4 w-4" />
                    )}
                    Load
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowLoadDialog(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Auto-save Status */}
        {isAutoSaveEnabled && (
          <Card className="absolute bottom-20 right-4 p-2 shadow-lg text-xs text-muted-foreground backdrop-blur-sm bg-background/95 border-border/50">
            Auto-save: {getTimeSinceLastSave()}
          </Card>
        )}
      </div>
    </div>
  );
};

export default WeddingCanvas;
