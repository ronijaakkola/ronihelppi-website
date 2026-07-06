// Shared profile facts — the single source of truth for the About page, the
// Person JSON-LD, and the generated llms.txt / llms-full.txt files, so the
// human-facing pages and the machine-facing text can't drift apart.

// Short summary line (the llms.txt blockquote / site tagline).
export const tagline =
  'Senior designer & engineer at Reaktor. Personal website with writing and project case studies.';

export const bio =
  'Roni Helppi is a Senior Product Designer at Reaktor, working across design and engineering. Previously at Gofore, Leadin, and Atostek. Interests include AI, generative tools, game development, and the intersection of design and code.';

export const contact = {
  email: 'hello@ronihelppi.com',
  linkedin: 'https://www.linkedin.com/in/ronihelppi/',
  github: 'https://github.com/ronijaakkola',
  x: 'https://x.com/Nashtanir',
};

export interface ExperienceEntry {
  /** Human-readable range, e.g. "08/2022–" */
  date: string;
  /** Machine range for <time>, e.g. "2022-08" or "2017-12/2022-08" */
  datetime: string;
  company: string;
  role: string;
}

export const experience: ExperienceEntry[] = [
  { date: '08/2022–', datetime: '2022-08', company: 'Reaktor', role: 'Senior Product Designer' },
  { date: '12/2017–08/2022', datetime: '2017-12/2022-08', company: 'Gofore', role: 'UX Designer' },
  { date: '02/2017–12/2017', datetime: '2017-02/2017-12', company: 'Leadin', role: 'UX Developer' },
  { date: '01/2016–02/2017', datetime: '2016-01/2017-02', company: 'Atostek', role: 'Software Designer' },
  { date: '01/2015–06/2015', datetime: '2015-01/2015-06', company: 'Tampere University', role: 'Research Assistant' },
];
