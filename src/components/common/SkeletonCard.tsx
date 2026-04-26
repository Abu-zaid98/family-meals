export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[1.8rem] border border-border bg-white">
      <div className="h-1.5 skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-1/3 rounded-full skeleton" />
        <div className="h-6 w-3/4 rounded-xl skeleton" />
        <div className="h-4 w-full rounded-xl skeleton" />
        <div className="h-4 w-5/6 rounded-xl skeleton" />
        <div className="mt-5 h-4 w-2/5 rounded-full skeleton" />
      </div>
    </div>
  );
}
