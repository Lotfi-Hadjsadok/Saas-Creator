import * as cheerio from 'cheerio';
import { chromium } from 'playwright';
import type {
  ContentItem,
  ExtractResult,
  ImageItem,
  LinkItem,
  VideoItem,
} from '@/types';

export async function extractWebsite(url: string): Promise<ExtractResult> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const html = await page.content();
  await browser.close();

  const $ = cheerio.load(html);
  const items: ContentItem[] = [];
  const links: LinkItem[] = [];

  const walk = (
    node: { type?: string; name?: string; data?: string; children?: unknown[] },
    inLink = false,
  ) => {
    if (node.type === 'script' || (node.type === 'tag' && node.name === 'script')) return;

    if (node.type === 'tag' && node.name === 'a') {
      const href = $(node).attr('href');
      if (href) links.push({ url: href });
      node.children?.forEach((child) => walk(child as typeof node, true));
      return;
    }

    if (node.type === 'tag' && node.name === 'button') {
      node.children?.forEach((child) => walk(child as typeof node, true));
      return;
    }

    if (node.type === 'tag') {
      if (node.name === 'img') {
        const src = $(node).attr('src');
        if (src) items.push({ type: 'image', url: src });
      } else if (node.name === 'video') {
        const src = $(node).attr('src') ?? $(node).find('source').first().attr('src');
        if (src) items.push({ type: 'video', url: src });
      }
    }

    if (node.type === 'text' && !inLink) {
      if ($(node).parents('svg').length) return;
      const text = (node.data ?? '').replace(/\s+/g, ' ').trim();
      if (!text) return;
      const looksLikeCss =
        /{[^}]*}/.test(text) && /;/.test(text) && /(\.|#)[a-zA-Z0-9_-]+\s*\{/.test(text);
      if (looksLikeCss) return;
      items.push({ type: 'text', content: text });
    }

    node.children?.forEach((child) => walk(child as typeof node, inLink));
  };

  const body = $('body').get(0);
  if (body) walk(body);

  const images = items.filter((i): i is ImageItem => i.type === 'image');
  const videos = items.filter((i): i is VideoItem => i.type === 'video');

  const accentColors = extractAccentColors($, html);
  return { url, items, images, videos, links, accentColors };
}

const HEX = /#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})\b/g;
const RGB = /rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*[\d.]+)?\s*\)/g;

function rgbToHex(r: number, g: number, b: number): string {
  const hex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

function normalizeHex(hex: string): string {
  const h = hex.replace(/^#/, '');
  if (h.length === 3) return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toLowerCase();
  if (h.length === 6 || h.length === 8) return `#${h.slice(0, 6)}`.toLowerCase();
  return hex;
}

function extractAccentColors($: ReturnType<typeof cheerio.load>, html: string): string[] {
  const seen = new Set<string>();

  const add = (hex: string) => {
    const normalized = normalizeHex(hex);
    if (/^#[0-9a-f]{6}$/.test(normalized)) seen.add(normalized);
  };

  const textSources: string[] = [html];

  $('meta[name="theme-color"], meta[name="msapplication-TileColor"]').each((_, el) => {
    const content = $(el).attr('content')?.trim();
    if (content) textSources.push(content);
  });

  $('style').each((_, el) => {
    const text = $(el).html();
    if (text) textSources.push(text);
  });

  $('[style]').each((_, el) => {
    const style = $(el).attr('style');
    if (style) textSources.push(style);
  });

  const combined = textSources.join(' ');
  let m: RegExpExecArray | null;
  HEX.lastIndex = 0;
  while ((m = HEX.exec(combined)) !== null) add(m[0]);
  RGB.lastIndex = 0;
  while ((m = RGB.exec(combined)) !== null) {
    add(rgbToHex(Number(m[1]), Number(m[2]), Number(m[3])));
  }

  return [...seen];
}
