"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  ExtractResult,
  CopyAgentResult,
  DesignAgentResult,
  GenerateAdImagesResult,
  CopyCreative,
  CreativeDesignResult,
  TextWithPosition,
  CreativeAdResult,
} from "@/types";
import { cn } from "@/lib/utils";

function getContentFromExtract(state: ExtractResult): string {
  return state.items
    .filter((i): i is { type: "text"; content: string } => i.type === "text" && !!i.content)
    .map((i) => i.content)
    .join("\n\n");
}

function StyledText({
  el,
  creative,
  defaultSize = "1rem",
  className,
}: {
  el: TextWithPosition;
  creative: CreativeAdResult;
  defaultSize?: string;
  className?: string;
}) {
  const fontFamily = el.fontFamily ?? creative.fontFamily;
  const fontSize = el.fontSize ?? defaultSize;
  const fontWeight = el.fontWeight ?? creative.fontWeight;
  const highlight = el.highlight ?? "none";

  const style: React.CSSProperties = {
    fontFamily: fontFamily ? (fontFamily.includes(" ") ? `"${fontFamily}"` : fontFamily) : undefined,
    fontSize,
    fontWeight,
  };

  if (highlight === "circle") {
    return (
      <span
        className={cn("inline-flex items-center rounded-full px-2 py-0.5 font-medium", className)}
        style={{
          ...style,
          backgroundColor: creative.accentColor ? `${creative.accentColor}20` : undefined,
          color: creative.accentColor ?? undefined,
        }}
      >
        {el.text}
      </span>
    );
  }
  if (highlight === "highlight") {
    return (
      <span
        className={cn("rounded px-1 py-0.5 bg-yellow-200/60 dark:bg-yellow-500/30", className)}
        style={style}
      >
        {el.text}
      </span>
    );
  }
  if (highlight === "underline") {
    return (
      <span className={cn("underline decoration-2 underline-offset-2", className)} style={style}>
        {el.text}
      </span>
    );
  }
  if (highlight === "overline") {
    return (
      <span className={cn("overline decoration-2", className)} style={style}>
        {el.text}
      </span>
    );
  }
  return <span className={className} style={style}>{el.text}</span>;
}

type GenerateAdCopyProps = {
  state: ExtractResult;
  adCopyResult: CopyAgentResult;
  adCopyFormAction: (formData: FormData) => void;
  adCopyPending: boolean;
  designResult: DesignAgentResult;
  designFormAction: (formData: FormData) => void;
  designPending: boolean;
  adImagesResult: GenerateAdImagesResult;
  adImagesFormAction: (formData: FormData) => void;
  adImagesPending: boolean;
};

