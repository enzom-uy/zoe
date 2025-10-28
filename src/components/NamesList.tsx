import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Toaster } from "./ui/sonner";
import { toast } from "sonner";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useConfirmDialog } from "./ui/confirm-dialog";
import { FontSelector, AVAILABLE_FONTS } from "./names/FontSelector";
import { IconsGuide } from "./names/IconsGuide";
import { getFontFamily, getFontStyles, getFontConfig } from "@/lib/fontConfig";
import type { LetterStyle } from "@/lib/fontConfig";
import { Upload, Plus, Trash2, Edit2, Check, X, Wand2 } from "lucide-react";

interface CharStyle {
  index: number;
  feature: string;
  font?: string; // Para edición avanzada: fuente por carácter
}

interface NameItem {
  id: string;
  name: string;
  font: string; // Fuente principal del nombre
  charStyles?: CharStyle[];
  fontSize?: number;
}

export default function NamesList() {
  const [names, setNames] = useState<NameItem[]>([]);
  const [newName, setNewName] = useState("");
  const [selectedFont, setSelectedFont] = useState("CustomFont"); // Fuente por defecto
  const [fontSize, setFontSize] = useState<number>(12);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [editingStyles, setEditingStyles] = useState<Map<number, string>>(
    new Map()
  );
  const [editingFonts, setEditingFonts] = useState<Map<number, string>>(
    new Map()
  ); // Para fuentes por carácter en el editor
  const [selectedCharIndex, setSelectedCharIndex] = useState<number | null>(
    null
  );
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showHint, setShowHint] = useState(true);
  const [editingFontSize, setEditingFontSize] = useState<number>(12);
  const [openCommand, setOpenCommand] = useState(false);
  const [commandMode, setCommandMode] = useState<"main" | "edit" | "delete">(
    "main"
  );
  const [hasUsedCommand, setHasUsedCommand] = useState(false);
  const [selectedForDeletion, setSelectedForDeletion] = useState<Set<string>>(
    new Set()
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Diálogo de confirmación
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const STORAGE_KEY = "names-list";
  const FONT_SIZE_KEY = "names-font-size";
  const HINT_KEY = "names-hint-dismissed";
  const COMMAND_USED_KEY = "command-used";

  // Obtener los estilos disponibles para la fuente que se está editando
  const getAvailableStyles = (): LetterStyle[] => {
    if (editingId) {
      const editingItem = names.find((n) => n.id === editingId);
      if (editingItem) {
        return getFontStyles(editingItem.font);
      }
    }
    return getFontStyles(selectedFont);
  };

  // Cargar nombres del localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const loadedNames = JSON.parse(stored) as NameItem[];
        // Migrar nombres antiguos sin fuente a la fuente por defecto
        const migratedNames = loadedNames.map((item) => ({
          ...item,
          font: item.font || "CustomFont", // Asignar fuente por defecto si no existe
        }));
        setNames(migratedNames);
      } catch (e) {
        console.error("Error al cargar nombres:", e);
      }
    }

    // Cargar tamaño de letra del localStorage
    const storedFontSize = localStorage.getItem(FONT_SIZE_KEY);
    if (storedFontSize) {
      try {
        setFontSize(parseInt(storedFontSize, 10));
      } catch (e) {
        console.error("Error al cargar tamaño de letra:", e);
      }
    }

    // Cargar estado del hint
    const hintDismissed = localStorage.getItem(HINT_KEY);
    if (hintDismissed === "true") {
      setShowHint(false);
    }

    // Cargar si el usuario ya usó el Command
    const commandUsed = localStorage.getItem(COMMAND_USED_KEY);
    if (commandUsed === "true") {
      setHasUsedCommand(true);
    }
  }, []);

  // Guardar nombres en localStorage
  useEffect(() => {
    if (names.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
    }
  }, [names]);

  // Guardar tamaño de letra en localStorage
  useEffect(() => {
    localStorage.setItem(FONT_SIZE_KEY, fontSize.toString());
  }, [fontSize]);

  // Cerrar items activos al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".name-item")) {
        setActiveId(null);
        setSelectedIds(new Set());
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Focus en el input de edición cuando se activa
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  // Atajo de teclado Ctrl+K para abrir el Command
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenCommand((open) => {
          // Marcar como usado cuando se abre por primera vez
          if (!open && !hasUsedCommand) {
            setHasUsedCommand(true);
            localStorage.setItem(COMMAND_USED_KEY, "true");
          }
          return !open;
        });
        setCommandMode("main");
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [hasUsedCommand]);

  // Mantener el foco en el input del Command cuando cambia el modo
  useEffect(() => {
    if (openCommand) {
      // Pequeño delay para asegurar que el DOM se haya actualizado
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

  // Resetear selección cuando cambia el modo o se cierra el Command
  useEffect(() => {
    if (!openCommand || commandMode !== "delete") {
      setSelectedForDeletion(new Set());
    }
  }, [openCommand, commandMode]);

  // Manejar tecla ENTER y SPACE en modo delete
  useEffect(() => {
    if (!openCommand || commandMode !== "delete") return;

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
            deleteNamesByIds(idsToDelete);
            setSelectedForDeletion(new Set());
            setOpenCommand(false);
          },
        });
      } else if (e.key === " " && commandMode === "delete") {
        e.preventDefault();
        e.stopPropagation();
        // Obtener el item actualmente seleccionado en el Command
        const selectedItem = document.querySelector(
          '[cmdk-item][aria-selected="true"]'
        ) as HTMLElement;
        if (selectedItem) {
          const itemId = selectedItem.getAttribute("data-item-id");
          if (itemId) {
            const newSelected = new Set(selectedForDeletion);
            if (newSelected.has(itemId)) {
              newSelected.delete(itemId);
            } else {
              newSelected.add(itemId);
            }
            setSelectedForDeletion(newSelected);
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [openCommand, commandMode, selectedForDeletion]);

  const addName = () => {
    const trimmedName = newName.trim();
    if (trimmedName) {
      const newItem: NameItem = {
        id: Date.now().toString(),
        name: trimmedName,
        font: selectedFont, // Guardar la fuente seleccionada
      };
      setNames([...names, newItem]);
      setNewName("");
      inputRef.current?.focus();
      toast.success(`"${trimmedName}" agregado correctamente`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addName();
    }
  };

  const deleteName = (id: string) => {
    const nameToDelete = names.find((item) => item.id === id);
    confirm({
      title: "Eliminar nombre",
      description: `¿Estás seguro de que quieres eliminar "${nameToDelete?.name}"?`,
      confirmText: "Eliminar",
      variant: "destructive",
      onConfirm: () => {
        setNames(names.filter((item) => item.id !== id));
        setActiveId(null);
        setSelectedIds(new Set());
        toast.success(`"${nameToDelete?.name}" eliminado correctamente`);
      },
    });
  };

  const deleteSelectedNames = () => {
    if (selectedIds.size === 0) return;

    const count = selectedIds.size;
    confirm({
      title: "Eliminar nombres seleccionados",
      description: `¿Estás seguro de que quieres eliminar ${count} nombre(s) seleccionado(s)?`,
      confirmText: "Eliminar",
      variant: "destructive",
      onConfirm: () => {
        setNames(names.filter((item) => !selectedIds.has(item.id)));
        setSelectedIds(new Set());
        setActiveId(null);
        toast.success(`${count} nombre(s) eliminado(s) correctamente`);
      },
    });
  };

  const deleteNamesByIds = (ids: string[]) => {
    const count = ids.length;
    setNames(names.filter((item) => !ids.includes(item.id)));
    setSelectedIds(new Set());
    setActiveId(null);
    toast.success(`${count} nombre(s) eliminado(s) correctamente`);
  };

  const deleteAllNames = () => {
    if (names.length === 0) return;

    const count = names.length;
    confirm({
      title: "Eliminar todos los nombres",
      description: `¿Estás seguro de que quieres eliminar todos los ${count} nombre(s)? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar todos",
      variant: "destructive",
      onConfirm: () => {
        setNames([]);
        localStorage.removeItem(STORAGE_KEY);
        setActiveId(null);
        toast.success(`Todos los nombres (${count}) eliminados correctamente`);
      },
    });
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  const toggleActive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Si se presiona Ctrl/Cmd, activar selección múltiple
    if (e.ctrlKey || e.metaKey) {
      const newSelected = new Set(selectedIds);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      setSelectedIds(newSelected);
      // Mantener activeId para mostrar botones
      if (newSelected.size > 0) {
        setActiveId(id);
      } else {
        setActiveId(null);
      }
    } else {
      // Click normal: limpiar selección múltiple y alternar active
      setSelectedIds(new Set());
      setActiveId(activeId === id ? null : id);
    }
  };

  const handleCommandEditName = (id: string) => {
    const item = names.find((n) => n.id === id);
    if (item) {
      // Scroll al elemento
      const element = document.querySelector(`[data-id="${id}"]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      // Activar y empezar a editar
      setActiveId(id);
      setTimeout(() => {
        startEdit(id, item.name);
      }, 100);
      setOpenCommand(false);
    }
  };

  const startEdit = (id: string, currentName: string) => {
    const item = names.find((n) => n.id === id);
    setEditingId(id);
    setEditValue(currentName);

    // Cargar estilos existentes si los hay
    if (item?.charStyles) {
      const stylesMap = new Map<number, string>();
      const fontsMap = new Map<number, string>();
      item.charStyles.forEach((style) => {
        stylesMap.set(style.index, style.feature);
        if (style.font) {
          fontsMap.set(style.index, style.font);
        }
      });
      setEditingStyles(stylesMap);
      setEditingFonts(fontsMap);
    } else {
      setEditingStyles(new Map());
      setEditingFonts(new Map());
    }
    // Cargar el tamaño de fuente del item o usar el global por defecto
    setEditingFontSize(item?.fontSize || fontSize);
    setSelectedCharIndex(null);
    setShowStyleEditor(false);
  };

  const saveEdit = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && editingId) {
      // Convertir el Map de estilos y fuentes a array
      const charStyles: CharStyle[] = [];
      editingStyles.forEach((feature, index) => {
        if (index < trimmedValue.length) {
          const charStyle: CharStyle = { index, feature };
          // Agregar fuente si existe para este carácter
          const font = editingFonts.get(index);
          if (font) {
            charStyle.font = font;
          }
          // Solo agregar si no es normal o tiene fuente personalizada
          if (feature !== "normal" || font) {
            charStyles.push(charStyle);
          }
        }
      });

      setNames(
        names.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: trimmedValue,
                charStyles: charStyles.length > 0 ? charStyles : undefined,
                fontSize:
                  editingFontSize !== fontSize ? editingFontSize : undefined,
              }
            : item
        )
      );
      setEditingId(null);
      setEditValue("");
      setEditingStyles(new Map());
      setEditingFonts(new Map());
      setSelectedCharIndex(null);
      setShowStyleEditor(false);
      toast.success(`"${trimmedValue}" actualizado correctamente`);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
    setEditingStyles(new Map());
    setSelectedCharIndex(null);
    setShowStyleEditor(false);
  };

  const dismissHint = () => {
    setShowHint(false);
    localStorage.setItem(HINT_KEY, "true");
  };

  const handleCharClick = (index: number) => {
    if (editValue[index] === " ") return;
    setSelectedCharIndex(selectedCharIndex === index ? null : index);
    // Abrir el panel de estilos automáticamente cuando se selecciona una letra
    if (selectedCharIndex !== index) {
      setShowStyleEditor(true);
    }
  };

  const applyStyleToChar = (index: number, feature: string) => {
    const newStyles = new Map(editingStyles);
    if (feature === "normal") {
      newStyles.delete(index);
    } else {
      newStyles.set(index, feature);
    }
    setEditingStyles(newStyles);
  };

  const applyStyleToAll = (feature: string) => {
    const newStyles = new Map<number, string>();
    if (feature !== "normal") {
      editValue.split("").forEach((char, index) => {
        if (char !== " ") {
          newStyles.set(index, feature);
        }
      });
      const availableStyles = getAvailableStyles();
      const styleName =
        availableStyles.find((s) => s.feature === feature)?.label || feature;
      toast.success(`Estilo "${styleName}" aplicado a todos los caracteres`);
    }
    setEditingStyles(newStyles);
    setSelectedCharIndex(null);
  };

  const resetAllStyles = () => {
    setEditingStyles(new Map());
    setSelectedCharIndex(null);
    toast.success("Todos los estilos han sido restablecidos");
  };

  const getFontFeatureSettings = (feature: string): string => {
    if (feature === "normal") return "normal";
    return `"${feature}"`;
  };

  const processFile = (file: File) => {
    // Verificar que sea un archivo .txt
    if (!file.name.endsWith(".txt")) {
      alert("Por favor, sube un archivo .txt");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      // Separar por líneas y filtrar vacías
      const lines = content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length === 0) {
        alert("El archivo no contiene nombres válidos");
        return;
      }

      // Crear items para cada línea
      const newItems: NameItem[] = lines.map((line, index) => ({
        id: `${Date.now()}-${index}`,
        name: line,
        font: selectedFont, // Usar la fuente seleccionada actualmente
      }));

      // Agregar a los nombres existentes
      setNames([...names, ...newItems]);

      // Limpiar el input de archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success(`${lines.length} nombre(s) cargado(s) desde el archivo`);
    };

    reader.onerror = () => {
      alert("Error al leer el archivo");
    };

    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <Toaster />
      <ConfirmDialog />

      {/* Command Dialog (Ctrl+K) */}
      <CommandDialog
        open={openCommand}
        onOpenChange={(open) => {
          setOpenCommand(open);
          // Resetear al modo principal cuando se cierra
          if (!open) {
            setCommandMode("main");
          }
        }}
      >
        {commandMode === "main" ? (
          <Command key="main-mode">
            <CommandInput placeholder="Escribe un comando..." autoFocus />
            <CommandList>
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              <CommandGroup heading="Acciones">
                <CommandItem
                  onSelect={() => {
                    setCommandMode("edit");
                  }}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Editar un nombre
                </CommandItem>
                <CommandItem
                  onSelect={() => {
                    setCommandMode("delete");
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar varios nombres
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        ) : commandMode === "edit" ? (
          <Command key="edit-mode">
            <CommandInput
              placeholder="Buscar nombre para editar..."
              autoFocus
            />
            <CommandList>
              <CommandEmpty>No se encontraron nombres.</CommandEmpty>
              <CommandGroup heading="Nombres">
                {names.map((item, index) => {
                  // Contar cuántos nombres iguales hay antes de este
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
                        handleCommandEditName(item.id);
                      }}
                    >
                      <span
                        style={{ fontFamily: "CustomFont, Georgia, serif" }}
                      >
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
                        const newSelected = new Set(selectedForDeletion);
                        if (newSelected.has(item.id)) {
                          newSelected.delete(item.id);
                        } else {
                          newSelected.add(item.id);
                        }
                        setSelectedForDeletion(newSelected);
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
                      <span
                        style={{ fontFamily: "CustomFont, Georgia, serif" }}
                      >
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

      <Card className="input-section">
        <div className="input-group">
          <Input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ingresa un nombre..."
            autoComplete="off"
            className="max-w-md"
          />
          <div className="flex items-center gap-0">
            <FontSelector
              value={selectedFont}
              onValueChange={setSelectedFont}
              className="w-[200px]"
            />
            <IconsGuide />
          </div>
          <Button onClick={addName} size="default">
            <Plus className="mr-2 h-4 w-4" />
            Agregar
          </Button>
          <Button
            onClick={triggerFileUpload}
            variant="secondary"
            size="default"
          >
            <Upload className="mr-2 h-4 w-4" />
            Subir .txt
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <div
            className={`command-hint ${
              !hasUsedCommand ? "command-hint-animated" : ""
            }`}
          >
            {!hasUsedCommand && <span className="command-hint-badge" />}
            <kbd className="kbd-shortcut">Ctrl</kbd>
            <span>+</span>
            <kbd className="kbd-shortcut">K</kbd>
            <span className="hint-text">Comandos</span>
          </div>
        </div>
        <div className="font-size-control">
          <label htmlFor="fontSize">Tamaño de letra:</label>
          <Input
            id="fontSize"
            type="number"
            min="8"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value, 10) || 12)}
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
            <Button onClick={deleteAllNames} variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar todos
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
            <p>📥 Arrastra un archivo .txt aquí</p>
            <p className="empty-state-subtitle">
              o agrega nombres usando el campo de arriba
            </p>
          </div>
        ) : (
          <>
            {names.length > 1 && selectedIds.size === 0 && showHint && (
              <div className="hint-message">
                <span>
                  💡 Usa <kbd>Ctrl+Click</kbd> para seleccionar varios nombres y
                  eliminarlos juntos
                </span>
                <Button
                  onClick={dismissHint}
                  variant="ghost"
                  size="sm"
                  className="hint-close"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
            <ul className="names-list">
              {names.map((item) => (
                <li
                  key={item.id}
                  className={`name-item ${
                    activeId === item.id ? "active" : ""
                  } ${editingId === item.id ? "editing" : ""} ${
                    selectedIds.has(item.id) ? "selected" : ""
                  }`}
                  data-id={item.id}
                  onClick={(e) => toggleActive(item.id, e)}
                >
                  {editingId === item.id ? (
                    <div className="editing-container">
                      {/* Editor de texto con estilos por letra */}
                      <div className="text-editor-area">
                        <div
                          className="styled-text-display"
                          style={{
                            fontFamily: getFontFamily(
                              names.find((n) => n.id === editingId)?.font ||
                                selectedFont
                            ),
                            fontSize: `${editingFontSize}px`,
                          }}
                        >
                          {editValue.split("").map((char, index) => {
                            const feature =
                              editingStyles.get(index) || "normal";
                            const charFont = editingFonts.get(index);
                            const isSelected = selectedCharIndex === index;
                            const isSpace = char === " ";

                            return (
                              <span
                                key={index}
                                className={`char-editable ${
                                  isSelected ? "char-selected" : ""
                                } ${isSpace ? "char-space" : ""}`}
                                style={{
                                  fontFeatureSettings:
                                    getFontFeatureSettings(feature),
                                  fontFamily: charFont
                                    ? getFontFamily(charFont)
                                    : undefined,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCharClick(index);
                                }}
                              >
                                {char}
                              </span>
                            );
                          })}
                        </div>

                        {/* Input oculto para editar el texto */}
                        <Input
                          ref={editInputRef}
                          type="text"
                          className="hidden-text-input"
                          value={editValue}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setEditValue(newValue);
                            // Ajustar estilos y fuentes si el texto cambió de longitud
                            if (newValue.length < editValue.length) {
                              const newStyles = new Map<number, string>();
                              const newFonts = new Map<number, string>();
                              editingStyles.forEach((feature, idx) => {
                                if (idx < newValue.length) {
                                  newStyles.set(idx, feature);
                                }
                              });
                              editingFonts.forEach((font, idx) => {
                                if (idx < newValue.length) {
                                  newFonts.set(idx, font);
                                }
                              });
                              setEditingStyles(newStyles);
                              setEditingFonts(newFonts);
                            }
                            setSelectedCharIndex(null);
                          }}
                          onKeyDown={handleEditKeyPress}
                          style={{ fontSize: `${editingFontSize}px` }}
                        />
                      </div>

                      {/* Control de tamaño de fuente individual */}
                      <div className="font-size-control">
                        <label>Tamaño:</label>
                        <Input
                          type="number"
                          value={editingFontSize}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Permitir cualquier valor durante la escritura
                            const newSize = parseInt(value, 10);
                            if (!isNaN(newSize)) {
                              setEditingFontSize(newSize);
                            } else if (value === "") {
                              setEditingFontSize(8);
                            }
                          }}
                          onBlur={(e) => {
                            // Validar solo cuando se pierde el foco
                            const value = parseInt(e.target.value, 10);
                            if (isNaN(value) || value < 8) {
                              setEditingFontSize(8);
                            } else if (value > 72) {
                              setEditingFontSize(72);
                            }
                          }}
                          min="8"
                          max="72"
                          className="font-size-input"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="font-size-unit">px</span>
                      </div>

                      {/* Botón para mostrar/ocultar editor de estilos */}
                      <div className="editing-actions">
                        <Button
                          size="sm"
                          variant={showStyleEditor ? "default" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowStyleEditor(!showStyleEditor);
                          }}
                        >
                          <Wand2 className="h-4 w-4 mr-1" />
                          Estilos
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveEdit();
                          }}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEdit();
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Panel de estilos OpenType */}
                      {showStyleEditor && (
                        <div
                          className="style-editor-panel"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {selectedCharIndex !== null && (
                            <div className="char-style-selector">
                              <p className="text-xs font-semibold mb-2">
                                Seleccionado: "
                                <span
                                  style={{
                                    fontFamily: "CustomFont, Georgia, serif",
                                    fontSize: "20px",
                                  }}
                                >
                                  {editValue[selectedCharIndex]}
                                </span>
                                " (pos {selectedCharIndex + 1})
                              </p>

                              {/* Selector de fuente para el carácter */}
                              <div className="mb-3">
                                <p className="text-xs font-semibold mb-1">
                                  Fuente:
                                </p>
                                <div className="flex items-center gap-0">
                                  <FontSelector
                                    value={
                                      editingFonts.get(selectedCharIndex) ||
                                      selectedFont
                                    }
                                    onValueChange={(font) => {
                                      const newFonts = new Map(editingFonts);
                                      newFonts.set(selectedCharIndex, font);
                                      setEditingFonts(newFonts);
                                    }}
                                    className="w-full"
                                  />
                                  <IconsGuide />
                                </div>
                              </div>

                              <p className="text-xs font-semibold mb-2">
                                Estilo OpenType:
                              </p>
                              <div className="style-buttons">
                                {getAvailableStyles().map((style) => (
                                  <Button
                                    key={style.feature}
                                    variant={
                                      editingStyles.get(selectedCharIndex) ===
                                        style.feature ||
                                      (style.feature === "normal" &&
                                        !editingStyles.has(selectedCharIndex))
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      applyStyleToChar(
                                        selectedCharIndex,
                                        style.feature
                                      );
                                    }}
                                  >
                                    {style.emoji} {style.label}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="style-actions">
                            <p className="text-xs font-semibold mb-2">
                              Aplicar a todas:
                            </p>
                            <div className="style-buttons">
                              {getAvailableStyles().map((style) => (
                                <Button
                                  key={style.feature}
                                  variant="secondary"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    applyStyleToAll(style.feature);
                                  }}
                                >
                                  {style.emoji}
                                </Button>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  resetAllStyles();
                                }}
                              >
                                Resetear
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            💡 Haz click en una letra arriba para aplicarle un
                            estilo o fuente
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <span
                        className="name-text"
                        style={{
                          fontSize: `${item.fontSize || fontSize}px`,
                          fontFamily: getFontFamily(item.font),
                        }}
                      >
                        {item.charStyles && item.charStyles.length > 0
                          ? // Renderizar con estilos personalizados
                            item.name.split("").map((char, index) => {
                              const charStyle = item.charStyles?.find(
                                (cs) => cs.index === index
                              );
                              const feature = charStyle?.feature || "normal";
                              const charFont = charStyle?.font;
                              return (
                                <span
                                  key={index}
                                  style={{
                                    fontFeatureSettings:
                                      getFontFeatureSettings(feature),
                                    fontFamily: charFont
                                      ? getFontFamily(charFont)
                                      : undefined,
                                  }}
                                >
                                  {char}
                                </span>
                              );
                            })
                          : // Renderizar sin estilos
                            item.name}
                      </span>
                      <div className="name-actions noprint">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(item.id, item.name);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteName(item.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
