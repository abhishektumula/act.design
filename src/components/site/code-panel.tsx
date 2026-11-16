import Link from "next/link";
import { FileCode2, Lock } from "lucide-react";
import { CopyButton } from "@/components/site/kit/copy-button";
import sources from "@/registry/sources.json";
import { getUser } from "@/lib/session";
import { btnPrimary } from "./styles";

const frame =
  "overflow-hidden rounded-lg bg-base-950 ring-1 ring-base-50/[0.08]";

const fakeLines = [40, 62, 0, 28, 74, 55, 66, 0, 36, 81, 47, 58, 70, 33, 0, 52, 64, 44, 25, 60];

export function CodeSkeleton() {
  return (
    <div className={`${frame} min-h-[30rem]`}>
      <div className="h-11 border-b border-base-50/[0.06]" />
      <div className="space-y-3 p-6">
        {fakeLines.slice(0, 12).map((w, i) => (
          <div key={i} className="h-2.5 animate-pulse rounded-[2px] bg-base-50/[0.06]" style={{ width: `${w || 8}%` }} />
        ))}
      </div>
    </div>
  );
}

type Kind = "components" | "blocks";

const paths: Record<Kind, { file: string; page: string }> = {
  components: { file: "components/ui", page: "/components" },
  blocks: { file: "components/blocks", page: "/blocks" },
};

/** Reads the session on the server: code is never sent to signed-out visitors. */
export async function CodePanel({ slug, kind = "components" }: { slug: string; kind?: Kind }) {
  const user = await getUser();
  const source = (sources as Record<Kind, Record<string, { code: string; html: string }>>)[kind][slug];

  if (!user) {
    return (
      <div className={`${frame} relative min-h-[30rem]`}>
        <div className="space-y-3 p-8 blur-[3px]" aria-hidden>
          {fakeLines.map((w, i) => (
            <div key={i} className="flex gap-6">
              <span className="w-4 text-right font-mono text-[10px] text-base-700">{i + 1}</span>
              {w > 0 && (
                <div
                  className={`h-2.5 rounded-[2px] ${i % 3 === 0 ? "bg-signal/20" : i % 4 === 1 ? "bg-base-50/[0.12]" : "bg-base-50/[0.07]"}`}
                  style={{ width: `${w}%`, marginLeft: `${(i % 4) * 16}px` }}
                />
              )}
            </div>
          ))}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-b from-base-950/40 via-base-950/80 to-base-950 text-center">
          <span className="grid size-10 place-items-center rounded-md bg-base-950 text-base-200 ring-1 ring-base-50/10">
            <Lock className="size-4" />
          </span>
          <p className="mt-5 font-mono text-[10px] tracking-[0.16em] text-base-500 uppercase">Members only</p>
          <p className="mt-2 text-base font-medium text-base-100">Sign in to view the code</p>
          <p className="mt-1.5 max-w-xs text-sm text-base-500">Source code is available to signed-in members.</p>
          <Link href={`/login?next=${paths[kind].page}/${slug}`} className={`${btnPrimary} mt-6 h-9 rounded-md px-4 text-[13px]`}>
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const lines = source.code.split("\n").length;

  return (
    <div className={frame}>
      <div className="flex h-11 items-center gap-2 border-b border-base-50/[0.06] pr-2 pl-4">
        <FileCode2 className="size-3.5 text-base-500" />
        <span className="font-mono text-[12px] text-base-300">{paths[kind].file}/{slug}.tsx</span>
        <span className="ml-2 font-mono text-[10px] tracking-[0.12em] text-base-600 uppercase">{lines} lines</span>
        <CopyButton value={source.code} className="ml-auto" />
      </div>
      <div
        className="code-html scrollbar-thin max-h-[40rem] overflow-auto"
        dangerouslySetInnerHTML={{ __html: source.html }}
      />
    </div>
  );
}
