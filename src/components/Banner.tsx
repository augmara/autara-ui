import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

/**
 * Banner — a standing notice about the app itself (AUTM-1594, canvas v44
 * "Banner (offline)"): "No connection. We'll catch up as soon as you're
 * back." Ink (white in dark), 16px radius, 12 x 16 in, 15px.
 *
 * Not a toast: it stays while the condition holds. Not an InlineAlert: it is
 * about the app, not the thing on the page. `role="status"`, so it is read
 * once when it appears without interrupting. `action` is the one thing to do
 * about it, if there is one ("Retry").
 */
export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
  children: ReactNode;
  action?: ReactNode;
}

export function Banner({ children, action, className, ...rest }: BannerProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-3 rounded-2xl bg-[var(--surface-inverse)] px-4 py-3 text-[0.9375rem] text-[var(--text-on-inverse)]",
        className,
      )}
      {...rest}
    >
      <span className="min-w-0 flex-1">{children}</span>
      {action ? <span className="shrink-0">{action}</span> : null}
    </div>
  );
}
