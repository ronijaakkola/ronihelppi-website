export const personSchema = {
  '@context': 'https://schema.org' as const,
  '@type': 'Person' as const,
  name: 'Roni Helppi',
  url: 'https://www.ronihelppi.com',
  jobTitle: 'Senior UX Designer',
  worksFor: {
    '@type': 'Organization' as const,
    name: 'Reaktor',
    url: 'https://reaktor.com',
  },
  sameAs: [
    'https://twitter.com/ronihelppi',
    'https://linkedin.com/in/ronihelppi',
    'https://github.com/ronijaakkola',
  ],
};
