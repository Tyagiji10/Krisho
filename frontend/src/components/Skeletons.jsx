/**
 * SkeletonCard — animated shimmer placeholder for product cards
 * SkeletonStat — for dashboard stat tiles
 * SkeletonRow  — for list/order rows
 */

const Shimmer = ({ className = '' }) => (
  <div className={`bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse ${className}`} />
);

export const SkeletonProductCard = () => (
  <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
    <Shimmer className="w-full h-44 rounded-none rounded-t-[2rem]" />
    <div className="p-4 space-y-2.5">
      <Shimmer className="h-4 w-3/4" />
      <Shimmer className="h-3 w-1/2" />
      <div className="flex justify-between items-center pt-2">
        <Shimmer className="h-5 w-1/3" />
        <Shimmer className="h-8 w-8 rounded-xl" />
      </div>
    </div>
  </div>
);

export const SkeletonStatTile = () => (
  <div className="bg-slate-200 dark:bg-slate-700 p-8 rounded-[2.5rem] animate-pulse flex justify-between items-center">
    <div className="space-y-3">
      <Shimmer className="h-3 w-24 bg-slate-300 dark:bg-slate-600" />
      <Shimmer className="h-8 w-16 bg-slate-300 dark:bg-slate-600" />
    </div>
    <Shimmer className="h-14 w-14 rounded-2xl bg-slate-300 dark:bg-slate-600" />
  </div>
);

export const SkeletonOrderRow = () => (
  <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <Shimmer className="h-3 w-32" />
      <Shimmer className="h-6 w-24 rounded-full" />
    </div>
    <div className="flex gap-4 items-center">
      <Shimmer className="h-16 w-16 rounded-2xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-4 w-3/4" />
        <Shimmer className="h-3 w-1/2" />
      </div>
      <Shimmer className="h-8 w-24 rounded-xl" />
    </div>
  </div>
);

export const SkeletonProductGrid = ({ count = 6 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => <SkeletonProductCard key={i} />)}
  </div>
);

export const SkeletonStatGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
    {Array.from({ length: 3 }).map((_, i) => <SkeletonStatTile key={i} />)}
  </div>
);
