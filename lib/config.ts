// Site configuration
export const siteConfig = {
  // The canonical URL for the site (used as fallback when headers unavailable)
  // Set via NEXT_PUBLIC_SITE_URL env var, or defaults to production URL
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://aisafetyforum.au',
} as const;

// Event configuration
export const eventConfig = {
  year: '2026',
  dates: '22-23 June',
  datesLong: '22-23 June 2026',
  venue: 'Sydney',
  venueLong: 'The University of Sydney, Sydney, Australia',

  // Specific dates (used in funding form and calendar invites)
  day1: {
    date: '22 June 2026',
    isoDate: '2026-06-22',
    label: 'Day 1',
  },
  day2: {
    date: '23 June 2026',
    isoDate: '2026-06-23',
    label: 'Day 2',
  },

  // Event times (Australian Eastern Standard Time)
  startTime: '09:00',
  endTime: '17:00',

  // Deadlines
  speakerDeadline: 'Rolling',
  scholarshipDeadline: 'Rolling',
  registrationDeadline: 'Rolling',

  // Organization details for receipts
  organization: {
    name: 'Gradient Institute Ltd',
    abn: '29 631 761 469',
    address: {
      line1: 'Sydney Knowledge Hub',
      line2: 'Level 2 H04 Merewether',
      line3: 'The University Of Sydney',
      city: 'NSW',
      postcode: '2006',
      country: 'Australia',
    },
    email: 'contact@goodancestors.org.au',
    website: 'https://www.gradientinstitute.org',
    // Bank details for invoice payments (bank transfer)
    // IMPORTANT: Update these with real bank details before going live!
    bankDetails: {
      accountName: 'Gradient Institute Ltd',
      bsb: 'TBD', // Update with actual BSB before going live
      accountNumber: 'TBD', // Update with actual account number before going live
      bank: 'TBD', // Update with actual bank name before going live
    },
  },
} as const;
