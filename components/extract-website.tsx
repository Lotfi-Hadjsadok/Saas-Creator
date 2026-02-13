"use client";

import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExtractResult } from "@/types";
import { Loader2 } from "lucide-react";

type ExtractWebsiteProps = {
  state: ExtractResult;
  formAction: (formData: FormData) => void;
  isPending: boolean;
};

export function ExtractWebsite({
  state,
  formAction,
  isPending,
}: ExtractWebsiteProps) {
  return (
    <Card className="w-full border-border/80 shadow-sm bg-card/95 backdrop-blur-sm">
      <CardHeader className="space-y-1.5">
        <CardTitle className="text-xl font-semibold tracking-tight">
          Step 1 — Pull your content in one click
        </CardTitle>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Tired of copy-pasting and broken formatting? Paste your site URL below. We extract text, images, and links so your brand voice is ready for the next step—no manual work.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="flex flex-col gap-3" action={formAction}>
          <div className="space-y-2">
            <FieldLabel>Your website URL</FieldLabel>
            <Input
              name="url"
              type="url"
              placeholder="https://www.yoursite.com"
              required
              disabled={isPending}
              className="h-11"
            />
          </div>
          <Button type="submit" disabled={isPending} size="lg" className="font-medium">
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Extracting your content…
              </>
            ) : (
              "Extract my content"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
