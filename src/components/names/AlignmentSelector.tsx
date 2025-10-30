import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Button } from "../ui/button";

interface AlignmentSelectorProps {
  value: "left" | "center" | "right";
  onChange: (align: "left" | "center" | "right") => void;
  className?: string;
}

export function AlignmentSelector({
  value,
  onChange,
  className = "",
}: AlignmentSelectorProps) {
  const alignments: Array<{
    value: "left" | "center" | "right";
    icon: typeof AlignLeft;
    label: string;
  }> = [
    { value: "left", icon: AlignLeft, label: "Izquierda" },
    { value: "center", icon: AlignCenter, label: "Centro" },
    { value: "right", icon: AlignRight, label: "Derecha" },
  ];

  return (
    <div className={`flex gap-1 ${className}`}>
      {alignments.map(({ value: alignValue, icon: Icon, label }) => (
        <Button
          key={alignValue}
          size="sm"
          variant={value === alignValue ? "default" : "outline"}
          onClick={() => onChange(alignValue)}
          title={label}
          className="px-2"
        >
          <Icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
