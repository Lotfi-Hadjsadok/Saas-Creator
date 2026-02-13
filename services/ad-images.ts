import { buildImageBasePrompt, buildImageFullPrompt } from '@/lib/prompts';
import { replicateRun } from '@/lib/replicate';
import type {
  CopyCreative,
  CreativeAdResult,
  CreativeDesignResult,
  DesignTextStyling,
  GenerateAdImagesResult,
  HighlightStyle,
  TextWithPosition,
} from '@/types';
import { toAbsoluteImageUris, MAX_IMAGES_IMAGE } from './image-utils';

/** Merge design spec + one copy creative into full CreativeAdResult */
export function mergeDesignAndCopy(
  design: CreativeDesignResult,
  copy: CopyCreative,
): CreativeAdResult {
  const toText = (styling: DesignTextStyling, text: string): TextWithPosition => ({
    text,
    position: styling.position ?? 'center',
    fontFamily: styling.fontFamily,
    fontSize: styling.fontSize,
    fontWeight: styling.fontWeight,
    highlight: styling.highlight,
  });
  return {
    accentColor: design.accentColor,
    fontWeight: design.headline.fontWeight ?? 'bold',
    fontFamily: design.headline.fontFamily ?? 'Inter',
    headline: toText(design.headline, copy.headline),
    subheadline: toText(design.subheadline, copy.subheadline),
    cta: toText(design.cta, copy.cta),
    additionalText: toText(design.additionalText, copy.additionalText),
    useReferenceImage: design.useReferenceImage,
    imageDetails: design.imageDetails,
  };
}

function resolveImageUrl(
  modelOutput:
    | { url?: string | (() => string); output?: (string | { url?: string | (() => string) })[] }
    | string[],
): string {
  const outputItems = Array.isArray(modelOutput) ? modelOutput : modelOutput.output ?? [];
  const firstItem = outputItems[0];
  const urlOrGetter =
    typeof firstItem === 'string'
      ? firstItem
      : (firstItem as { url?: string | (() => string) })?.url ??
        (modelOutput as { url?: string | (() => string) }).url;
  const urlValue = typeof urlOrGetter === 'function' ? urlOrGetter() : urlOrGetter ?? '';
  return typeof urlValue === 'string' ? urlValue : urlValue instanceof URL ? urlValue.href : String(urlValue);
}

function normalizeStyling(rawStyling: Record<string, unknown>): DesignTextStyling {
  return {
    fontFamily: typeof rawStyling.fontFamily === 'string' ? rawStyling.fontFamily : undefined,
    fontSize: typeof rawStyling.fontSize === 'string' ? rawStyling.fontSize : undefined,
    fontWeight: typeof rawStyling.fontWeight === 'string' ? rawStyling.fontWeight : undefined,
    position: typeof rawStyling.position === 'string' ? rawStyling.position : 'center',
    highlight: ['none', 'circle', 'highlight', 'underline', 'overline'].includes(
      String(rawStyling.highlight ?? ''),
    )
      ? (rawStyling.highlight as HighlightStyle)
      : undefined,
  };
}

function parseDesignSpec(rawDesignSpec: Record<string, unknown>): CreativeDesignResult {
  return {
    accentColor: String(rawDesignSpec.accentColor ?? '#3B82F6'),
    headline: normalizeStyling((rawDesignSpec.headline as Record<string, unknown>) ?? {}),
    subheadline: normalizeStyling((rawDesignSpec.subheadline as Record<string, unknown>) ?? {}),
    cta: normalizeStyling((rawDesignSpec.cta as Record<string, unknown>) ?? {}),
    additionalText: normalizeStyling(
      (rawDesignSpec.additionalText as Record<string, unknown>) ?? {},
    ),
    useReferenceImage: rawDesignSpec.useReferenceImage === true,
    imageDetails: String(rawDesignSpec.imageDetails ?? ''),
  };
}

