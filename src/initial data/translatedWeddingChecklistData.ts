import { ChecklistCategory } from '@/types/checklist';

export const getTranslatedCategories = (t: (key: string) => string): ChecklistCategory[] => [
  {
    id: '1',
    name: t('checklist.categories.venueAndDate'),
    isExpanded: true,
    items: [
      { id: '1-1', label: t('checklist.tasks.chooseWeddingDate'), checked: false },
      { id: '1-2', label: t('checklist.tasks.bookCeremonyVenue'), checked: false },
      { id: '1-3', label: t('checklist.tasks.bookReceptionVenue'), checked: false },
      { id: '1-4', label: t('checklist.tasks.signVenueContracts'), checked: false },
      { id: '1-5', label: t('checklist.tasks.payVenueDeposits'), checked: false },
    ]
  },
  {
    id: '2',
    name: t('checklist.categories.dressAndAttire'),
    isExpanded: true,
    items: [
      { id: '2-1', label: t('checklist.tasks.chooseWeddingDress'), checked: false },
      { id: '2-2', label: t('checklist.tasks.bookDressFittings'), checked: false },
      { id: '2-3', label: t('checklist.tasks.chooseGroomSuit'), checked: false },
      { id: '2-4', label: t('checklist.tasks.selectBridesmaidDresses'), checked: false },
      { id: '2-5', label: t('checklist.tasks.chooseGroomsmenAttire'), checked: false },
      { id: '2-6', label: t('checklist.tasks.orderWeddingRings'), checked: false },
    ]
  },
  {
    id: '3',
    name: t('checklist.categories.photographyAndVideo'),
    isExpanded: true,
    items: [
      { id: '3-1', label: t('checklist.tasks.hirePhotographer'), checked: false },
      { id: '3-2', label: t('checklist.tasks.hireVideographer'), checked: false },
      { id: '3-3', label: t('checklist.tasks.bookEngagementShoot'), checked: false },
      { id: '3-4', label: t('checklist.tasks.createShotList'), checked: false },
      { id: '3-5', label: t('checklist.tasks.discussTimelineWithPhotographers'), checked: false },
    ]
  },
  {
    id: '4',
    name: t('checklist.categories.musicAndEntertainment'),
    isExpanded: true,
    items: [
      { id: '4-1', label: t('checklist.tasks.hireDjOrBand'), checked: false },
      { id: '4-2', label: t('checklist.tasks.chooseCeremonyMusic'), checked: false },
      { id: '4-3', label: t('checklist.tasks.selectFirstDanceSong'), checked: false },
      { id: '4-4', label: t('checklist.tasks.createReceptionPlaylist'), checked: false },
    ]
  },
  {
    id: '5',
    name: t('checklist.categories.cateringAndCake'),
    isExpanded: true,
    items: [
      { id: '5-1', label: t('checklist.tasks.chooseCaterer'), checked: false },
      { id: '5-2', label: t('checklist.tasks.planMenu'), checked: false },
      { id: '5-3', label: t('checklist.tasks.orderWeddingCake'), checked: false },
      { id: '5-4', label: t('checklist.tasks.arrangeTastings'), checked: false },
      { id: '5-5', label: t('checklist.tasks.finalizeGuestCountForCatering'), checked: false },
    ]
  },
  {
    id: '6',
    name: t('checklist.categories.flowersAndDecorations'),
    isExpanded: true,
    items: [
      { id: '6-1', label: t('checklist.tasks.chooseFlorist'), checked: false },
      { id: '6-2', label: t('checklist.tasks.selectBouquetStyle'), checked: false },
      { id: '6-3', label: t('checklist.tasks.chooseCenterpieces'), checked: false },
      { id: '6-4', label: t('checklist.tasks.planCeremonyDecorations'), checked: false },
      { id: '6-5', label: t('checklist.tasks.orderBoutonnieresAndCorsages'), checked: false },
    ]
  },
  {
    id: '7',
    name: t('checklist.categories.ceremonyAndOfficiant'),
    isExpanded: true,
    items: [
      { id: '7-1', label: t('checklist.tasks.hireOfficiant'), checked: false },
      { id: '7-2', label: t('checklist.tasks.writeVows'), checked: false },
      { id: '7-3', label: t('checklist.tasks.chooseReadings'), checked: false },
      { id: '7-4', label: t('checklist.tasks.planCeremonyTimeline'), checked: false },
      { id: '7-5', label: t('checklist.tasks.getMarriageLicense'), checked: false },
    ]
  },
  {
    id: '8',
    name: t('checklist.categories.guestListAndInvitations'),
    isExpanded: true,
    items: [
      { id: '8-1', label: t('checklist.tasks.createGuestList'), checked: false },
      { id: '8-2', label: t('checklist.tasks.chooseInvitations'), checked: false },
      { id: '8-3', label: t('checklist.tasks.orderInvitations'), checked: false },
      { id: '8-4', label: t('checklist.tasks.addressAndMailInvitations'), checked: false },
      { id: '8-5', label: t('checklist.tasks.trackRsvps'), checked: false },
    ]
  },
  {
    id: '9',
    name: t('checklist.categories.transportationAndAccommodation'),
    isExpanded: true,
    items: [
      { id: '9-1', label: t('checklist.tasks.bookWeddingTransportation'), checked: false },
      { id: '9-2', label: t('checklist.tasks.reserveHotelBlocks'), checked: false },
      { id: '9-3', label: t('checklist.tasks.arrangeAirportTransfers'), checked: false },
    ]
  },
  {
    id: '10',
    name: t('checklist.categories.weddingDay'),
    isExpanded: true,
    items: [
      { id: '10-1', label: t('checklist.tasks.createDayOfTimeline'), checked: false },
      { id: '10-2', label: t('checklist.tasks.assignWeddingPartyRoles'), checked: false },
      { id: '10-3', label: t('checklist.tasks.packEmergencyKit'), checked: false },
      { id: '10-4', label: t('checklist.tasks.prepareVendorPayments'), checked: false },
      { id: '10-5', label: t('checklist.tasks.planRehearsalDinner'), checked: false },
    ]
  },
  {
    id: '11',
    name: t('checklist.categories.postWedding'),
    isExpanded: true,
    items: [
      { id: '11-1', label: t('checklist.tasks.sendThankYouNotes'), checked: false },
      { id: '11-2', label: t('checklist.tasks.orderWeddingAlbum'), checked: false },
      { id: '11-3', label: t('checklist.tasks.changeNameOnDocuments'), checked: false },
      { id: '11-4', label: t('checklist.tasks.updateInsurancePolicies'), checked: false },
    ]
  }
]; 