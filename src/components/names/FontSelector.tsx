import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AVAILABLE_FONTS } from "@/lib/fontConfig";

export { AVAILABLE_FONTS } from "@/lib/fontConfig";
export type { FontValue } from "@/lib/fontConfig";

interface FontSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function FontSelector({
  value,
  onValueChange,
  className,
}: FontSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Selecciona una fuente" />
      </SelectTrigger>
      <SelectContent>
        {AVAILABLE_FONTS.map((font) => (
          <SelectItem key={font.value} value={font.value}>
            <span style={{ fontFamily: font.family, fontSize: "1.05rem" }}>
              {font.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
