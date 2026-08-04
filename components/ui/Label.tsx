import { cn } from "@/lib/utils";

type Props = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: Props) {
  return (
    <label
      className={cn(
        "block text-xs font-medium uppercase tracking-wide text-text-secondary",
        className,
      )}
      {...props}
    />
  );
}
