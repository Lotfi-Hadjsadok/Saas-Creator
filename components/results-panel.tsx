"use client";

import {
  CopyResult,
  DesignResult,
  ImagesResult,
} from "@/components/generate-ad-copy";
import type {
  ExtractResult,
  CopyAgentResult,
  DesignAgentResult,
  GenerateAdImagesResult,
} from "@/types";

type ResultsPanelProps = {
  extractState: ExtractResult;
  adCopyResult: CopyAgentResult;
  adCopyPending: boolean;
  designResult: DesignAgentResult;
  designPending: boolean;
  adImagesResult: GenerateAdImagesResult;
  adImagesPending: boolean;
};

export function ResultsPanel({
  extractState,
  adCopyResult,
  adCopyPending,
  designResult,
  designPending,
  adImagesResult,
  adImagesPending,
}: ResultsPanelProps) {
  const textCount = extractState.items.filter((i) => i.type === "text").length;
  const hasExtract = extractState.url && (textCount > 0 || extractState.images.length > 0);
  const hasGeneratedImages =
    adImagesResult.imageUrls?.some(Boolean) && !adImagesResult.error && !adImagesPending;
  const showImagesOnly = adImagesPending || hasGeneratedImages;

  return (
    <main className="flex-1 overflow-y-auto min-h-0 page-gradient">
      <div
        className={
          showImagesOnly
            ? "flex flex-col py-6 px-6 max-w-6xl mx-auto"
            : "flex flex-col py-8 px-6 max-w-3xl mx-auto"
        }
      >
        {!showImagesOnly && (
          <>
        <div className="w-full space-y-2 mb-8">
          <p className="text-xs font-medium uppercase tracking-widest text-primary/80">
            Results
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Your ads underperform because they don’t speak to your audience.
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We turn your site into on-brand headlines, CTAs, and creatives—so you stop wasting spend on generic copy.
          </p>
        </div>

        {hasExtract && (
          <section className="w-full mb-8 rounded-xl border bg-muted/20 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Extracted
            </p>
            <p className="text-sm font-mono text-muted-foreground truncate" title={extractState.url}>
              {extractState.url}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {textCount} text chunk{textCount !== 1 ? "s" : ""}, {extractState.images.length} image
              {extractState.images.length !== 1 ? "s" : ""}
              {extractState.links.length > 0 && `, ${extractState.links.length} links`}
            </p>
          </section>
        )}

        <section className="w-full space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
              Ad creatives (copy)
            </p>
            <CopyResult result={adCopyResult} isPending={adCopyPending} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
              Design specs
            </p>
            <DesignResult result={designResult} isPending={designPending} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
              Generated ad creatives
            </p>
            <ImagesResult result={adImagesResult} isPending={adImagesPending} />
          </div>
        </section>
          </>
        )}

        {showImagesOnly && (
          <section className="w-full">
            <ImagesResult result={adImagesResult} isPending={adImagesPending} large />
          </section>
        )}
      </div>
    </main>
  );
}