export function GenerateAdCopyForms({
  state,
  adCopyResult,
  adCopyFormAction,
  adCopyPending,
  designResult,
  designFormAction,
  designPending,
  adImagesResult,
  adImagesFormAction,
  adImagesPending,
}: GenerateAdCopyProps) {
  const content = getContentFromExtract(state);
  const imageUrls = state.images.map((img) => img.url);
  const canSubmit = content.trim() || state.images.length > 0;
  const creatives = adCopyResult.creatives;
  const designs = designResult.designs;
  const hasCreatives = creatives && creatives.length === 3;
  const hasDesigns = designs && designs.length === 3;
  const creativesJson = hasCreatives ? JSON.stringify(creatives) : "";
  const designsJson = hasDesigns ? JSON.stringify(designs) : "";
  return (
    <section className="space-y-4">
      <Card className="border-border/80 shadow-sm bg-card/95 backdrop-blur-sm">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold">Step 2 — Copy</CardTitle>
        </CardHeader>
        <CardContent className="py-0 px-4 pb-3">
          <form action={adCopyFormAction} className="space-y-2">
            <input type="hidden" name="content" value={content} />
            <input type="hidden" name="url" value={state.url} />
            <input type="hidden" name="images" value={JSON.stringify(imageUrls)} />
            <Button type="submit" disabled={adCopyPending || !canSubmit} size="sm" className="w-full font-medium">
              {adCopyPending ? "Generating…" : "Generate 3 creatives"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="border-border/80 shadow-sm bg-card/95 backdrop-blur-sm">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold">Step 3 — Design</CardTitle>
        </CardHeader>
        <CardContent className="py-0 px-4 pb-3">
          <form action={designFormAction} className="space-y-2">
            <input type="hidden" name="creatives" value={creativesJson} />
            <input type="hidden" name="url" value={state.url} />
            <input type="hidden" name="images" value={JSON.stringify(imageUrls)} />
            <Button type="submit" disabled={designPending || !hasCreatives} size="sm" className="w-full font-medium">
              {designPending ? "Extracting…" : "Generate design spec"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="border-border/80 shadow-sm bg-card/95 backdrop-blur-sm">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-semibold">Step 4 — Images</CardTitle>
        </CardHeader>
        <CardContent className="py-0 px-4 pb-3 space-y-2">
          <form action={adImagesFormAction} className="block">
            <input type="hidden" name="designs" value={designsJson} />
            <input type="hidden" name="creatives" value={creativesJson} />
            <input type="hidden" name="url" value={state.url} />
            <input type="hidden" name="images" value={JSON.stringify(imageUrls)} />
            <input type="hidden" name="existingImageUrls" value={JSON.stringify(adImagesResult.imageUrls ?? ["", "", ""])} />
            <Button type="submit" disabled={adImagesPending || !hasDesigns} size="sm" className="w-full font-medium">
              {adImagesPending ? "Generating…" : "Generate all 3"}
            </Button>
          </form>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-muted-foreground text-xs">Per image:</span>
            {([0, 1, 2] as const).map((idx) => (
              <form key={idx} action={adImagesFormAction} className="inline">
                <input type="hidden" name="designs" value={designsJson} />
                <input type="hidden" name="creatives" value={creativesJson} />
                <input type="hidden" name="url" value={state.url} />
                <input type="hidden" name="images" value={JSON.stringify(imageUrls)} />
                <input type="hidden" name="index" value={String(idx)} />
                <input type="hidden" name="existingImageUrls" value={JSON.stringify(adImagesResult.imageUrls ?? ["", "", ""])} />
                <Button type="submit" disabled={adImagesPending || !hasDesigns} variant="outline" size="sm">
                  {adImagesPending ? "…" : idx + 1}
                </Button>
              </form>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export function GenerateAdCopy({
  state,
  adCopyResult,
  adCopyFormAction,
  adCopyPending,
  designResult,
  designFormAction,
  designPending,
  adImagesResult,
  adImagesFormAction,
  adImagesPending,
}: GenerateAdCopyProps) {
  const content = getContentFromExtract(state);
  const imageUrls = state.images.map((img) => img.url);
  const canSubmit = content.trim() || state.images.length > 0;
  const creatives = adCopyResult.creatives;
  const designs = designResult.designs;
  const hasCreatives = creatives && creatives.length === 3;
  const hasDesigns = designs && designs.length === 3;
  const creativesJson = hasCreatives ? JSON.stringify(creatives) : "";
  const designsJson = hasDesigns ? JSON.stringify(designs) : "";
  const hasGeneratedImages =
    adImagesResult.imageUrls?.some(Boolean) &&
    !adImagesResult.error &&
    !adImagesPending;
  const showImagesOnly = adImagesPending || hasGeneratedImages;

  return (
    <section className="space-y-8">
      {!showImagesOnly && (
        <>
          <Card className="border-border/80 shadow-sm bg-card/95 backdrop-blur-sm">
            <CardHeader className="space-y-1.5">
              <CardTitle className="text-xl font-semibold tracking-tight">
                Step 2 — Agent 1: Copy (3 creatives)
              </CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Generate three ad creatives with different marketing angles: headline, subheadline, CTA, additional text. Output is JSON.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={adCopyFormAction} className="space-y-4">
                <input type="hidden" name="content" value={content} />
                <input type="hidden" name="url" value={state.url} />
                <input type="hidden" name="images" value={JSON.stringify(imageUrls)} />
                <Button type="submit" disabled={adCopyPending || !canSubmit} size="lg" className="font-medium">
                  {adCopyPending ? "Generating 3 creatives…" : "Generate 3 ad creatives"}
                </Button>
              </form>
              <CopyResult result={adCopyResult} isPending={adCopyPending} />
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-sm bg-card/95 backdrop-blur-sm">
            <CardHeader className="space-y-1.5">
              <CardTitle className="text-xl font-semibold tracking-tight">
                Step 3 — Agent 2: Creative & Design
              </CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pass the 3 creatives + images. Generate one design spec per creative: accentColor, headline/subheadline/CTA/additionalText styling (fontSize, highlight, etc.), and imageDetails. Output: 3 design specs (JSON array).
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={designFormAction} className="space-y-4">
                <input type="hidden" name="creatives" value={creativesJson} />
                <input type="hidden" name="url" value={state.url} />
                <input type="hidden" name="images" value={JSON.stringify(imageUrls)} />
                <input type="hidden" name="accentColors" value={JSON.stringify(state.accentColors ?? [])} />
                <Button type="submit" disabled={designPending || !hasCreatives} size="lg" className="font-medium">
                  {designPending ? "Extracting design…" : "Generate design spec"}
                </Button>
              </form>
              <DesignResult result={designResult} isPending={designPending} />
            </CardContent>
          </Card>
        </>
      )}

      <Card className="border-border/80 shadow-sm bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-1.5">
          <CardTitle className="text-xl font-semibold tracking-tight">
            Step 4 — Agent 3: Image generation
          </CardTitle>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Pass design + creatives + up to 14 reference images. Generate all 3 at once or one image at a time.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <form action={adImagesFormAction} className="inline">
              <input type="hidden" name="designs" value={designsJson} />
              <input type="hidden" name="creatives" value={creativesJson} />
              <input type="hidden" name="url" value={state.url} />
              <input type="hidden" name="images" value={JSON.stringify(imageUrls)} />
              <input type="hidden" name="existingImageUrls" value={JSON.stringify(adImagesResult.imageUrls ?? ['', '', ''])} />
              <Button type="submit" disabled={adImagesPending || !hasDesigns} size="lg" className="font-medium">
                {adImagesPending ? "Generating…" : "Generate all 3"}
              </Button>
            </form>
            <span className="text-muted-foreground text-sm">or per image:</span>
            {([0, 1, 2] as const).map((idx) => (
              <form key={idx} action={adImagesFormAction} className="inline">
                <input type="hidden" name="designs" value={designsJson} />
                <input type="hidden" name="creatives" value={creativesJson} />
                <input type="hidden" name="url" value={state.url} />
                <input type="hidden" name="images" value={JSON.stringify(imageUrls)} />
                <input type="hidden" name="index" value={String(idx)} />
                <input type="hidden" name="existingImageUrls" value={JSON.stringify(adImagesResult.imageUrls ?? ['', '', ''])} />
                <Button type="submit" disabled={adImagesPending || !hasDesigns} variant="outline" size="default">
                  {adImagesPending ? "…" : `Image ${idx + 1}`}
                </Button>
              </form>
            ))}
          </div>
          <ImagesResult result={adImagesResult} isPending={adImagesPending} large={showImagesOnly} />
        </CardContent>
      </Card>
    </section>
  );
}

export function CopyResult({ result, isPending }: { result: CopyAgentResult; isPending: boolean }) {
  if (isPending) {
    return (
      <div className="rounded-xl border border-dashed border-primary/20 bg-primary/5 p-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">Creating 3 creatives with different angles…</p>
      </div>
    );
  }
  if (result.error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">{result.error}</p>
      </div>
    );
  }
  const creatives = result.creatives;
  if (!creatives) return null;

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Output (JSON) — 3 creatives</p>
      <div className="grid gap-4 sm:grid-cols-3">
        {creatives.map((c: CopyCreative, i: number) => (
          <div key={i} className="rounded-xl border bg-muted/30 p-4 space-y-2" dir="rtl">
            <p className="text-xs font-medium text-muted-foreground" dir="ltr">Creative {i + 1}</p>
            <p className="text-sm font-semibold">{c.headline}</p>
            <p className="text-xs text-muted-foreground">{c.subheadline}</p>
            <p className="text-sm font-medium">{c.cta}</p>
            {c.additionalText ? <p className="text-xs text-muted-foreground">{c.additionalText}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DesignResult({ result, isPending }: { result: DesignAgentResult; isPending: boolean }) {
  if (isPending) {
    return (
      <div className="rounded-xl border border-dashed border-primary/20 bg-primary/5 p-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">Extracting 3 design specs…</p>
      </div>
    );
  }
  if (result.error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">{result.error}</p>
      </div>
    );
  }
  const designs = result.designs;
  if (!designs || designs.length !== 3) return null;

  return (
    <div className="space-y-4 min-w-0">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Design specs (3 creatives)</p>
      <div className="grid gap-4 sm:grid-cols-3 min-w-0">
        {designs.map((design, i) => {
          if (!design) return null;
          return (
            <div key={i} className="space-y-3 rounded-xl border bg-muted/30 p-4 min-w-0 overflow-hidden">
              <p className="text-xs font-medium text-muted-foreground">Creative {i + 1}</p>
              <div className="flex flex-wrap items-center gap-3 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="size-6 shrink-0 rounded-full border shadow-sm" style={{ backgroundColor: design.accentColor }} />
                  <span className="text-sm truncate" title={design.accentColor}>accentColor: {design.accentColor}</span>
                </div>
                <span className="text-sm text-muted-foreground shrink-0">
                  {design.useReferenceImage ? "Reference image" : "Branded visual"}
                </span>
              </div>
            <div className="grid gap-2 text-sm min-w-0">
              <div className="break-all min-w-0">headline: {JSON.stringify(design.headline)}</div>
              <div className="break-all min-w-0">subheadline: {JSON.stringify(design.subheadline)}</div>
              <div className="break-all min-w-0">cta: {JSON.stringify(design.cta)}</div>
              <div className="break-all min-w-0">additionalText: {JSON.stringify(design.additionalText)}</div>
            </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground mb-1">imageDetails</p>
                <p className="text-sm font-mono text-muted-foreground bg-muted/50 p-3 rounded-lg break-all whitespace-pre-wrap min-w-0">{design.imageDetails}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ImagesResult({
  result,
  isPending,
  large = false,
}: {
  result: GenerateAdImagesResult;
  isPending: boolean;
  large?: boolean;
}) {
  if (isPending) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-primary/20 bg-primary/5 text-center flex items-center justify-center",
          large ? "min-h-[min(70vh,560px)] p-12" : "p-8",
        )}
      >
        <p className="text-sm font-medium text-muted-foreground">Generating 3 ad images…</p>
      </div>
    );
  }
  if (result.error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-4">
        <p className="text-sm text-destructive">{result.error}</p>
      </div>
    );
  }
  const urls = result.imageUrls;
  if (!urls || urls.every((u) => !u)) return null;

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">3 ad creatives</p>
      <div className={cn("flex flex-col gap-4", large && "gap-8")}>
        {urls.map((url, i) =>
          url ? (
            <div
              key={i}
              className={cn(
                "rounded-2xl overflow-hidden border border-border/80 bg-card shadow-lg bg-muted/20",
                large && "rounded-2xl",
              )}
            >
              <div
                className={cn(
                  "relative w-full flex items-center justify-center",
                  large ? "min-h-[min(65vh,520px)] p-6" : "min-h-[200px] p-2",
                )}
              >
                <img
                  src={url}
                  alt={`Ad creative ${i + 1}`}
                  className={cn(
                    "w-auto h-auto object-contain rounded-lg",
                    large ? "max-w-full max-h-[min(65vh,520px)] min-h-[min(50vh,400px)]" : "max-w-full max-h-[320px]",
                  )}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center py-2 border-t border-border/60">Creative {i + 1}</p>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
