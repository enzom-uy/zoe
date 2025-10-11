import { useEffect } from "react";

interface UseKeyboardShortcutsProps {
  onClickOutside?: () => void;
}

export function useKeyboardShortcuts({
  onClickOutside,
}: UseKeyboardShortcutsProps) {
  // Cerrar items activos al hacer click fuera
  useEffect(() => {
    if (!onClickOutside) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".name-item")) {
        onClickOutside();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [onClickOutside]);
}
