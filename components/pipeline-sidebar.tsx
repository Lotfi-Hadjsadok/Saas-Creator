"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type {
  ExtractResult,
  CopyAgentResult,
  DesignAgentResult,
  GenerateAdImagesResult,
} from "@/types";
import { Loader2 } from "lucide-react";

type StepStatus = "idle" | "running" | "done" | "error";

type PipelineSidebarProps = {
  extractState: ExtractResult;
  extractPending: boolean;
  adCopyResult: CopyAgentResult;
  adCopyPending: boolean;
  designResult: DesignAgentResult;
  designPending: boolean;
  adImagesResult: GenerateAdImagesResult;
  adImagesPending: boolean;
};

function StepCard({
  title,
  status,
  children,
}: {
  title: string;
  status: StepStatus;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden border-sidebar-border/50">
      <CardHeader className="py-2.5 px-4 flex flex-row items-center justify-between space-y-0 gap-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <StepBadge status={status} />
      </CardHeader>
      <CardContent className="py-0 px-4 pb-3 text-sm">{children}</CardContent>
    </Card>
  );
}

function StepBadge({ status }: { status: StepStatus }) {
  if (status === "running") {
    return (
      <Badge variant="secondary" className="gap-1">
        <Loader2 className="size-3 animate-spin" />
        Running
      </Badge>
    );
  }
  if (status === "done") {
    return <Badge variant="success">Done</Badge>;
  }
  if (status === "error") {
    return <Badge variant="destructive">Error</Badge>;
  }
  return <Badge variant="outline">Idle</Badge>;
}

function CodeBlock({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <pre
        className={cn(
          "rounded-lg border bg-muted/50 p-3 text-xs overflow-x-auto overflow-y-auto max-h-48 font-mono whitespace-pre-wrap break-words",
          className
        )}
      >
        {children}
      </pre>
    </div>
  );
}

import { cn } from "@/lib/utils";

