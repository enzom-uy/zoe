import { useState, useEffect } from "react";
import type { CommandMode } from "@/lib/types/names";

interface UseCommandStateProps {
  onCommandUsed: () => void;
}

export function useCommandState({ onCommandUsed }: UseCommandStateProps) {
  const [openCommand, setOpenCommand] = useState(false);
  const [commandMode, setCommandMode] = useState<CommandMode>("main");

  // Atajo de teclado Ctrl+K para abrir el Command
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenCommand((open) => {
          // Marcar como usado cuando se abre por primera vez
          if (!open) {
            onCommandUsed();
          }
          return !open;
        });
        setCommandMode("main");
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onCommandUsed]);

  // Mantener el foco en el input del Command cuando cambia el modo
  useEffect(() => {
    if (openCommand) {
      setTimeout(() => {
        const input = document.querySelector(
          "[cmdk-input]"
        ) as HTMLInputElement;
        if (input) {
          input.focus();
        }
      }, 0);
    }
  }, [commandMode, openCommand]);

  return {
    openCommand,
    setOpenCommand,
    commandMode,
    setCommandMode,
  };
}
