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
    it('posts directory exists', async () => {
      const postsPath = join(distPath, 'posts');
      await expect(access(postsPath)).resolves.not.toThrow();
    });

    it('generates HTML for each post', async () => {
      const postsPath = join(distPath, 'posts');
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
      const postsPath = join(distPath, 'posts');
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

  describe('Dynamic Routes - Work', () => {
    it('work directory exists', async () => {
      const workPath = join(distPath, 'work');
      await expect(access(workPath)).resolves.not.toThrow();
    });

    it('generates HTML for each work item', async () => {
      const workPath = join(distPath, 'work');
      const workDirs = await readdir(workPath);

      // Should have at least one work item (RESOKILL)
      expect(workDirs.length).toBeGreaterThan(0);

      // Each work item should have an index.html
      for (const workDir of workDirs) {
        const workIndexPath = join(workPath, workDir, 'index.html');
        await expect(access(workIndexPath)).resolves.not.toThrow();
      }
    });

    it('work HTML contains proper structure', async () => {
      const workPath = join(distPath, 'work');
      const workDirs = await readdir(workPath);

      // Check the first work item
      if (workDirs.length > 0) {
        const firstWorkPath = join(workPath, workDirs[0], 'index.html');
        const content = await readFile(firstWorkPath, 'utf-8');

        expect(content).toContain('<!DOCTYPE html>');
        expect(content).toContain('<html');
        expect(content).toContain('</html>');
        expect(content).toMatch(/<h1[^>]*>/);
        expect(content).toMatch(/<time|class=".*meta"/);
      }
    });
  });

  describe('Content Rendering', () => {
    it('home page lists posts and work items', async () => {
      const indexPath = join(distPath, 'index.html');
      const content = await readFile(indexPath, 'utf-8');

      // Should have sections for posts and work
      expect(content.toLowerCase()).toMatch(/posts?/);
      expect(content.toLowerCase()).toMatch(/work/);

      // Should have links to posts and work pages
      expect(content).toContain('/posts/');
      expect(content).toContain('/work/');
    });

    it('post pages link back to home', async () => {
      const postsPath = join(distPath, 'posts');
      const entries = await readdir(postsPath, { withFileTypes: true });
      const postDirs = entries.filter(e => e.isDirectory()).map(e => e.name);

      if (postDirs.length > 0) {
        const firstPostPath = join(postsPath, postDirs[0], 'index.html');
        const content = await readFile(firstPostPath, 'utf-8');

        // Should have a back link
        expect(content).toMatch(/href=["']\//);
      }
    });

    it('work pages link back to home', async () => {
      const workPath = join(distPath, 'work');
      const workDirs = await readdir(workPath);

      if (workDirs.length > 0) {
        const firstWorkPath = join(workPath, workDirs[0], 'index.html');
        const content = await readFile(firstWorkPath, 'utf-8');

        // Should have a back link
        expect(content).toMatch(/href=["']\//);
      }
    });
  });

  describe('Image Paths', () => {
    it('Obsidian images are transformed to /images/ path', async () => {
      // Check if any work or post content contains image references
      const workPath = join(distPath, 'work');
      const workDirs = await readdir(workPath);

      for (const workDir of workDirs) {
        const workIndexPath = join(workPath, workDir, 'index.html');
        const content = await readFile(workIndexPath, 'utf-8');

        if (content.includes('<img')) {
          // Images should use /images/ path
          const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/);
          if (imgMatch) {
            expect(imgMatch[1]).toMatch(/^\/images\//);
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