function ExtractStep({
  state,
  isPending,
}: {
  state: ExtractResult;
  isPending: boolean;
}) {
  const status: StepStatus = isPending
    ? "running"
    : state.url
      ? "done"
      : "idle";

  const textCount = state.items.filter((i) => i.type === "text").length;

  const accentColors = state.accentColors ?? [];
  const summary =
    state.url && !isPending && (textCount > 0 || state.images.length > 0 || accentColors.length > 0) ? (
      <p className="text-xs text-muted-foreground">
        {textCount} text chunk{textCount !== 1 ? "s" : ""}, {state.images.length} image
        {state.images.length !== 1 ? "s" : ""}
        {state.links.length > 0 && `, ${state.links.length} links`}
        {accentColors.length > 0 && `, ${accentColors.length} accent color${accentColors.length !== 1 ? "s" : ""}`}
      </p>
    ) : state.url && !isPending ? (
      <p className="text-muted-foreground text-xs">No content extracted.</p>
    ) : (
      <p className="text-muted-foreground text-xs">
        {isPending ? "Scraping URL…" : "Submit a URL to start."}
      </p>
    );

  const scrapingSteps = isPending && (
    <ul className="space-y-1 text-xs text-muted-foreground mt-2">
      <li className="flex items-center gap-2">
        <Loader2 className="size-3 animate-spin shrink-0" />
        Launching browser
      </li>
      <li className="flex items-center gap-2">
        <Loader2 className="size-3 animate-spin shrink-0" />
        Loading page
      </li>
      <li className="flex items-center gap-2">
        <Loader2 className="size-3 animate-spin shrink-0" />
        Parsing content
      </li>
    </ul>
  );

  return (
    <StepCard title="1. Extract website" status={status}>
      <div className="space-y-2">
        {state.url && (
          <p className="text-xs font-mono text-muted-foreground truncate" title={state.url}>
            {state.url}
          </p>
        )}
        {summary}
        {!isPending && accentColors.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {accentColors.slice(0, 12).map((hex, i) => (
              <span
                key={`${hex}-${i}`}
                className="size-4 rounded-full border border-border shadow-sm shrink-0"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
        )}
        {scrapingSteps}
      </div>
    </StepCard>
  );
}

function AdCopyStep({
  extractState,
  result,
  isPending,
}: {
  extractState: ExtractResult;
  result: CopyAgentResult;
  isPending: boolean;
}) {
  const content = extractState.items
    .filter((i): i is { type: "text"; content: string } => i.type === "text" && !!i.content)
    .map((i) => i.content)
    .join("\n\n");
  const imageCount = extractState.images.length;

  const status: StepStatus = isPending
    ? "running"
    : result.error
      ? "error"
      : result.creatives
        ? "done"
        : "idle";

  const inputBody =
    extractState.url || content || imageCount > 0 ? (
      <CodeBlock label="Input → copy agent">
        {JSON.stringify(
          { url: extractState.url, contentLength: content.length, imageCount },
          null,
          2
        )}
      </CodeBlock>
    ) : (
      <p className="text-muted-foreground text-xs">
        Extract a website first, then generate ad copy.
      </p>
    );

  const outputBody = result.error ? (
    <CodeBlock label="Output ← error" className="text-destructive">
      {result.error}
    </CodeBlock>
  ) : result.creatives ? (
    <CodeBlock label="Output ← 3 creatives (JSON)">
      {JSON.stringify(result.creatives, null, 2)}
    </CodeBlock>
  ) : null;

  return (
    <StepCard title="2. Agent 1: Copy" status={status}>
      <div className="space-y-4">
        {inputBody}
        {outputBody && (
          <>
            <Separator />
            {outputBody}
          </>
        )}
      </div>
    </StepCard>
  );
}

function DesignStep({
  result,
  isPending,
}: {
  result: DesignAgentResult;
  isPending: boolean;
}) {
  const status: StepStatus = isPending
    ? "running"
    : result.error
      ? "error"
      : result.designs?.length === 3
        ? "done"
        : "idle";

  const outputBody = result.error ? (
    <CodeBlock label="Output ← error" className="text-destructive">
      {result.error}
    </CodeBlock>
  ) : result.designs?.length === 3 ? (
    <CodeBlock label="Output ← 3 design specs (JSON)">
      {JSON.stringify(result.designs, null, 2)}
    </CodeBlock>
  ) : (
    <p className="text-muted-foreground text-xs">
      Run copy agent first, then generate design.
    </p>
  );

  return (
    <StepCard title="3. Agent 2: Creative & Design" status={status}>
      <div className="space-y-4">
        <p className="text-muted-foreground text-xs">Input: 3 creatives + images (JSON)</p>
        {outputBody && <Separator />}
        {outputBody}
      </div>
    </StepCard>
  );
}

function AdImagesStep({
  result,
  isPending,
}: {
  result: GenerateAdImagesResult;
  isPending: boolean;
}) {
  const status: StepStatus = isPending
    ? "running"
    : result.error
      ? "error"
      : result.imageUrls?.some(Boolean)
        ? "done"
        : "idle";

  const outputBody = result.error ? (
    <CodeBlock label="Output ← error" className="text-destructive">
      {result.error}
    </CodeBlock>
  ) : result.imageUrls?.filter(Boolean).length ? (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Output ← 3 images
      </p>
      <div className="grid grid-cols-3 gap-1">
        {result.imageUrls.map((url, i) =>
          url ? (
            <div key={i} className="rounded border bg-muted/50 overflow-hidden">
              <img src={url} alt={`Ad ${i + 1}`} className="w-full h-auto object-contain max-h-24" />
            </div>
          ) : null
        )}
      </div>
    </div>
  ) : (
    <p className="text-muted-foreground text-xs">
      Run design agent first, then generate images.
    </p>
  );

  return (
    <StepCard title="4. Agent 3: Image" status={status}>
      <div className="space-y-4">
        <p className="text-muted-foreground text-xs">Input: design + creatives + 14 images. Loop 3×.</p>
        {outputBody && <Separator />}
        {outputBody}
      </div>
    </StepCard>
  );
}

export function PipelineSidebar({
  extractState,
  extractPending,
  adCopyResult,
  adCopyPending,
  designResult,
  designPending,
  adImagesResult,
  adImagesPending,
}: PipelineSidebarProps) {
  return (
    <aside className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-4 border-b border-sidebar-border/80 bg-sidebar/95">
        <h2 className="font-semibold text-sm tracking-tight">Logs</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Step-by-step input/output
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <ExtractStep state={extractState} isPending={extractPending} />
        <AdCopyStep
          extractState={extractState}
          result={adCopyResult}
          isPending={adCopyPending}
        />
        <DesignStep result={designResult} isPending={designPending} />
        <AdImagesStep result={adImagesResult} isPending={adImagesPending} />
      </div>
    </aside>
  );
}
