'use server'

import * as cheerio from 'cheerio';
import { chromium } from 'playwright';

type ContentItem =
  | { type: 'text'; content: string }
  | { type: 'image'; url: string }
  | { type: 'video'; url: string };

type LinkItem = { url: string };

type ImageItem = Extract<ContentItem, { type: 'image' }>;
type VideoItem = Extract<ContentItem, { type: 'video' }>;

export type ExtractResult = {
  url: string;
  items: ContentItem[];
  images: ImageItem[];
  videos: VideoItem[];
  links: LinkItem[];
};

export async function extractWebsite(
  _prevState: ExtractResult,
  formData: FormData,
): Promise<ExtractResult> {
  const url = (formData.get('url') as string) ?? '';

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  const html = await page.content();

  await browser.close();

  const $ = cheerio.load(html);

  const items: ContentItem[] = [];
  const links: LinkItem[] = [];

  const walk = (node: any, inLink: boolean = false) => {
    // Skip scripts completely
    if (
      node.type === 'script' ||
      (node.type === 'tag' && node.name === 'script')
    ) {
      return;
    }

    if (node.type === 'tag') {
      if (node.name === 'a') {
        const el = $(node);
        const href = el.attr('href');
        if (href) {
          links.push({ url: href });
        }
        // Do not capture text inside links as content,
        // but still walk children so we keep nested images/videos.
        if ('children' in node && Array.isArray(node.children)) {
          for (const child of node.children) {
            walk(child, true);
          }
        }
        return;
      }

      if (node.name === 'button') {
        // Ignore button text but still traverse children (for nested images/videos)
        if ('children' in node && Array.isArray(node.children)) {
          for (const child of node.children) {
            walk(child, true);
          }
        }
        return;
      }

      if (node.name === 'img') {
        const el = $(node);
        const src = el.attr('src');
        if (src) {
          items.push({
            type: 'image',
            url: src,
          });
        }
      } else if (node.name === 'video') {
        const el = $(node);
        let src = el.attr('src');

        if (!src) {
          const source = el.find('source').first();
          src = source.attr('src');
        }

        if (src) {
          items.push({
            type: 'video',
            url: src,
          });
        }
      }
    }

    if (node.type === 'text') {
      if (inLink) {
        return;
      }
      // Skip any text that is inside an <svg> (style defs, labels like "SOOQME2SVG", etc.)
      const isInsideSvg = $(node).parents('svg').length > 0;
      if (isInsideSvg) {
        return;
      }

      const raw = node.data ?? '';
      const text = raw.replace(/\s+/g, ' ').trim();
      if (!text) {
        return;
      }

      // Skip CSS‑like chunks such as ".st0 { fill: ... }"
      const looksLikeCss =
        /{[^}]*}/.test(text) &&
        /;/.test(text) &&
        /(\.|#)[a-zA-Z0-9_-]+\s*\{/.test(text);
      if (looksLikeCss) {
        return;
      }

      items.push({
        type: 'text',
        content: text,
      });
    }

    if ('children' in node && Array.isArray(node.children)) {
      for (const child of node.children) {
        walk(child, inLink);
      }
    }
  };

  const body = $('body').get(0);
  if (body) {
    walk(body);
  }

  const images: ImageItem[] = items.filter(
    (item): item is ImageItem => item.type === 'image',
  );

  const videos: VideoItem[] = items.filter(
    (item): item is VideoItem => item.type === 'video',
  );


  return {
    url,
    items,
    images,
    videos,
    links,
  };
}