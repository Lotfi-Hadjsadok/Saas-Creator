import { buildDesignPrompt } from '@/lib/prompts';
import { replicateRun } from '@/lib/replicate';
import type {
  CreativeDesignResult,
  DesignAgentResult,
  DesignTextStyling,
  HighlightStyle,
} from '@/types';
import { toAbsoluteImageUris, MAX_IMAGES_IMAGE } from './image-utils';

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

export async function generateCreativeDesign(
  creativesJson: string,
  url: string,
  rawImageUrls: string[],
  extractedAccentColors: string[] = [],
): Promise<DesignAgentResult> {
  const imageUrls = toAbsoluteImageUris(rawImageUrls, url || null, MAX_IMAGES_IMAGE);

  if (!creativesJson.trim()) return { error: 'No creatives provided. Run the copy agent first.' };

  const prompt = buildDesignPrompt(creativesJson, extractedAccentColors);

  try {
    const replicateResponse = await replicateRun('google/gemini-2.5-flash', {
      prompt,
      images: imageUrls,
      videos: [],
      dynamic_thinking: false,
    });
    const responseText = Array.isArray(replicateResponse) ? replicateResponse.join('') : String(replicateResponse);
    const parsedResponse = JSON.parse(responseText.replace(/^```json?\s*|\s*```$/g, '').trim()) as unknown;
    const designSpecsArray = Array.isArray(parsedResponse) ? parsedResponse : [parsedResponse];
    const parseDesignSpec = (rawDesignSpec: Record<string, unknown>): CreativeDesignResult => ({
      accentColor: String(rawDesignSpec.accentColor ?? '#3B82F6'),
      headline: normalizeStyling((rawDesignSpec.headline as Record<string, unknown>) ?? {}),
      subheadline: normalizeStyling((rawDesignSpec.subheadline as Record<string, unknown>) ?? {}),
      cta: normalizeStyling((rawDesignSpec.cta as Record<string, unknown>) ?? {}),
      additionalText: normalizeStyling((rawDesignSpec.additionalText as Record<string, unknown>) ?? {}),
      useReferenceImage: rawDesignSpec.useReferenceImage === true,
      imageDetails: String(rawDesignSpec.imageDetails ?? ''),
    });
    const designs: [CreativeDesignResult, CreativeDesignResult, CreativeDesignResult] = [
      parseDesignSpec((designSpecsArray[0] as Record<string, unknown>) ?? {}),
      parseDesignSpec((designSpecsArray[1] as Record<string, unknown>) ?? {}),
      parseDesignSpec((designSpecsArray[2] as Record<string, unknown>) ?? {}),
    ];
    return { designs };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
