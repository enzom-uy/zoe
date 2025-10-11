import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Trash2, X } from "lucide-react";
import { AddNameInput } from "./names/AddNameInput";
import { CommandPalette } from "./names/CommandPalette";
import { useNameStorage } from "@/hooks/useNameStorage";
import { useCommandState } from "@/hooks/useCommandState";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import {
  processTextFile,
  scrollToElement,
  focusElement,
} from "@/lib/utils/names";
import {
  DEFAULT_FONT_SIZE,
  MIN_FONT_SIZE,
  MAX_FONT_SIZE,
} from "@/lib/constants/names";
import type { NameItem } from "@/lib/types/names";
import "@/styles/names-list.css";

export default function NamesList() {
  // Custom hooks
  const {
    names,
    setNames,
    fontSize,
    setFontSize,
    showHint,
    dismissHint,
    hasUsedCommand,
    markCommandAsUsed,
  } = useNameStorage();

  const { openCommand, setOpenCommand, commandMode, setCommandMode } =
    useCommandState({ onCommandUsed: markCommandAsUsed });

  // Local state
  const [newName, setNewName] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editingFontSize, setEditingFontSize] =
    useState<number>(DEFAULT_FONT_SIZE);
  const [editingStyles, setEditingStyles] = useState<Map<number, string>>(
    new Map()
  );
  const [selectedCharIndex, setSelectedCharIndex] = useState<number | null>(
    null
  );
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onClickOutside: () => {
      setActiveId(null);
      setSelectedIds(new Set());
    },
  });

  // Name operations
  const addName = () => {
    const trimmedName = newName.trim();
    if (trimmedName) {
      const newItem: NameItem = {
        id: Date.now().toString(),
        name: trimmedName,
      };
      setNames([...names, newItem]);
      setNewName("");
      toast.success(`"${trimmedName}" agregado correctamente`);
    }
  };

  const deleteName = (id: string) => {
    const nameToDelete = names.find((item) => item.id === id);
    if (confirm("¿Estás seguro de que quieres eliminar este nombre?")) {
      setNames(names.filter((item) => item.id !== id));
      setActiveId(null);
      setSelectedIds(new Set());
      toast.success(`"${nameToDelete?.name}" eliminado correctamente`);
    }
  };

  const deleteSelectedNames = () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (
      confirm(
        `¿Estás seguro de que quieres eliminar ${count} nombre(s) seleccionado(s)?`
      )
    ) {
      setNames(names.filter((item) => !selectedIds.has(item.id)));
      setSelectedIds(new Set());
      setActiveId(null);
      toast.success(`${count} nombre(s) eliminado(s) correctamente`);
    }
  };

  const deleteAllNames = () => {
    if (names.length === 0) return;
    const count = names.length;
    if (
      confirm(
        `¿Estás seguro de que quieres eliminar todos los ${count} nombre(s)?`
      )
    ) {
      setNames([]);
      setActiveId(null);
      toast.success(`Todos los nombres (${count}) eliminados correctamente`);
    }
  };

  const toggleActive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      const newSelected = new Set(selectedIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      setSelectedIds(newSelected);
      if (newSelected.size > 0) {
        setActiveId(id);
      } else {
        setActiveId(null);
      }
    } else {
      setSelectedIds(new Set());
      setActiveId(activeId === id ? null : id);
    }
  };

  // File operations
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const newNames = await processTextFile(file, names);
      setNames(newNames);
      const count = newNames.length - names.length;
      toast.success(`${count} nombre(s) cargado(s) desde el archivo`);
      e.target.value = "";
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al cargar archivo"
      );
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;

    try {
      const newNames = await processTextFile(file, names);
      setNames(newNames);
      const count = newNames.length - names.length;
      toast.success(`${count} nombre(s) cargado(s) desde el archivo`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al cargar archivo"
      );
    }
  };

  // Command palette
  const handleCommandEditName = (id: string) => {
    const item = names.find((n) => n.id === id);
    if (item) {
      scrollToElement(`[data-id="${id}"]`);
      setOpenCommand(false);
      setTimeout(() => {
        setActiveId(id);
        setEditingId(id);
        setEditValue(item.name);
        setEditingFontSize(item.fontSize || fontSize);
        const stylesMap = new Map<number, string>();
        item.charStyles?.forEach((style) => {
          stylesMap.set(style.index, style.feature);
        });
        setEditingStyles(stylesMap);
        focusElement('[data-editing="true"]', 200);
      }, 300);
    }
  };

  return (
    <div>
      <Toaster />
      <CommandPalette
        open={openCommand}
        onOpenChange={setOpenCommand}
        mode={commandMode}
        setMode={setCommandMode}
        names={names}
        onEditName={handleCommandEditName}
      />

      <Card className="input-section">
        <AddNameInput
          newName={newName}
          setNewName={setNewName}
          onAddName={addName}
          onFileUpload={handleFileUpload}
          hasUsedCommand={hasUsedCommand}
        />

        <div className="font-size-control">
          <label htmlFor="fontSize">Tamaño de letra:</label>
          <Input
            id="fontSize"
            type="number"
            min={MIN_FONT_SIZE}
            max={MAX_FONT_SIZE}
            value={fontSize}
            onChange={(e) =>
              setFontSize(parseInt(e.target.value, 10) || DEFAULT_FONT_SIZE)
            }
            className="font-size-input w-20"
          />
          <span className="font-size-unit">px</span>
        </div>

        {names.length > 0 && (
          <div className="actions-section">
            {selectedIds.size > 0 && (
              <Button
                onClick={deleteSelectedNames}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar seleccionados ({selectedIds.size})
              </Button>
            )}
            <Button onClick={deleteAllNames} variant="outline" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar todos
            </Button>
          </div>
        )}

        {showHint && names.length > 0 && (
          <div className="hint-message">
            <span>
              Mantén <kbd>Ctrl</kbd> y haz click para seleccionar múltiples
              nombres
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissHint}
              className="hint-close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>

      <div
        className={`drop-zone ${isDragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {names.length === 0 ? (
          <div className="empty-state">
            <p>📝 No hay nombres todavía</p>
            <p className="empty-state-subtitle">
              Agrega nombres manualmente o arrastra un archivo .txt aquí
            </p>
          </div>
        ) : (
          <p>TODO: Implementar NamesGrid component</p>
        )}
      </div>
    </div>
  );
}
