import { eventConfig, siteConfig } from '@/lib/config';

/**
 * Event Schema JSON-LD for Google rich snippets
 * @see https://schema.org/Event
 * @see https://developers.google.com/search/docs/appearance/structured-data/event
 */
export function EventSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `Australian AI Safety Forum ${eventConfig.year}`,
    description:
      'Join leading researchers, policymakers, and industry experts for two days of rigorous dialogue on the future of AI safety in Australia.',
    startDate: `${eventConfig.day1.isoDate}T09:00:00+10:00`,
    endDate: `${eventConfig.day2.isoDate}T17:00:00+10:00`,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: 'The University of Sydney',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Eastern Avenue',
        addressLocality: 'Sydney',
        addressRegion: 'NSW',
        postalCode: '2006',
        addressCountry: 'AU',
      },
    },
    image: `${siteConfig.url}/og-image.png`,
    organizer: {
      '@type': 'Organization',
      name: eventConfig.organization.name,
      url: eventConfig.organization.website,
    },
    offers: {
      '@type': 'AggregateOffer',
      url: `${siteConfig.url}/register`,
      priceCurrency: 'AUD',
      lowPrice: '75',
      highPrice: '595',
      availability: 'https://schema.org/InStock',
      validFrom: '2025-01-01',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Organization Schema JSON-LD
 * @see https://schema.org/Organization
 */
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: eventConfig.organization.name,
    url: eventConfig.organization.website,
    email: eventConfig.organization.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${eventConfig.organization.address.line1}, ${eventConfig.organization.address.line2}`,
      addressLocality: 'Sydney',
      addressRegion: eventConfig.organization.address.city,
      postalCode: eventConfig.organization.address.postcode,
      addressCountry: eventConfig.organization.address.country,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
