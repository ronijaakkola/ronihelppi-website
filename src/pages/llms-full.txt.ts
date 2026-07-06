import { getCollection } from 'astro:content';
import { getTitleFromEntry } from '../utils/title';
import { sortByDateDesc } from '../utils/sortByDate';
import { bio, experience, contact } from '../data/profile';
import type { APIContext } from 'astro';

function stripMarkdownToPlainText(body: string): string {
  return body
    .replace(/!\[\[.*?\]\]/g, '') // Remove Obsidian images
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove standard images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`([^`]+)`/g, '$1') // Remove inline code markers
    .replace(/^#{1,6}\s+/gm, '') // Remove heading markers but keep text
    .replace(/^\s*[-*+]\s+/gm, '- ') // Normalize list markers
    .replace(/^\s*>\s?/gm, '') // Remove blockquote markers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic
    .replace(/~~([^~]+)~~/g, '$1') // Remove strikethrough
    .replace(/^---$/gm, '') // Remove horizontal rules
    .replace(/\n{3,}/g, '\n\n') // Collapse multiple newlines
    .trim();
}

export async function GET(context: APIContext) {
  const posts = sortByDateDesc(await getCollection('posts'));
  const projects = sortByDateDesc(await getCollection('projects'));

  const lines: string[] = [];

  lines.push('# Roni Helppi — Full Site Content');
  lines.push('');
  lines.push('> This file contains all writing and project content from ronihelppi.com in plain text, intended for LLM ingestion.');
  lines.push('> For a summary, see https://ronihelppi.com/llms.txt');
  lines.push('');
  lines.push(`> Generated: ${new Date().toISOString().split('T')[0]}`);
  lines.push('');

  // About section
  lines.push('---');
  lines.push('');
  lines.push('## About');
  lines.push('');
  lines.push(bio);
  lines.push('');
  lines.push('### Experience');
  lines.push('');
  for (const entry of experience) {
    lines.push(`- ${entry.date} — ${entry.role}, ${entry.company}`);
  }
  lines.push('');
  lines.push(`Contact: ${contact.email}`);
  lines.push(`LinkedIn: ${contact.linkedin}`);
  lines.push(`GitHub: ${contact.github}`);
  lines.push(`X: ${contact.x}`);
  lines.push('');

  // Writing section
  lines.push('---');
  lines.push('');
  lines.push('## Writing');
  lines.push('');

  for (const post of posts) {
    const title = getTitleFromEntry(post);
    const date = post.data.date.toISOString().split('T')[0];
    const url = new URL(`/writing/${post.id}/`, context.site).href;

    lines.push(`### ${title}`);
    lines.push('');
    lines.push(`Date: ${date}`);
    lines.push(`URL: ${url}`);
    if (post.data.description) {
      lines.push(`Summary: ${post.data.description}`);
    }
    lines.push('');
    lines.push(stripMarkdownToPlainText(post.body || ''));
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Projects section
  lines.push('## Projects');
  lines.push('');

  for (const project of projects) {
    const title = getTitleFromEntry(project);
    const date = project.data.date.toISOString().split('T')[0];
    const url = new URL(`/projects/${project.id}/`, context.site).href;

    lines.push(`### ${title}`);
    lines.push('');
    lines.push(`Date: ${date}`);
    lines.push(`URL: ${url}`);
    if (project.data.description) {
      lines.push(`Summary: ${project.data.description}`);
    }
    if (project.data.tags) {
      lines.push(`Tags: ${project.data.tags.join(', ')}`);
    }
    lines.push('');
    lines.push(stripMarkdownToPlainText(project.body || ''));
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
