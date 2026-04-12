import { cn } from "@/lib/utils";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "dispatched"
  | "delivered"
  | "cancelled"
  | "refunded";

interface StatusBadgeProps {
  status: OrderStatus | string;
  className?: string;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-100 text-blue-800 border-blue-300",
  },
  processing: {
    label: "Processing",
    className: "bg-orange-100 text-orange-800 border-orange-300",
  },
  dispatched: {
    label: "Dispatched",
    className: "bg-purple-100 text-purple-800 border-purple-300",
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-100 text-green-800 border-green-300",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 border-red-300",
  },
  refunded: {
    label: "Refunded",
    className: "bg-gray-100 text-gray-700 border-gray-300",
  },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config =
    STATUS_CONFIG[status as OrderStatus] ?? STATUS_CONFIG["pending"];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
};

// Status timeline step data (ordered)
const STATUS_STEPS: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "dispatched",
  "delivered",
];

interface StatusTimelineProps {
  currentStatus: OrderStatus | string;
}

export const StatusTimeline = ({ currentStatus }: StatusTimelineProps) => {
  const isCancelled = currentStatus === "cancelled";
  const isRefunded = currentStatus === "refunded";

  const currentIndex = STATUS_STEPS.indexOf(currentStatus as OrderStatus);

  return (
    <div className="w-full">
      {(isCancelled || isRefunded) ? (
        <div className="flex items-center gap-2">
          <StatusBadge status={currentStatus} />
          <span className="text-sm text-muted-foreground">
            {isCancelled ? "This order was cancelled." : "This order was refunded."}
          </span>
        </div>
      ) : (
        <ol className="relative flex flex-col gap-0">
          {STATUS_STEPS.map((step, index) => {
            const isDone = index < currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <li key={step} className="flex items-start gap-3 pb-4 last:pb-0">
                {/* Dot + line */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "size-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5",
                      isDone
                        ? "bg-green-600 border-green-600"
                        : isCurrent
                          ? "bg-black border-black"
                          : "bg-white border-neutral-300"
                    )}
                  >
                    {isDone && (
                      <svg
                        className="size-2.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  {index < STATUS_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "w-0.5 flex-1 min-h-4 mt-1",
                        isDone ? "bg-green-600" : "bg-neutral-200"
                      )}
                    />
                  )}
                </div>
                {/* Label */}
                <p
                  className={cn(
                    "text-sm leading-none pt-0.5",
                    isCurrent ? "font-semibold text-black" : isDone ? "text-green-700" : "text-neutral-400"
                  )}
                >
                  {STATUS_CONFIG[step].label}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};
