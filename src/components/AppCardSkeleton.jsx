export default function AppCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-2xl bg-white shadow-md">
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between">
          <div className="h-4 w-16 rounded bg-slate-200" />
          <div className="h-5 w-10 rounded bg-slate-200" />
        </div>
        <div className="mt-4 h-6 w-3/4 rounded bg-slate-200" />
        <div className="mt-2 h-6 w-1/2 rounded bg-slate-200" />
        <div className="mt-8 flex items-center justify-between">
          <div className="h-3.5 w-20 rounded bg-slate-200" />
          <div className="h-3.5 w-24 rounded bg-slate-200" />
        </div>
      </div>
      <div className="h-[6.4px] w-full bg-slate-100" />
    </div>
  )
}
