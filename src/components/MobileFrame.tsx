import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MobileFrame({
  children,
  className,
  bg = "bg-cream",
}: {
  children: ReactNode;
  className?: string;
  bg?: string;
}) {
  return (
    <div className="min-h-svh w-full flex justify-center items-stretch sm:items-center bg-zinc-100">
      <div
        className={cn(
          "w-full min-h-svh sm:min-h-0 sm:w-[390px] sm:h-[844px] sm:rounded-[36px] sm:shadow-2xl",
          "relative overflow-hidden flex flex-col text-sage-900",
          bg,
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
