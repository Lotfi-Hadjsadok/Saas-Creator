/** Agent 1 — Copy: schema for 3 creatives (headline, subheadline, cta, additionalText) */
export const COPY_SCHEMA = {
  creatives:
    'array of exactly 3 objects. Each object: { headline, subheadline, cta, additionalText }. Different angle per creative (e.g. benefit-led, urgency, social proof).',
};

export function buildCopyPrompt(url: string, hasImages: boolean, content: string): string {
  const prompt = {
    role: 'senior creative copywriter for Arabic-language campaigns',
    task: 'Create exactly 3 ad creatives in Arabic that feel bold, memorable, and distinctly different from each other. All text MUST be in correct, natural Arabic only.',
    language: 'STRICT: Every headline, subheadline, cta, and additionalText MUST be written in proper Arabic (الفصحى or clear dialect). Use correct Arabic script, spelling, diacritics only when helpful, and natural grammar. No English or mixed language. Convert any concept from the website into natural Arabic.',
    responseFormat: 'Return ONLY valid JSON (no markdown). Single object with key "creatives": array of exactly 3 objects.',
    outputSchema: {
      creatives: [
        {
          headline: 'string, max 40 chars (Arabic), punchy and creative—strong hook in Arabic',
          subheadline: 'string, max 80 chars (Arabic), clear benefit or emotional payoff in natural Arabic',
          cta: 'string, short call-to-action in Arabic (e.g. ابدأ الآن، جرّب مجاناً، اكتشف المزيد، احصل عليه، سجّل الآن)',
          additionalText: 'string, optional; urgency, proof, or intrigue in Arabic',
        },
      ],
    },
    rules: {
      angles: '3 clearly distinct creative angles (e.g. bold benefit, curiosity/tease, social proof, contrarian, emotional/aspirational)',
      tone: 'on-brand but not generic; each creative = different campaign idea; prioritise memorability and click-worthiness',
      arabicOnly: 'All output text must be in correct Arabic. If website content is in English or another language, translate and adapt the message into natural, compelling Arabic suitable for ads.',
    },
    input: {
      url,
      hasReferenceImages: hasImages,
      websiteContent: content,
    },
  };
  return JSON.stringify(prompt, null, 2);
}

/** Agent 2 — Design: one design spec per creative */
const DESIGN_SPEC_KEYS = {
  accentColor: 'string - hex color e.g. #3B82F6',
  headline: 'object - { fontFamily?, fontSize?, fontWeight?, position?, highlight? } - styling only',
  subheadline: 'object - same keys',
  cta: 'object - same keys',
  additionalText:
    'object - same keys. highlight one of: none, circle, highlight, underline, overline',
  useReferenceImage:
    'boolean - your creative choice: use reference images in the ad or not; whatever best serves this creative',
  imageDetails:
    'string - your full creative vision: describe the ad image like a creative director. Include style (e.g. editorial, cinematic, bold minimal, motion-blur, duotone), mood, composition (focal point, negative space, layering), and any striking visual treatment (gradients, light leaks, typography-as-hero, product-in-scene). Aim for scroll-stopping, campaign-quality visuals—not generic stock. Be specific and bold.',
};

export const DESIGN_SCHEMA = {
  designs:
    'array of exactly 3 objects. Each object is a design spec for the corresponding creative (index 0 for creative 0, etc.). Same keys per spec: accentColor, headline, subheadline, cta, additionalText, useReferenceImage, imageDetails. Each design can differ to match its creative angle.',
  designSpecKeys: DESIGN_SPEC_KEYS,
};

