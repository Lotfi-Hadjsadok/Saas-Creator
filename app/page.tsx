"use client";

import { useActionState } from "react";
import { GenerateContentSidebar } from "@/components/generate-content-sidebar";
import { ResultsPanel } from "@/components/results-panel";
import { PipelineSidebar } from "@/components/pipeline-sidebar";
import {
  extractWebsite,
  generateAdCopy,
  generateCreativeDesign,
  generateAdImages,
} from "@/app/actions";
import type {
  ExtractResult,
  CopyAgentResult,
  DesignAgentResult,
  GenerateAdImagesResult,
} from "@/types";

const initialExtract: ExtractResult = {
  url: "",
  items: [],
  images: [],
  videos: [],
  links: [],
  accentColors: [],
};

export default function Home() {
  const [extractState, extractFormAction, extractPending] = useActionState(
    extractWebsite,
    initialExtract
  );
  const [adCopyResult, adCopyFormAction, adCopyPending] =
    useActionState(generateAdCopy, {} as CopyAgentResult);
  const [designResult, designFormAction, designPending] =
    useActionState(generateCreativeDesign, {} as DesignAgentResult);
  const [adImagesResult, adImagesFormAction, adImagesPending] = useActionState(
    generateAdImages,
    {} as GenerateAdImagesResult
  );

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-background">
      <div className="hidden lg:flex lg:w-[320px] shrink-0 flex-col min-h-0 border-r overflow-hidden">
        <GenerateContentSidebar
          extractState={extractState}
          extractFormAction={extractFormAction}
          extractPending={extractPending}
          adCopyResult={adCopyResult}
          adCopyFormAction={adCopyFormAction}
          adCopyPending={adCopyPending}
          designResult={designResult}
          designFormAction={designFormAction}
          designPending={designPending}
          adImagesResult={adImagesResult}
          adImagesFormAction={adImagesFormAction}
          adImagesPending={adImagesPending}
        />
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <ResultsPanel
          extractState={extractState}
          adCopyResult={adCopyResult}
          adCopyPending={adCopyPending}
          designResult={designResult}
          designPending={designPending}
          adImagesResult={adImagesResult}
          adImagesPending={adImagesPending}
        />
      </div>

      <div className="hidden lg:flex lg:w-[380px] shrink-0 flex-col min-h-0 border-l overflow-hidden">
        <PipelineSidebar
          extractState={extractState}
          extractPending={extractPending}
          adCopyResult={adCopyResult}
          adCopyPending={adCopyPending}
          designResult={designResult}
          designPending={designPending}
          adImagesResult={adImagesResult}
          adImagesPending={adImagesPending}
        />
      </div>

      <div className="lg:hidden flex flex-col border-t gap-0">
        <details className="group border-b">
          <summary className="cursor-pointer list-none px-4 py-3 font-medium text-sm bg-muted/30 hover:bg-muted/50">
            Generate content
          </summary>
          <div className="max-h-[50vh] overflow-y-auto px-4 pb-4">
            <GenerateContentSidebar
              extractState={extractState}
              extractFormAction={extractFormAction}
              extractPending={extractPending}
              adCopyResult={adCopyResult}
              adCopyFormAction={adCopyFormAction}
              adCopyPending={adCopyPending}
              designResult={designResult}
              designFormAction={designFormAction}
              designPending={designPending}
              adImagesResult={adImagesResult}
              adImagesFormAction={adImagesFormAction}
              adImagesPending={adImagesPending}
            />
          </div>
        </details>
        <details className="group">
          <summary className="cursor-pointer list-none px-4 py-3 font-medium text-sm bg-muted/30 hover:bg-muted/50">
            Logs
          </summary>
          <div className="max-h-[50vh] overflow-y-auto">
            <PipelineSidebar
              extractState={extractState}
              extractPending={extractPending}
              adCopyResult={adCopyResult}
              adCopyPending={adCopyPending}
              designResult={designResult}
              designPending={designPending}
              adImagesResult={adImagesResult}
              adImagesPending={adImagesPending}
            />
          </div>
        </details>
      </div>
    </div>
  );
}
