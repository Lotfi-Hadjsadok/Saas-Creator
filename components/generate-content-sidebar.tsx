"use client";

import { ExtractWebsite } from "@/components/extract-website";
import { GenerateAdCopyForms } from "@/components/generate-ad-copy";
import type {
  ExtractResult,
  CopyAgentResult,
  DesignAgentResult,
  GenerateAdImagesResult,
} from "@/types";

type GenerateContentSidebarProps = {
  extractState: ExtractResult;
  extractFormAction: (formData: FormData) => void;
  extractPending: boolean;
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

export function GenerateContentSidebar({
  extractState,
  extractFormAction,
  extractPending,
  adCopyResult,
  adCopyFormAction,
  adCopyPending,
  designResult,
  designFormAction,
  designPending,
  adImagesResult,
  adImagesFormAction,
  adImagesPending,
}: GenerateContentSidebarProps) {
  return (
    <aside className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground border-r">
      <div className="px-4 py-4 border-b border-sidebar-border/80 bg-sidebar/95">
        <h2 className="font-semibold text-sm tracking-tight">Generate</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Extract URL → Copy → Design → Images
        </p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <ExtractWebsite
          state={extractState}
          formAction={extractFormAction}
          isPending={extractPending}
        />
        <GenerateAdCopyForms
          state={extractState}
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
    </aside>
  );
}
