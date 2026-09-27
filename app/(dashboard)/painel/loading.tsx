import { Skeleton } from "@/components/ui/skeleton";

export default function PainelLoading() {
  return (
    <div className="bg-[#f3f4f6] p-4 dark:bg-zinc-950 lg:p-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">A carregar o painel…</span>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <div className="flex justify-end gap-3">
          <Skeleton className="h-12 w-52 rounded-xl" />
          <Skeleton className="h-12 w-44 rounded-xl" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-40 rounded-[20px]" />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Skeleton className="h-72 rounded-[20px] lg:col-span-3" />
        <Skeleton className="h-72 rounded-[20px] lg:col-span-2" />
      </div>
    </div>
  );
}
