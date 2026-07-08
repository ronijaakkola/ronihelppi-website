import { contact } from '../data/profile';
import { toSiteUrl } from './site-config';

export function getPersonSchema(site: string | URL | undefined) {
  return {
    '@context': 'https://schema.org' as const,
    '@type': 'Person' as const,
    name: 'Roni Helppi',
    url: toSiteUrl('/', site),
    image: toSiteUrl('/og-default.png', site),
    email: contact.email,
    description:
      'Senior Product Designer at Reaktor working across design and engineering. Interests include AI, generative tools, game development, and the intersection of design and code.',
    jobTitle: 'Senior Product Designer',
    worksFor: {
      '@type': 'Organization' as const,
      name: 'Reaktor',
      url: 'https://reaktor.com',
    },
    // Former employers and university, so agents can reconstruct the career path
    // that the About page and llms.txt describe in prose.
    alumniOf: [
      { '@type': 'Organization' as const, name: 'Gofore' },
      { '@type': 'Organization' as const, name: 'Leadin' },
      { '@type': 'Organization' as const, name: 'Atostek' },
      { '@type': 'CollegeOrUniversity' as const, name: 'Tampere University' },
    ],
    knowsAbout: [
      'Product Design',
      'User Experience Design',
      'Software Engineering',
      'Artificial Intelligence',
      'Generative AI',
      'Game Development',
    ],
    sameAs: [contact.x, contact.linkedin, contact.github],
  };
}
