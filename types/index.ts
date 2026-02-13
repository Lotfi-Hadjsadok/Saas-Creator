export type ContentItem =
  | { type: 'text'; content: string }
  | { type: 'image'; url: string }
  | { type: 'video'; url: string };

export type LinkItem = { url: string };
export type ImageItem = Extract<ContentItem, { type: 'image' }>;
export type VideoItem = Extract<ContentItem, { type: 'video' }>;

export type HighlightStyle = 'none' | 'circle' | 'highlight' | 'underline' | 'overline';

export type TextWithPosition = {
  text: string;
  position: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  highlight?: HighlightStyle;
};

export type ExtractResult = {
  url: string;
  items: ContentItem[];
  images: ImageItem[];
  videos: VideoItem[];
  links: LinkItem[];
  /** Accent/brand colors extracted from theme-color, CSS, and inline styles (hex). */
  accentColors: string[];
};

/** Agent 1 — Copy: one creative variant (copy only) */
export type CopyCreative = {
  headline: string;
  subheadline: string;
  cta: string;
  additionalText: string;
};

/** Agent 1 output: 3 creatives with different marketing angles */
export type CopyAgentResult = {
  creatives?: [CopyCreative, CopyCreative, CopyCreative];
  error?: string;
};

/** Agent 2 — Design: styling for text elements (no copy text) */
export type DesignTextStyling = {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  position?: string;
  highlight?: HighlightStyle;
};

/** Agent 2 output: design spec extracted from copy + images */
export type CreativeDesignResult = {
  accentColor: string;
  headline: DesignTextStyling;
  subheadline: DesignTextStyling;
  cta: DesignTextStyling;
  additionalText: DesignTextStyling;
  useReferenceImage: boolean;
  imageDetails: string;
};

export type DesignAgentResult = {
  designs?: [CreativeDesignResult, CreativeDesignResult, CreativeDesignResult];
  error?: string;
};

/** Full creative (design + copy) used for display and image generation */
export type CreativeAdResult = {
  accentColor: string;
  fontWeight: string;
  fontFamily: string;
  headline: TextWithPosition;
  subheadline: TextWithPosition;
  cta: TextWithPosition;
  additionalText?: TextWithPosition;
  useReferenceImage: boolean;
  imageDetails: string;
};

export type GenerateAdCopyResult = {
  creative?: CreativeAdResult;
  error?: string;
};

export type GenerateAdImageResult = {
  imageUrl?: string;
  error?: string;
};

/** Agent 3 — Image: one image per creative (3 images) */
export type GenerateAdImagesResult = {
  imageUrls?: [string, string, string];
  error?: string;
};
