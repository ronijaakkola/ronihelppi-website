export const personSchema = {
  '@context': 'https://schema.org' as const,
  '@type': 'Person' as const,
  name: 'Roni Helppi',
  url: 'https://ronihelppi.com',
  jobTitle: 'Senior Product Designer',
  worksFor: {
    '@type': 'Organization' as const,
    name: 'Reaktor',
    url: 'https://reaktor.com',
  },
  sameAs: [
    'https://x.com/Nashtanir',
    'https://www.linkedin.com/in/ronihelppi/',
    'https://github.com/ronijaakkola',
  ],
};
