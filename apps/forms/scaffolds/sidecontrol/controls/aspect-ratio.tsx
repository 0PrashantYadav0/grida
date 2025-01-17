import { Input } from "@/components/ui/input";
import { WorkbenchUI } from "@/components/workbench";

export function AspectRatioControl({
  value,
  onValueChange,
}: {
  value?: number;
  onValueChange?: (value?: number) => void;
}) {
  return (
    <Input
      value={value}
      onChange={(e) => onValueChange?.(parseFloat(e.target.value) || undefined)}
      className={WorkbenchUI.inputVariants({ size: "xs" })}
    />
  );
}
