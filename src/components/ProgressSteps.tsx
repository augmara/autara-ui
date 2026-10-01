import { cn } from "../lib/cn";

/**
 * ProgressSteps — where a booking is, as named steps (AUTM-1594, canvas v44
 * "Booking progress"). Four steps everywhere: one 4px bar per step, 8px
 * apart, brand up to and including the current step and band after it, with
 * the step's name under its bar at 13px. Reached steps are ink, the current
 * one Bold, the rest at 58% ink.
 *
 * An ordered list, with the current step marked `aria-current="step"`, so a
 * screen reader hears where the booking is, not a row of bars.
 */
export interface ProgressStepsProps {
  steps: string[];
  /** 0-indexed. */
  current: number;
  /** Accessible name, e.g. "Booking progress". */
  label?: string;
  className?: string;
}

export function ProgressSteps({ steps, current, label = "Progress", className }: ProgressStepsProps) {
  const at = Math.min(Math.max(current, 0), Math.max(steps.length - 1, 0));
  return (
    <ol aria-label={label} className={cn("m-0 flex w-full list-none gap-2 p-0", className)}>
      {steps.map((step, i) => (
        <li key={step} aria-current={i === at ? "step" : undefined} className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span
            aria-hidden="true"
            className={cn("h-1 rounded-full", i <= at ? "bg-[var(--brand)]" : "bg-[var(--band)]")}
          />
          <span
            className={cn(
              "text-[0.8125rem]",
              i < at && "font-medium text-[var(--text-strong)]",
              i === at && "font-bold text-[var(--text-strong)]",
              i > at && "font-medium text-[var(--text-subtle)]",
            )}
          >
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}
