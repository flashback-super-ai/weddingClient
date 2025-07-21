'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  ChevronDown,
  UserPlus,
  Download,
  Upload,
  X
} from 'lucide-react';

import Guest from './guest';

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

interface GuestStats {
  total: number;
  confirmed: number;
  pending: number;
  seated: number;
}

interface GuestViewSectionProps {
  guests: GuestData[];
  onGuestUpdate?: (guestId: string, updates: Partial<GuestData>) => void;
  onGuestAdd?: (guest: Partial<GuestData>) => void;
  onGuestRemove?: (guestId: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  className?: string;
}

const GuestViewSection: React.FC<GuestViewSectionProps> = ({
  guests,
  onGuestUpdate,
  onGuestAdd,
  onGuestRemove,
  isExpanded,
  onToggleExpand,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);
  const [showAddGuest, setShowAddGuest] = useState(false);

  const guestStats = useMemo((): GuestStats => {
    const confirmed = guests.filter(g => g.confirmed).length;
    const pending = guests.filter(g => !g.confirmed).length;
    const seated = guests.filter(g => g.tableId).length;
    
    return { 
      total: guests.length, 
      confirmed, 
      pending, 
      seated 
    };
  }, [guests]);

  const filteredGuests = useMemo(() => {
    return guests.filter(guest => {
      const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           guest.phone?.includes(searchTerm);
      
      const matchesTag = filterTag === 'all' || guest.tag === filterTag;
      
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'confirmed' && guest.confirmed) ||
                           (filterStatus === 'pending' && !guest.confirmed) ||
                           (filterStatus === 'seated' && guest.tableId) ||
                           (filterStatus === 'unseated' && !guest.tableId);
      
      return matchesSearch && matchesTag && matchesStatus;
    });
  }, [guests, searchTerm, filterTag, filterStatus]);

  const handleGuestClick = useCallback((guestId: string, event?: React.MouseEvent) => {
    if (event?.ctrlKey || event?.metaKey) {
      setSelectedGuests(prev => 
        prev.includes(guestId) 
          ? prev.filter(id => id !== guestId)
          : [...prev, guestId]
      );
    } else {
      setSelectedGuests([guestId]);
    }
  }, []);

