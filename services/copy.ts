import { buildCopyPrompt } from '@/lib/prompts';
import { replicateRun } from '@/lib/replicate';
import type { CopyAgentResult, CopyCreative } from '@/types';
import { toAbsoluteImageUris, MAX_IMAGES_IMAGE } from './image-utils';

export async function generateAdCopy(
  content: string,
  url: string,
  rawImageUrls: string[],
): Promise<CopyAgentResult> {
  const imageUrls = toAbsoluteImageUris(rawImageUrls, url || null, MAX_IMAGES_IMAGE);
  const prompt = buildCopyPrompt(url, imageUrls.length > 0, content);

  try {
    const raw = await replicateRun('google/gemini-2.5-flash', {
      prompt,
      images: imageUrls,
      dynamic_thinking: false,
    });
    const output = Array.isArray(raw) ? raw.join('') : String(raw);
    const parsed = JSON.parse(output.replace(/^```json?\s*|\s*```$/g, '').trim()) as {
      creatives?: unknown[];
    };
    const list = Array.isArray(parsed.creatives) ? parsed.creatives.slice(0, 3) : [];
    const creatives: [CopyCreative, CopyCreative, CopyCreative] = [
      { headline: '', subheadline: '', cta: '', additionalText: '' },
      { headline: '', subheadline: '', cta: '', additionalText: '' },
      { headline: '', subheadline: '', cta: '', additionalText: '' },
    ];
    list.forEach((c, i) => {
      if (i >= 3) return;
      const o = c as Record<string, unknown>;
      creatives[i] = {
        headline: String(o?.headline ?? ''),
        subheadline: String(o?.subheadline ?? ''),
        cta: String(o?.cta ?? ''),
        additionalText: String(o?.additionalText ?? ''),
      };
    });
    return { creatives };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
