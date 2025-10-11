import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Edit2, Trash2, Check } from "lucide-react";
import type { NameItem, CommandMode } from "@/lib/types/names";
import { useState, useEffect } from "react";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: CommandMode;
  setMode: (mode: CommandMode) => void;
  names: NameItem[];
  onEditName: (id: string) => void;
  onDeleteNames: (ids: string[]) => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  mode,
  setMode,
  names,
  onEditName,
  onDeleteNames,
}: CommandPaletteProps) {
  const [selectedForDeletion, setSelectedForDeletion] = useState<Set<string>>(
    new Set()
  );
  const [currentItem, setCurrentItem] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Resetear selección cuando cambia el modo o se cierra
  useEffect(() => {
    if (!open || mode !== "delete") {
      setSelectedForDeletion(new Set());
      setCurrentItem(null);
    }
  }, [open, mode]);

  // Manejar tecla ENTER y SPACE en modo delete
  useEffect(() => {
    if (!open || mode !== "delete") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && selectedForDeletion.size > 0) {
        e.preventDefault();
        e.stopPropagation();
        const count = selectedForDeletion.size;
        const idsToDelete = Array.from(selectedForDeletion);

        confirm({
          title: "Eliminar nombres seleccionados",
          description: `¿Estás seguro de que quieres eliminar ${count} nombre(s) seleccionado(s)?`,
          confirmText: "Eliminar",
          variant: "destructive",
          onConfirm: () => {
            onDeleteNames(idsToDelete);
            setSelectedForDeletion(new Set());
            onOpenChange(false);
          },
        });
      } else if (e.key === " " && mode === "delete") {
        e.preventDefault();
        e.stopPropagation();
        // Obtener el item actualmente seleccionado en el Command
        const selectedItem = document.querySelector(
          '[cmdk-item][aria-selected="true"]'
        ) as HTMLElement;
        if (selectedItem) {
          const itemId = selectedItem.getAttribute("data-item-id");
          if (itemId) {
            toggleSelection(itemId);
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [open, mode, selectedForDeletion, onDeleteNames, onOpenChange]);

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedForDeletion);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedForDeletion(newSelected);
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setMode("main");
      setSelectedForDeletion(new Set());
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
              <CommandItem
                onSelect={() => {
                  setMode("delete");
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar varios nombres
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      ) : mode === "edit" ? (
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
      ) : (
        <Command key="delete-mode">
          <CommandInput
            placeholder={`Buscar y seleccionar (ESPACIO) - ${selectedForDeletion.size} seleccionado(s)...`}
            autoFocus
          />
          <CommandList>
            <CommandEmpty>No se encontraron nombres.</CommandEmpty>
            <CommandGroup
              heading={`Nombres (${selectedForDeletion.size} seleccionado(s) - ENTER para confirmar)`}
            >
              {names.map((item, index) => {
                const sameNamesBefore = names
                  .slice(0, index)
                  .filter((n) => n.name === item.name).length;
                const totalSameNames = names.filter(
                  (n) => n.name === item.name
                ).length;
                const hasDuplicates = totalSameNames > 1;
                const isSelected = selectedForDeletion.has(item.id);

                return (
                  <CommandItem
                    key={item.id}
                    value={`${item.name} ${item.id}`}
                    data-item-id={item.id}
                    onSelect={() => {
                      toggleSelection(item.id);
                    }}
                    style={{
                      backgroundColor: isSelected
                        ? "hsl(var(--primary) / 0.15)"
                        : undefined,
                      borderLeft: isSelected
                        ? "3px solid hsl(var(--primary))"
                        : "3px solid transparent",
                    }}
                  >
                    {isSelected && <Check className="mr-2 h-4 w-4" />}
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
      <ConfirmDialog />
    </CommandDialog>
  );
}