  const handleDragStart = useCallback((event: React.DragEvent, guest: GuestData) => {
    event.dataTransfer.setData('application/json', JSON.stringify({
      type: 'guest',
      data: guest
    }));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const StatCard = ({ icon: Icon, label, value, color }: {
    icon: React.ElementType;
    label: string;
    value: number;
    color: string;
  }) => (
    <div className={cn("flex items-center gap-2 p-2 rounded-lg", color)}>
      <Icon className="h-4 w-4" />
      <div>
        <div className="text-lg font-semibold">{value}</div>
        <div className="text-xs opacity-80">{label}</div>
      </div>
    </div>
  );

  const GuestCard = ({ guest }: { guest: GuestData }) => (
    <Card 
      className={cn(
        "p-3 cursor-pointer transition-all duration-200 hover:shadow-md",
        selectedGuests.includes(guest.id) && "ring-2 ring-primary shadow-md",
        guest.tableId && "border-green-200 bg-green-50"
      )}
      onClick={(e) => handleGuestClick(guest.id, e)}
      draggable
      onDragStart={(e) => handleDragStart(e, guest)}
    >
      <div className="flex items-center gap-3">
        <Guest
          id={guest.id}
          name={guest.name}
          tag={guest.tag}
          avatar={guest.avatar}
          isSelected={selectedGuests.includes(guest.id)}
          className="scale-75"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium truncate">{guest.name}</h4>
            {guest.confirmed ? (
              <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
            ) : (
              <Clock className="h-3 w-3 text-orange-500 flex-shrink-0" />
            )}
          </div>
          
          {guest.email && (
            <p className="text-xs text-muted-foreground truncate">{guest.email}</p>
          )}
          
          <div className="flex items-center gap-2 mt-1">
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              guest.tag === 'groom' && "bg-blue-100 text-blue-700",
              guest.tag === 'bride' && "bg-pink-100 text-pink-700",
              guest.tag === 'family' && "bg-green-100 text-green-700",
              guest.tag === 'friends' && "bg-purple-100 text-purple-700",
              guest.tag === 'work' && "bg-orange-100 text-orange-700",
              guest.tag === 'plus-one' && "bg-gray-100 text-gray-700"
            )}>
              {guest.tag}
            </span>
            
            {guest.tableId && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Table {guest.tableId}
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  const AddGuestForm = () => {
    const [newGuest, setNewGuest] = useState({
      name: '',
      email: '',
      phone: '',
      tag: 'friends' as GuestData['tag']
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (newGuest.name.trim()) {
        onGuestAdd?.(newGuest);
        setNewGuest({ name: '', email: '', phone: '', tag: 'friends' });
        setShowAddGuest(false);
      }
    };

    return (
      <Card className="p-4 mb-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Add Guest</h3>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowAddGuest(false)}
              className="h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <Input
            placeholder="Full name"
            value={newGuest.name}
            onChange={(e) => setNewGuest(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          
          <Input
            type="email"
            placeholder="Email"
            value={newGuest.email}
            onChange={(e) => setNewGuest(prev => ({ ...prev, email: e.target.value }))}
          />
          
          <Input
            type="tel"
            placeholder="Phone"
            value={newGuest.phone}
            onChange={(e) => setNewGuest(prev => ({ ...prev, phone: e.target.value }))}
          />
          
          <select
            value={newGuest.tag}
            onChange={(e) => setNewGuest(prev => ({ ...prev, tag: e.target.value as GuestData['tag'] }))}
            className="w-full px-3 py-2 border border-border rounded-md bg-background"
          >
            <option value="groom">Groom's Side</option>
            <option value="bride">Bride's Side</option>
            <option value="family">Family</option>
            <option value="friends">Friends</option>
            <option value="work">Work</option>
            <option value="plus-one">Plus One</option>
          </select>
          
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="flex-1">
              Add Guest
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => setShowAddGuest(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    );
  };

  return (
    <div className={cn(
      "bg-background border-l transition-all duration-300 ease-in-out flex flex-col",
      isExpanded ? "w-96 md:w-80 lg:w-96" : "w-12",
      "max-w-[calc(100vw-300px)]",
      className
    )}>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleExpand}
        className="absolute -left-6 top-4 z-10 bg-background border shadow-sm"
        title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isExpanded ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4 rotate-90" />}
      </Button>

      {/* Collapsed State */}
      {!isExpanded && (
        <div className="flex flex-col items-center gap-2 p-2 pt-16">
          <Users className="h-5 w-5 text-muted-foreground" />
          <div 
            className="text-xs text-muted-foreground"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            Guests
          </div>
        </div>
      )}

      {/* Expanded State */}
      {isExpanded && (
        <>
          {/* Header with Stats */}
          <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Guest List</h2>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddGuest(true)}
                  className="h-7 w-7"
                  title="Add guest"
                >
                  <UserPlus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  title="Import guests"
                >
                  <Upload className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  title="Export guests"
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-2">
              <StatCard
                icon={Users}
                label="Total"
                value={guestStats.total}
                color="bg-blue-50 text-blue-700"
              />
              <StatCard
                icon={CheckCircle2}
                label="Confirmed"
                value={guestStats.confirmed}
                color="bg-green-50 text-green-700"
              />
              <StatCard
                icon={Clock}
                label="Pending"
                value={guestStats.pending}
                color="bg-orange-50 text-orange-700"
              />
              <StatCard
                icon={AlertCircle}
                label="Seated"
                value={guestStats.seated}
                color="bg-purple-50 text-purple-700"
              />
            </div>
          </div>

          {/* Add Guest Form */}
          {showAddGuest && <div className="p-4 border-b"><AddGuestForm /></div>}

          {/* Filters */}
          <div className="p-4 border-b space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search guests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2">
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-border rounded bg-background"
              >
                <option value="all">All Groups</option>
                <option value="groom">Groom's Side</option>
                <option value="bride">Bride's Side</option>
                <option value="family">Family</option>
                <option value="friends">Friends</option>
                <option value="work">Work</option>
                <option value="plus-one">Plus One</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 px-2 py-1 text-xs border border-border rounded bg-background"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="seated">Seated</option>
                <option value="unseated">Unseated</option>
              </select>
            </div>
          </div>

          {/* Guest List */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredGuests.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No guests found</p>
                {searchTerm || filterTag !== 'all' || filterStatus !== 'all' ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterTag('all');
                      setFilterStatus('all');
                    }}
                    className="mt-2"
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddGuest(true)}
                    className="mt-2"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add first guest
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredGuests.map((guest) => (
                  <GuestCard key={guest.id} guest={guest} />
                ))}
              </div>
            )}
          </div>

          {/* Selection Actions */}
          {selectedGuests.length > 0 && (
            <div className="p-4 border-t bg-muted/30">
              <div className="text-sm font-medium mb-2">
                {selectedGuests.length} guest{selectedGuests.length > 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs">
                  Assign to Table
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  Send RSVP
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => setSelectedGuests([])}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GuestViewSection; 