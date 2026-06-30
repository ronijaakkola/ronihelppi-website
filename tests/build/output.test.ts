import { describe, it, expect } from 'vitest';
import { access, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

describe('Build Output Validation', () => {
  const distPath = join(process.cwd(), 'dist');

  // Note: These tests assume the build has been run before testing
  // In CI, the build step should run before tests

  describe('Basic Structure', () => {
    it('dist directory exists', async () => {
      await expect(access(distPath)).resolves.not.toThrow();
    });

    it('index.html exists in dist root', async () => {
      const indexPath = join(distPath, 'index.html');
      await expect(access(indexPath)).resolves.not.toThrow();
    });

    it('index.html contains expected content', async () => {
      const indexPath = join(distPath, 'index.html');
      const content = await readFile(indexPath, 'utf-8');

      // Should have HTML structure
      expect(content).toContain('<!DOCTYPE html>');
      expect(content).toContain('<html');
      expect(content).toContain('</html>');

      // Should have title
      expect(content).toContain('<title>');
    });
  });

  describe('Dynamic Routes - Posts', () => {
    it('writing directory exists', async () => {
      const postsPath = join(distPath, 'writing');
      await expect(access(postsPath)).resolves.not.toThrow();
    });

    it('generates HTML for each post', async () => {
      const postsPath = join(distPath, 'writing');
      const entries = await readdir(postsPath, { withFileTypes: true });
      const postDirs = entries.filter(e => e.isDirectory()).map(e => e.name);

      // Should have at least one post (Digital tangibleness)
      expect(postDirs.length).toBeGreaterThan(0);

      // Each post should have an index.html
      for (const postDir of postDirs) {
        const postIndexPath = join(postsPath, postDir, 'index.html');
        await expect(access(postIndexPath)).resolves.not.toThrow();
      }
    });

    it('post HTML contains proper structure', async () => {
      const postsPath = join(distPath, 'writing');
      const entries = await readdir(postsPath, { withFileTypes: true });
      const postDirs = entries.filter(e => e.isDirectory()).map(e => e.name);

      // Check the first post
      if (postDirs.length > 0) {
        const firstPostPath = join(postsPath, postDirs[0], 'index.html');
        const content = await readFile(firstPostPath, 'utf-8');

        expect(content).toContain('<!DOCTYPE html>');
        expect(content).toContain('<html');
        expect(content).toContain('</html>');
        expect(content).toMatch(/<h1[^>]*>/);
        expect(content).toMatch(/<time|class="post-meta"/);
      }
    });
  });

  describe('Dynamic Routes - Projects', () => {
    it('projects directory exists', async () => {
      const projectsPath = join(distPath, 'projects');
      await expect(access(projectsPath)).resolves.not.toThrow();
    });

    it('generates HTML for each project', async () => {
      const projectsPath = join(distPath, 'projects');
      const entries = await readdir(projectsPath, { withFileTypes: true });
      const projectDirs = entries.filter(e => e.isDirectory()).map(e => e.name);

      // Should have at least one project (RESOKILL)
      expect(projectDirs.length).toBeGreaterThan(0);

      // Each project should have an index.html
      for (const projectDir of projectDirs) {
        const projectIndexPath = join(projectsPath, projectDir, 'index.html');
        await expect(access(projectIndexPath)).resolves.not.toThrow();
      }
    });

    it('project HTML contains proper structure', async () => {
      const projectsPath = join(distPath, 'projects');
      const entries = await readdir(projectsPath, { withFileTypes: true });
      const projectDirs = entries.filter(e => e.isDirectory()).map(e => e.name);

      // Check the first project
      if (projectDirs.length > 0) {
        const firstProjectPath = join(projectsPath, projectDirs[0], 'index.html');
        const content = await readFile(firstProjectPath, 'utf-8');

        expect(content).toContain('<!DOCTYPE html>');
        expect(content).toContain('<html');
        expect(content).toContain('</html>');
        expect(content).toMatch(/<h1[^>]*>/);
        expect(content).toMatch(/<time|class=".*meta"/);
      }
    });

    it('projects index prioritizes only the LCP cover image', async () => {
      const projectsIndexPath = join(distPath, 'projects', 'index.html');
      const content = await readFile(projectsIndexPath, 'utf-8');

      const gridImages = Array.from(content.matchAll(/<img[^>]+class="grid-item-image"[^>]*>/g)).map((match) => match[0]);

      expect(gridImages.length).toBeGreaterThan(0);
      expect(gridImages[0]).toContain('loading="eager"');
      expect(gridImages[0]).toContain('fetchpriority="high"');
      expect(gridImages[0]).toContain('sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 960px) calc(100vw - 40px), 605px"');

      for (const image of gridImages.slice(1)) {
        expect(image).toContain('loading="lazy"');
        expect(image).not.toContain('fetchpriority="high"');
      }
    });
  });

  describe('Content Rendering', () => {
    it('home page lists posts and projects', async () => {
      const indexPath = join(distPath, 'index.html');
      const content = await readFile(indexPath, 'utf-8');

      // Should have sections for writing and projects
      expect(content.toLowerCase()).toMatch(/writing/);
      expect(content.toLowerCase()).toMatch(/projects?/);

      // Should have links to writing and project pages
      expect(content).toContain('/writing/');
      expect(content).toContain('/projects/');
    });

    it('post pages link back to home', async () => {
      const postsPath = join(distPath, 'writing');
      const entries = await readdir(postsPath, { withFileTypes: true });
      const postDirs = entries.filter(e => e.isDirectory()).map(e => e.name);

      if (postDirs.length > 0) {
        const firstPostPath = join(postsPath, postDirs[0], 'index.html');
        const content = await readFile(firstPostPath, 'utf-8');

        // Should have a back link
        expect(content).toMatch(/href=["']\//);
      }
    });

    it('project pages link back to home', async () => {
      const projectsPath = join(distPath, 'projects');
      const entries = await readdir(projectsPath, { withFileTypes: true });
      const projectDirs = entries.filter(e => e.isDirectory()).map(e => e.name);

      if (projectDirs.length > 0) {
        const firstProjectPath = join(projectsPath, projectDirs[0], 'index.html');
        const content = await readFile(firstProjectPath, 'utf-8');

        // Should have a back link
        expect(content).toMatch(/href=["']\//);
      }
    });
  });

  describe('Image Paths', () => {
    it('images use valid paths (/images/ or /_astro/)', async () => {
      // Check if any project or post content contains image references
      const projectsPath = join(distPath, 'projects');
      const entries = await readdir(projectsPath, { withFileTypes: true });
      const projectDirs = entries.filter(e => e.isDirectory()).map(e => e.name);

      for (const projectDir of projectDirs) {
        const projectIndexPath = join(projectsPath, projectDir, 'index.html');
        const content = await readFile(projectIndexPath, 'utf-8');

        if (content.includes('<img')) {
          // Images should use /images/ path (static) or /_astro/ path (optimized)
          const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/);
          if (imgMatch) {
            expect(imgMatch[1]).toMatch(/^\/(images|_astro)\//);
          }
        }
      }

      // If no images found, that's okay - the test would just pass
      // The important thing is that IF images exist, they use the right path
    });
  });

  describe('Static Assets', () => {
    it('favicon exists', async () => {
      const faviconPath = join(distPath, 'favicon.svg');
      await expect(access(faviconPath)).resolves.not.toThrow();
    });
  });

  describe('HTML Validation', () => {
    it('all HTML files have proper DOCTYPE', async () => {
      const checkHTMLFiles = async (dir: string) => {
        const entries = await readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = join(dir, entry.name);

          if (entry.isDirectory()) {
            await checkHTMLFiles(fullPath);
          } else if (entry.name.endsWith('.html')) {
            const content = await readFile(fullPath, 'utf-8');
            expect(content).toContain('<!DOCTYPE html>');
          }
        }
      };

      await checkHTMLFiles(distPath);
    });

    it('all HTML files have closing tags', async () => {
      const checkHTMLFiles = async (dir: string) => {
        const entries = await readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = join(dir, entry.name);

          if (entry.isDirectory()) {
            await checkHTMLFiles(fullPath);
          } else if (entry.name.endsWith('.html')) {
            const content = await readFile(fullPath, 'utf-8');
            expect(content).toContain('</html>');
            expect(content).toContain('</head>');
            expect(content).toContain('</body>');
          }
        }
      };

      await checkHTMLFiles(distPath);
    });
  });
});
