import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  UniqueIdentifier,
  CollisionDetection,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'

export interface DragItem {
  id: UniqueIdentifier
  [key: string]: any
}

export interface UseDragAndDropOptions<T extends DragItem> {
  items: T[]
  onReorder?: (items: T[]) => void
  onDragStart?: (event: DragStartEvent) => void
  onDragEnd?: (event: DragEndEvent) => void
  onDragOver?: (event: DragOverEvent) => void
  strategy?: 'vertical' | 'horizontal'
  collisionDetection?: CollisionDetection
  modifiers?: any[]
}

export interface DragAndDropContextProps<T extends DragItem> {
  items: T[]
  activeId: UniqueIdentifier | null
  sensors: ReturnType<typeof useSensors>
  handleDragStart: (event: DragStartEvent) => void
  handleDragEnd: (event: DragEndEvent) => void
  handleDragOver: (event: DragOverEvent) => void
  collisionDetection: CollisionDetection
  modifiers: any[]
  strategy: any
}

export function useDragAndDrop<T extends DragItem>({
  items,
  onReorder,
  onDragStart,
  onDragEnd,
  onDragOver,
  strategy = 'vertical',
  collisionDetection = closestCenter,
  modifiers = [],
}: UseDragAndDropOptions<T>) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [internalItems, setInternalItems] = useState(items)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id)
    onDragStart?.(event)
  }, [onDragStart])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    
    if (active.id !== over?.id) {
      const oldIndex = internalItems.findIndex(item => item.id === active.id)
      const newIndex = internalItems.findIndex(item => item.id === over?.id)
      
      const newItems = arrayMove(internalItems, oldIndex, newIndex)
      setInternalItems(newItems)
      onReorder?.(newItems)
    }
    
    setActiveId(null)
    onDragEnd?.(event)
  }, [internalItems, onReorder, onDragEnd])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    onDragOver?.(event)
  }, [onDragOver])

  const sortingStrategy = strategy === 'horizontal' 
    ? horizontalListSortingStrategy 
    : verticalListSortingStrategy

  const defaultModifiers = [...modifiers]

  return {
    items: internalItems,
    activeId,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    collisionDetection,
    modifiers: defaultModifiers,
    strategy: sortingStrategy,
    setItems: setInternalItems,
  }
}

export function useSortableList<T extends DragItem>(
  initialItems: T[],
  onItemsChange?: (items: T[]) => void
) {
  const dragAndDrop = useDragAndDrop({
    items: initialItems,
    onReorder: onItemsChange,
  })

  const addItem = useCallback((item: T) => {
    const newItems = [...dragAndDrop.items, item] as T[]
    dragAndDrop.setItems(newItems)
    onItemsChange?.(newItems)
  }, [dragAndDrop, onItemsChange])

  const removeItem = useCallback((id: UniqueIdentifier) => {
    const newItems = dragAndDrop.items.filter(item => item.id !== id) as T[]
    dragAndDrop.setItems(newItems)
    onItemsChange?.(newItems)
  }, [dragAndDrop, onItemsChange])

  const updateItem = useCallback((id: UniqueIdentifier, updates: Partial<T>) => {
    const newItems = dragAndDrop.items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ) as T[]
    dragAndDrop.setItems(newItems)
    onItemsChange?.(newItems)
  }, [dragAndDrop, onItemsChange])

  return {
    ...dragAndDrop,
    addItem,
    removeItem,
    updateItem,
  }
}

export interface DragAndDropProviderProps<T extends DragItem> {
  children: React.ReactNode
  dragAndDrop: DragAndDropContextProps<T>
}

export function DragAndDropProvider<T extends DragItem>({ children, dragAndDrop }: DragAndDropProviderProps<T>) {
  return (
    <DndContext
      sensors={dragAndDrop.sensors}
      collisionDetection={dragAndDrop.collisionDetection}
      onDragStart={dragAndDrop.handleDragStart}
      onDragEnd={dragAndDrop.handleDragEnd}
      onDragOver={dragAndDrop.handleDragOver}
      modifiers={dragAndDrop.modifiers}
    >
      <SortableContext items={dragAndDrop.items} strategy={dragAndDrop.strategy}>
        {children}
      </SortableContext>
    </DndContext>
  )
}

export { useSortable } from '@dnd-kit/sortable'
export { CSS } from '@dnd-kit/utilities'
