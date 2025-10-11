import { useState, useEffect } from "react";
import type { NameItem } from "@/lib/types/names";
import { STORAGE_KEYS, DEFAULT_FONT_SIZE } from "@/lib/constants/names";

export function useNameStorage() {
  const [names, setNames] = useState<NameItem[]>([]);
  const [fontSize, setFontSize] = useState<number>(DEFAULT_FONT_SIZE);
  const [showHint, setShowHint] = useState(true);
  const [hasUsedCommand, setHasUsedCommand] = useState(false);

  // Cargar datos del localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.NAMES_LIST);
    if (stored) {
      try {
        setNames(JSON.parse(stored));
      } catch (e) {
        console.error("Error al cargar nombres:", e);
      }
    }

    const storedFontSize = localStorage.getItem(STORAGE_KEYS.FONT_SIZE);
    if (storedFontSize) {
      try {
        setFontSize(parseInt(storedFontSize, 10));
      } catch (e) {
        console.error("Error al cargar tamaño de letra:", e);
      }
    }

    const hintDismissed = localStorage.getItem(STORAGE_KEYS.HINT_DISMISSED);
    if (hintDismissed === "true") {
      setShowHint(false);
    }

    const commandUsed = localStorage.getItem(STORAGE_KEYS.COMMAND_USED);
    if (commandUsed === "true") {
      setHasUsedCommand(true);
    }
  }, []);

  // Guardar nombres en localStorage
  useEffect(() => {
    if (names.length > 0) {
      localStorage.setItem(STORAGE_KEYS.NAMES_LIST, JSON.stringify(names));
    }
  }, [names]);

  // Guardar tamaño de letra en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, fontSize.toString());
  }, [fontSize]);

  const dismissHint = () => {
    setShowHint(false);
    localStorage.setItem(STORAGE_KEYS.HINT_DISMISSED, "true");
  };

  const markCommandAsUsed = () => {
    setHasUsedCommand(true);
    localStorage.setItem(STORAGE_KEYS.COMMAND_USED, "true");
  };

  return {
    names,
    setNames,
    fontSize,
    setFontSize,
    showHint,
    dismissHint,
    hasUsedCommand,
    markCommandAsUsed,
  };
}
