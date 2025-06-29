import { ChecklistCategory } from '@/types/checklist';

export const defaultCategories: ChecklistCategory[] = [
  {
    id: '1',
    name: '🏛️ Venue & Date',
    isExpanded: true,
    items: [
      { id: '1-1', label: 'Choose wedding date', checked: false },
      { id: '1-2', label: 'Book ceremony venue', checked: false },
      { id: '1-3', label: 'Book reception venue', checked: false },
      { id: '1-4', label: 'Sign venue contracts', checked: false },
      { id: '1-5', label: 'Pay venue deposits', checked: false },
    ]
  },
  {
    id: '2',
    name: '👰 Dress & Attire',
    isExpanded: true,
    items: [
      { id: '2-1', label: 'Choose wedding dress', checked: false },
      { id: '2-2', label: 'Book dress fittings', checked: false },
      { id: '2-3', label: 'Choose groom\'s suit', checked: false },
      { id: '2-4', label: 'Select bridesmaid dresses', checked: false },
      { id: '2-5', label: 'Choose groomsmen attire', checked: false },
      { id: '2-6', label: 'Order wedding rings', checked: false },
    ]
  },
  {
    id: '3',
    name: '📸 Photography & Video',
    isExpanded: true,
    items: [
      { id: '3-1', label: 'Hire photographer', checked: false },
      { id: '3-2', label: 'Hire videographer', checked: false },
      { id: '3-3', label: 'Book engagement shoot', checked: false },
      { id: '3-4', label: 'Create shot list', checked: false },
      { id: '3-5', label: 'Discuss timeline with photographers', checked: false },
    ]
  },
  {
    id: '4',
    name: '🎵 Music & Entertainment',
    isExpanded: true,
    items: [
      { id: '4-1', label: 'Hire DJ or band', checked: false },
      { id: '4-2', label: 'Choose ceremony music', checked: false },
      { id: '4-3', label: 'Select first dance song', checked: false },
      { id: '4-4', label: 'Create reception playlist', checked: false },
    ]
  },
  {
    id: '5',
    name: '🍽️ Catering & Cake',
    isExpanded: true,
    items: [
      { id: '5-1', label: 'Choose caterer', checked: false },
      { id: '5-2', label: 'Plan menu', checked: false },
      { id: '5-3', label: 'Order wedding cake', checked: false },
      { id: '5-4', label: 'Arrange tastings', checked: false },
      { id: '5-5', label: 'Finalize guest count for catering', checked: false },
    ]
  },
  {
    id: '6',
    name: '💐 Flowers & Decorations',
    isExpanded: true,
    items: [
      { id: '6-1', label: 'Choose florist', checked: false },
      { id: '6-2', label: 'Select bouquet style', checked: false },
      { id: '6-3', label: 'Choose centerpieces', checked: false },
      { id: '6-4', label: 'Plan ceremony decorations', checked: false },
      { id: '6-5', label: 'Order boutonnieres and corsages', checked: false },
    ]
  },
  {
    id: '7',
    name: '📋 Ceremony & Officiant',
    isExpanded: true,
    items: [
      { id: '7-1', label: 'Hire officiant', checked: false },
      { id: '7-2', label: 'Write vows', checked: false },
      { id: '7-3', label: 'Choose readings', checked: false },
      { id: '7-4', label: 'Plan ceremony timeline', checked: false },
      { id: '7-5', label: 'Get marriage license', checked: false },
    ]
  },
  {
    id: '8',
    name: '👥 Guest List & Invitations',
    isExpanded: true,
    items: [
      { id: '8-1', label: 'Create guest list', checked: false },
      { id: '8-2', label: 'Choose invitations', checked: false },
      { id: '8-3', label: 'Order invitations', checked: false },
      { id: '8-4', label: 'Address and mail invitations', checked: false },
      { id: '8-5', label: 'Track RSVPs', checked: false },
    ]
  },
  {
    id: '9',
    name: '🚗 Transportation & Accommodation',
    isExpanded: true,
    items: [
      { id: '9-1', label: 'Book wedding transportation', checked: false },
      { id: '9-2', label: 'Reserve hotel blocks', checked: false },
      { id: '9-3', label: 'Arrange airport transfers', checked: false },
    ]
  },
  {
    id: '10',
    name: '💍 Wedding Day',
    isExpanded: true,
    items: [
      { id: '10-1', label: 'Create day-of timeline', checked: false },
      { id: '10-2', label: 'Assign wedding party roles', checked: false },
      { id: '10-3', label: 'Pack emergency kit', checked: false },
      { id: '10-4', label: 'Prepare vendor payments', checked: false },
      { id: '10-5', label: 'Plan rehearsal dinner', checked: false },
    ]
  },
  {
    id: '11',
    name: '💌 Post-Wedding',
    isExpanded: true,
    items: [
      { id: '11-1', label: 'Send thank you notes', checked: false },
      { id: '11-2', label: 'Order wedding album', checked: false },
      { id: '11-3', label: 'Change name on documents', checked: false },
      { id: '11-4', label: 'Update insurance policies', checked: false },
    ]
  }
]; 