'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Settings,
  Download
} from 'lucide-react';

import WeddingCanvas from './canvas';
import GuestViewSection from './guestViewSection';

// Types and Interfaces
interface GuestData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  tag: 'groom' | 'bride' | 'family' | 'friends' | 'work' | 'plus-one';
  relationship?: string;
  dietaryRestrictions?: string[];
  plusOne?: boolean;
  confirmed?: boolean;
  tableId?: string;
  seatNumber?: number;
  avatar?: string;
  preferences?: {
    avoidIds?: string[];
    preferIds?: string[];
  };
  whatsappNotified?: boolean;
  giftContribution?: number;
}

interface TableData {
  id: string;
  name: string;
  type: 'round' | 'square' | 'rectangle';
  seats: number;
  assignedGuests: string[];
  x?: number;
  y?: number;
  rotation?: number;
}

interface SeatingArrangement {
  id: string;
  name: string;
  tables: TableData[];
  unassigned: string[];
  score?: number;
  timestamp: number;
}

interface WeddingEvent {
  id: string;
  name: string;
  date: string;
  venue: string;
  guests: GuestData[];
}

// Main Component
const WeddingPlannerMap: React.FC = () => {
  // State Management
  const [weddingEvent, setWeddingEvent] = useState<WeddingEvent>({
    id: 'wedding-1',
    name: 'Our Dream Wedding',
    date: '2024-06-15',
    venue: 'Garden Palace',
    guests: [
      // Sample data
      {
        id: 'guest-1',
        name: 'John Smith',
        email: 'john@example.com',
        tag: 'groom',
        confirmed: true
      },
      {
        id: 'guest-2', 
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        tag: 'bride',
        confirmed: false
      },
      {
        id: 'guest-3',
        name: 'Mike Davis',
        email: 'mike@example.com', 
        tag: 'friends',
        confirmed: true,
        tableId: 'table-1'
      }
    ]
  });

  const [isGuestPanelExpanded, setIsGuestPanelExpanded] = useState(true);
  const [canvasElements, setCanvasElements] = useState<any[]>([]);

  // Computed Values
  const guestStats = useMemo(() => {
    const confirmed = weddingEvent.guests.filter(g => g.confirmed).length;
    const pending = weddingEvent.guests.filter(g => !g.confirmed).length;
    const seated = weddingEvent.guests.filter(g => g.tableId).length;
    
    return { confirmed, pending, seated, total: weddingEvent.guests.length };
  }, [weddingEvent.guests]);

  // Event Handlers
  const addGuest = useCallback((guestData: Partial<GuestData>) => {
    const newGuest: GuestData = {
      id: `guest-${Date.now()}`,
      name: guestData.name || '',
      tag: guestData.tag || 'friends',
      confirmed: false,
      ...guestData
    };

    setWeddingEvent(prev => ({
      ...prev,
      guests: [...prev.guests, newGuest]
    }));
  }, []);

  const updateGuest = useCallback((guestId: string, updates: Partial<GuestData>) => {
    setWeddingEvent(prev => ({
      ...prev,
      guests: prev.guests.map(guest =>
        guest.id === guestId ? { ...guest, ...updates } : guest
      )
    }));
  }, []);

  const removeGuest = useCallback((guestId: string) => {
    setWeddingEvent(prev => ({
      ...prev,
      guests: prev.guests.filter(guest => guest.id !== guestId)
    }));
  }, []);

  const handleCanvasElementsChange = useCallback((elements: any[]) => {
    setCanvasElements(elements);
  }, []);

  // Handle guest-specific drag and drop
  const handleGuestDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const dropData = event.dataTransfer.getData('application/json');
    
    if (dropData) {
      try {
        const { type, data } = JSON.parse(dropData);
        
        if (type === 'guest') {
          // Handle guest drop on canvas/table
          console.log('Guest dropped:', data);
        }
      } catch (error) {
        console.error('Error parsing drop data:', error);
      }
    }
  }, []);

  const handleGuestDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card flex-shrink-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold">{weddingEvent.name}</h1>
            <p className="text-sm text-muted-foreground">
              {weddingEvent.date} • {weddingEvent.venue}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Canvas Area - Full Width */}
        <div 
          className="flex-1 relative"
          onDrop={handleGuestDrop}
          onDragOver={handleGuestDragOver}
        >
          <WeddingCanvas
            elements={canvasElements}
            onElementsChange={handleCanvasElementsChange}
            className="w-full h-full"
          />
        </div>

        {/* Guest Panel - Expandable Sidebar */}
        <GuestViewSection
          guests={weddingEvent.guests}
          onGuestAdd={addGuest}
          onGuestUpdate={updateGuest}
          onGuestRemove={removeGuest}
          isExpanded={isGuestPanelExpanded}
          onToggleExpand={() => setIsGuestPanelExpanded(!isGuestPanelExpanded)}
          className="relative z-10"
        />
      </div>
    </div>
  );
};

export default WeddingPlannerMap;