export function buildDesignPrompt(creativesJson: string, extractedAccentColors: string[] = []): string {
  const prompt = {
    role: 'creative director and visual designer for premium ad campaigns',
    task: 'Create exactly 3 design specs—one per creative. Each spec must be a distinct creative concept: different visual language, mood, and image treatment so the 3 ads look like a strong campaign set.',
    responseFormat: 'Return ONLY valid JSON (no markdown). A single JSON array of exactly 3 design objects: [ designForCreative0, designForCreative1, designForCreative2 ].',
    outputSchema: {
      designSpecKeys: DESIGN_SPEC_KEYS,
      positionValues: ['top-left', 'center', 'top-right', 'bottom-left', 'bottom-right'],
      highlightValues: ['none', 'circle', 'highlight', 'underline', 'overline'],
    },
    guidelines: {
      accentColor:
        extractedAccentColors.length > 0
          ? `MUST derive accent colors from the extracted brand colors below and/or from dominant colors in the reference images. Use only these hex values (or close variants) so ads stay on-brand: ${extractedAccentColors.join(', ')}. Pick one per creative, vary for contrast.`
          : 'bold, distinctive hex per creative (vary for contrast and mood—e.g. electric blue, deep coral, forest green). If reference images are provided, derive accent colors from dominant colors in those images.',
      typography: 'headline, subheadline, cta, additionalText: styling only. Use typography boldly—large headlines, contrast in weight, intentional placement.',
      useReferenceImage: 'true when reference image can be the hero of this ad; false when a fully generated concept will be stronger.',
      imageDetails: 'Creative brief: style (e.g. editorial magazine ad, cinematic product shot, bold geometric minimal), composition (what is in frame, focal point, negative space), one striking visual hook (e.g. dramatic lighting, duotone, glassmorphism). Cool, campaign-quality ad representation.',
    },
    input: {
      creatives: creativesJson,
      extractedAccentColors:
        extractedAccentColors.length > 0
          ? extractedAccentColors
          : 'none—choose bold hex colors and/or derive from reference images.',
      note: 'Design index 0 = first creative, 1 = second, 2 = third. All creative copy (headline, subheadline, cta, additionalText) is in Arabic—consider RTL-friendly typography and placement.',
    },
  };
  return JSON.stringify(prompt, null, 2);
}

/** Agent 3 — Image: prompt as 100% JSON */
const AD_FORMAT_JSON = {
  format: '1:1 square ad image for paid social and display',
  goal: 'Scroll-stopping, campaign-quality creative ad. Clear visual hierarchy, one strong focal point, intentional space for headline and CTA designed-in, not pasted. Premium brand campaign or editorial ad—bold, distinctive, memorable.',
  conversionTactics: 'Strong contrast and depth so copy pops; premium lighting and polish; one clear visual hook (glow, accent color, badge, or focal element). Cool ads representation: stands out in feeds, intentional and crafted.',
  language: 'All copy (headline, subheadline, CTA, additionalText) is in Arabic. Render text right-to-left (RTL) where typography appears in the image; ensure Arabic script is legible and correctly oriented.',
};

const CLEAN_VISUAL_JSON = {
  ...AD_FORMAT_JSON,
  mode: 'no screenshot or product photo',
  style: 'Bold creative ad visual: refined typography, striking gradient or geometric accent, aspirational and premium. Editorial style, duotone, bold minimal layout, or cinematic lighting. Intentional negative space. Winning creative ad.',
};

const REF_IMAGE_JSON = {
  ...AD_FORMAT_JSON,
  mode: 'Use the reference image as the hero',
  style: 'Transform into conversion-ready creative ad: preserve product/dashboard/UI but elevate—device mockup or frame, one metric or element highlighted (glow or badge), gradient or overlay for text readability, premium lighting and sharpness. Center key content in 1:1 frame. Cool, winning ad—polished and campaign-quality, not raw screenshot.',
};

const FALLBACK_CLEAN_JSON = { ...CLEAN_VISUAL_JSON, fallback: 'Bold creative ad with clear hierarchy: headline and CTA as payoff, one striking visual hook—editorial or campaign-style, not generic.' };
const FALLBACK_REF_JSON = { ...REF_IMAGE_JSON, fallback: 'Elevate reference into premium 1:1 creative ad: device mockup or highlighted key element, polished lighting, clear space for copy, campaign-quality finish.' };

export const CLEAN_VISUAL_DIRECTIVE = JSON.stringify(CLEAN_VISUAL_JSON);
export const REF_IMAGE_DIRECTIVE = JSON.stringify(REF_IMAGE_JSON);

export function buildImageBasePrompt(useReferenceImage: boolean, concept: string): string {
  const creativeDirection = concept ? { creativeDirection: concept } : null;
  const base = useReferenceImage
    ? { ...REF_IMAGE_JSON, ...(creativeDirection ?? { fallback: FALLBACK_REF_JSON.fallback }) }
    : { ...CLEAN_VISUAL_JSON, ...(creativeDirection ?? { fallback: FALLBACK_CLEAN_JSON.fallback }) };
  return JSON.stringify(base, null, 2);
}

export function buildImageFullPrompt(
  basePrompt: string,
  headline: string,
  subheadline: string,
  cta: string,
  additionalText?: string,
): string {
  const copy = {
    headline: { role: 'main hook', text: headline },
    subheadline: { text: subheadline },
    cta: { role: 'button or label', text: cta },
    ...(additionalText ? { additionalText: { role: 'supporting line', text: additionalText } } : {}),
  };
  const full: Record<string, unknown> = typeof basePrompt === 'string' && basePrompt.startsWith('{') ? { ...JSON.parse(basePrompt), copy } : { instruction: basePrompt, copy };
  return JSON.stringify(full, null, 2);
}
