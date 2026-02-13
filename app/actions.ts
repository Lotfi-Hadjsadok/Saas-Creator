'use server';

import type {
  CopyAgentResult,
  DesignAgentResult,
  ExtractResult,
  GenerateAdImagesResult,
} from '@/types';
import { generateAdImages as generateAdImagesService } from '@/services/ad-images';
import { generateAdCopy as generateAdCopyService } from '@/services/copy';
import { generateCreativeDesign as generateCreativeDesignService } from '@/services/design';
import { extractWebsite as extractWebsiteService } from '@/services/extract';

export async function extractWebsite(
  _prevState: ExtractResult,
  formData: FormData,
): Promise<ExtractResult> {
  const url = (formData.get('url') as string) ?? '';
  return extractWebsiteService(url);
}

export async function generateAdCopy(
  _prevState: CopyAgentResult,
  formData: FormData,
): Promise<CopyAgentResult> {
  const content = (formData.get('content') as string) ?? '';
  const url = (formData.get('url') as string) ?? '';
  const imagesJson = formData.get('images') as string | null;
  const rawImageUrls = imagesJson ? (JSON.parse(imagesJson) as string[]) : [];
  return generateAdCopyService(content, url, rawImageUrls);
}

export async function generateCreativeDesign(
  _prevState: DesignAgentResult,
  formData: FormData,
): Promise<DesignAgentResult> {
  const creativesJson = (formData.get('creatives') as string)?.trim() ?? '';
  const url = (formData.get('url') as string) ?? '';
  const imagesJson = formData.get('images') as string | null;
  const rawImageUrls = imagesJson ? (JSON.parse(imagesJson) as string[]) : [];
  const accentColorsJson = formData.get('accentColors') as string | null;
  const extractedAccentColors = accentColorsJson ? (JSON.parse(accentColorsJson) as string[]) : [];
  return generateCreativeDesignService(creativesJson, url, rawImageUrls, extractedAccentColors);
}

export async function generateAdImages(
  _prevState: GenerateAdImagesResult,
  formData: FormData,
): Promise<GenerateAdImagesResult> {
  const designsJson = (formData.get('designs') as string)?.trim() ?? '';
  const creativesJson = (formData.get('creatives') as string)?.trim() ?? '';
  const baseUrl = (formData.get('url') as string)?.trim() || null;
  const imagesJson = formData.get('images') as string | null;
  const rawImageUrls = imagesJson ? (JSON.parse(imagesJson) as string[]) : [];
  const indexRaw = formData.get('index') as string | null;
  const singleIndex =
    indexRaw !== null && indexRaw !== '' ? parseInt(indexRaw, 10) : null;
  const existingJson = formData.get('existingImageUrls') as string | null;
  let existingUrls: [string, string, string] = ['', '', ''];
  if (existingJson) {
    try {
      const parsed = JSON.parse(existingJson) as string[];
      existingUrls = [
        String(parsed[0] ?? ''),
        String(parsed[1] ?? ''),
        String(parsed[2] ?? ''),
      ];
    } catch {
      /**/
    }
  }
  return generateAdImagesService(
    designsJson,
    creativesJson,
    baseUrl,
    rawImageUrls,
    singleIndex,
    existingUrls,
  );
}
