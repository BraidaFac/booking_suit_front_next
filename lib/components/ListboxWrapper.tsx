"use client";
export const ListboxWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full h-full  bg-slate-300 border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100">
    {children}
  </div>
);
