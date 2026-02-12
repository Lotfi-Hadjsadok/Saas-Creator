"use client";

import { Suspense, useActionState } from "react";

import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { extractWebsite, type ExtractResult } from "./actions";

const initialState: ExtractResult = {
  url: "",
  items: [],
  images: [],
  videos: [],
  links: [],
};

export default function Home() {
  const [state, formAction, isPending] = useActionState(
    extractWebsite,
    initialState
  );

  return (
    <div className="flex flex-col items-center py-20 min-h-screen bg-zinc-50 w-full">
      <form
        className="flex flex-col gap-2 w-full max-w-md"
        action={formAction}
      >
        <FieldLabel>URL</FieldLabel>
        <Input
          name="url"
          type="url"
          placeholder="https://www.example.com"
          required
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Extracting..." : "Extract"}
        </Button>
      </form>

      <Suspense fallback={<div className="mt-8 text-sm text-zinc-500">Loading content…</div>}>
        <Results state={state} />
      </Suspense>
    </div>
  );
}

function Results({ state }: { state: ExtractResult }) {
  if (!state.url) return null;

  const textItems = state.items.filter(
    (item) => item.type === "text" && item.content
  );

  return (
    <div className="mt-10 w-full max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold">{state.url}</h1>
      <section>
        <h2 className="text-lg font-semibold mb-3">Text</h2>
        {textItems.length === 0 ? (
          <p className="text-sm text-zinc-500">No text found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {textItems.map((item, index) => (
              <div key={`text-${index}`} className="rounded-md border bg-white p-2 shadow-sm">
                <p className="text-sm text-zinc-600 break-all">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-3">Images</h2>
        {state.images.length === 0 ? (
          <p className="text-sm text-zinc-500">No images found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {state.images.map((img, index) => (
              <figure
                key={`${img.url}-${index}`}
                className="rounded-md border bg-white p-2 shadow-sm flex flex-col items-center"
              >
                <img
                  src={img.url}
                  alt=""
                  className="max-h-40 w-auto object-contain"
                />
              </figure>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Videos</h2>
        {state.videos.length === 0 ? (
          <p className="text-sm text-zinc-500">No videos found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.videos.map((video, index) => (
              <div
                key={`${video.url}-${index}`}
                className="rounded-md border bg-white p-2 shadow-sm"
              >
                <video
                  src={video.url}
                  controls
                  className="w-full rounded-md"
                />
                <p className="mt-1 text-xs text-zinc-600 break-all">
                  {video.url}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