export async function generateAdImages(
  designsJson: string,
  creativesJson: string,
  baseUrl: string | null,
  rawImageUrls: string[],
  singleIndex: number | null,
  existingUrls: [string, string, string],
): Promise<GenerateAdImagesResult> {
  const imageUrls = toAbsoluteImageUris(rawImageUrls, baseUrl, MAX_IMAGES_IMAGE);

  if (!designsJson.trim()) return { error: 'No design data. Run the design agent first.' };
  if (!creativesJson.trim()) return { error: 'No creatives. Run the copy agent first.' };

  let designs: [CreativeDesignResult, CreativeDesignResult, CreativeDesignResult];
  let creatives: [CopyCreative, CopyCreative, CopyCreative];
  try {
    const designsParsed = JSON.parse(designsJson) as unknown;
    const designSpecsArray = Array.isArray(designsParsed) ? designsParsed : [designsParsed];
    designs = [
      parseDesignSpec((designSpecsArray[0] as Record<string, unknown>) ?? {}),
      parseDesignSpec((designSpecsArray[1] as Record<string, unknown>) ?? {}),
      parseDesignSpec((designSpecsArray[2] as Record<string, unknown>) ?? {}),
    ];
  } catch {
    return { error: 'Invalid designs JSON.' };
  }
  try {
    const creativesParsed = JSON.parse(creativesJson) as { creatives?: unknown[] } | unknown[];
    const creativesArray = Array.isArray(creativesParsed)
      ? creativesParsed
      : Array.isArray((creativesParsed as { creatives?: unknown[] }).creatives)
        ? (creativesParsed as { creatives: unknown[] }).creatives
        : [];
    creatives = [
      { headline: '', subheadline: '', cta: '', additionalText: '' },
      { headline: '', subheadline: '', cta: '', additionalText: '' },
      { headline: '', subheadline: '', cta: '', additionalText: '' },
    ];
    creativesArray.slice(0, 3).forEach((rawCreative, creativeIndex) => {
      const rawCreativeFields = rawCreative as Record<string, unknown>;
      creatives[creativeIndex] = {
        headline: String(rawCreativeFields?.headline ?? ''),
        subheadline: String(rawCreativeFields?.subheadline ?? ''),
        cta: String(rawCreativeFields?.cta ?? ''),
        additionalText: String(rawCreativeFields?.additionalText ?? ''),
      };
    });
  } catch {
    return { error: 'Invalid creatives JSON.' };
  }

  const generatedImageUrls: [string, string, string] = [...existingUrls];
  const creativeIndicesToRun = singleIndex >= 0 && singleIndex <= 2 ? [singleIndex] : [0, 1, 2];

  for (const creativeIndex of creativeIndicesToRun) {
    const designSpec = designs[creativeIndex];
    if (!designSpec) {
      return { error: `Design spec ${creativeIndex + 1} is missing.` };
    }
    const useReferenceImages = designSpec.useReferenceImage && imageUrls.length > 0;
    const imageConcept = designSpec.imageDetails.trim();
    const basePrompt = buildImageBasePrompt(useReferenceImages, imageConcept);
    const referenceImagesForModel = useReferenceImages ? imageUrls : [];
    const creativeWithDesign = mergeDesignAndCopy(designSpec, creatives[creativeIndex]);
    const fullPrompt = buildImageFullPrompt(
      basePrompt,
      creativeWithDesign.headline.text,
      creativeWithDesign.subheadline.text,
      creativeWithDesign.cta.text,
      creativeWithDesign.additionalText?.text,
    );
    try {
      const replicateInput: Record<string, unknown> = {
        prompt: fullPrompt,
        aspect_ratio: '1:1',
        resolution: '2K',
      };
      if (referenceImagesForModel.length > 0) replicateInput.image_input = referenceImagesForModel;
      const replicateResponse = await replicateRun('google/nano-banana-pro', replicateInput);
      generatedImageUrls[creativeIndex] = resolveImageUrl(replicateResponse);
    } catch (error) {
      generatedImageUrls[creativeIndex] = '';
      return { error: `Image ${creativeIndex + 1} failed: ${(error as Error).message}` };
    }
  }
  return { imageUrls: generatedImageUrls };
}
