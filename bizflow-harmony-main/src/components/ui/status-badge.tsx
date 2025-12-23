import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
  {
    variants: {
      status: {
        requested: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        awaiting_payment: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        awaiting_validation: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        completed: "bg-primary/10 text-primary dark:bg-primary/20",
        cancelled: "bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: {
      status: "requested",
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  className?: string;
  children?: React.ReactNode;
}

const statusLabels: Record<string, string> = {
  requested: 'Solicitado',
  awaiting_payment: 'Aguardando Pagamento',
  awaiting_validation: 'Aguardando Validação',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export function StatusBadge({ status, className, children }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ status }), className)}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        status === 'requested' && "bg-amber-500",
        status === 'awaiting_payment' && "bg-orange-500",
        status === 'awaiting_validation' && "bg-blue-500",
        status === 'confirmed' && "bg-emerald-500",
        status === 'completed' && "bg-primary",
        status === 'cancelled' && "bg-destructive",
      )} />
      {children || statusLabels[status || 'requested']}
    </span>
  );
}
