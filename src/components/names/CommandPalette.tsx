import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Edit2 } from "lucide-react";
import type { NameItem, CommandMode } from "@/lib/types/names";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: CommandMode;
  setMode: (mode: CommandMode) => void;
  names: NameItem[];
  onEditName: (id: string) => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  mode,
  setMode,
  names,
  onEditName,
}: CommandPaletteProps) {
  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setMode("main");
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      {mode === "main" ? (
        <Command key="main-mode">
          <CommandInput placeholder="Escribe un comando..." autoFocus />
          <CommandList>
            <CommandEmpty>No se encontraron resultados.</CommandEmpty>
            <CommandGroup heading="Acciones">
              <CommandItem
                onSelect={() => {
                  setMode("edit");
                }}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Editar un nombre
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      ) : (
        <Command key="edit-mode">
          <CommandInput placeholder="Buscar nombre para editar..." autoFocus />
          <CommandList>
            <CommandEmpty>No se encontraron nombres.</CommandEmpty>
            <CommandGroup heading="Nombres">
              {names.map((item, index) => {
                const sameNamesBefore = names
                  .slice(0, index)
                  .filter((n) => n.name === item.name).length;
                const totalSameNames = names.filter(
                  (n) => n.name === item.name
                ).length;
                const hasDuplicates = totalSameNames > 1;

                return (
                  <CommandItem
                    key={item.id}
                    value={`${item.name} ${item.id}`}
                    onSelect={() => {
                      onEditName(item.id);
                    }}
                  >
                    <span style={{ fontFamily: "CustomFont, Georgia, serif" }}>
                      {item.name}
                    </span>
                    {hasDuplicates && (
                      <span className="duplicate-indicator">
                        #{sameNamesBefore + 1}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      )}
    </CommandDialog>
  );
}
