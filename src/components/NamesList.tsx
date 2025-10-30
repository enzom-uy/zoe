import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
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
import { ColorPicker } from "./names/ColorPicker";
import { getFontFamily, getFontStyles, getFontConfig } from "@/lib/fontConfig";
import type { LetterStyle } from "@/lib/fontConfig";
import { Upload, Plus, Trash2, Edit2, Check, X, Wand2 } from "lucide-react";

interface CharStyle {
  index: number;
  feature: string;
  font?: string; // Para edición avanzada: fuente por carácter
  color?: string; // Para edición avanzada: color por carácter
}

interface NameItem {
  id: string;
  name: string;
  font: string; // Fuente principal del nombre
  color: string; // Color principal del nombre
  charStyles?: CharStyle[];
  fontSize?: number;
}

export default function NamesList() {
  const [names, setNames] = useState<NameItem[]>([]);
  const [newName, setNewName] = useState("");
  const [selectedFont, setSelectedFont] = useState("CustomFont"); // Fuente por defecto
  const [selectedColor, setSelectedColor] = useState("#000000"); // Color por defecto (negro)
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
  const [editingColors, setEditingColors] = useState<Map<number, string>>(
    new Map()
  ); // Para colores por carácter en el editor
  const [selectedCharIndexes, setSelectedCharIndexes] = useState<Set<number>>(
    new Set()
  ); // Cambiado a Set para permitir selección múltiple
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
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
        // Migrar nombres antiguos sin fuente o color a valores por defecto
        const migratedNames = loadedNames.map((item) => ({
          ...item,
          font: item.font || "CustomFont", // Asignar fuente por defecto si no existe
          color: item.color || "#000000", // Asignar color negro por defecto si no existe
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
        color: selectedColor, // Guardar el color seleccionado
      };
      setNames([...names, newItem]);
      setNewName("");
      textareaRef.current?.focus();
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

  // Cambiar fuente de todos los nombres
  const changeAllFonts = (newFont: string) => {
    if (names.length === 0) return;

    const updatedNames = names.map((item) => ({
      ...item,
      font: newFont,
    }));
    setNames(updatedNames);
    toast.success(`Fuente cambiada a ${newFont} para todos los nombres`);
  };

  // Cambiar tamaño de letra de todos los nombres
  const changeAllFontSizes = (newSize: number) => {
    if (names.length === 0) return;

    const updatedNames = names.map((item) => ({
      ...item,
      fontSize: newSize,
    }));
    setNames(updatedNames);
    toast.success(`Tamaño cambiado a ${newSize}px para todos los nombres`);
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
      const colorsMap = new Map<number, string>();
      item.charStyles.forEach((style) => {
        stylesMap.set(style.index, style.feature);
        if (style.font) {
          fontsMap.set(style.index, style.font);
        }
        if (style.color) {
          colorsMap.set(style.index, style.color);
        }
      });
      setEditingStyles(stylesMap);
      setEditingFonts(fontsMap);
      setEditingColors(colorsMap);
    } else {
      setEditingStyles(new Map());
      setEditingFonts(new Map());
      setEditingColors(new Map());
    }
    // Cargar el tamaño de fuente del item o usar el global por defecto
    setEditingFontSize(item?.fontSize || fontSize);
    setSelectedCharIndexes(new Set());
    setShowStyleEditor(false);
  };

  const saveEdit = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && editingId) {
      // Convertir el Map de estilos, fuentes y colores a array
      const charStyles: CharStyle[] = [];
      editingStyles.forEach((feature, index) => {
        if (index < trimmedValue.length) {
          const charStyle: CharStyle = { index, feature };
          // Agregar fuente si existe para este carácter
          const font = editingFonts.get(index);
          if (font) {
            charStyle.font = font;
          }
          // Agregar color si existe para este carácter
          const color = editingColors.get(index);
          if (color) {
            charStyle.color = color;
          }
          // Solo agregar si no es normal o tiene fuente/color personalizada
          if (feature !== "normal" || font || color) {
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
      setEditingColors(new Map());
      setSelectedCharIndexes(new Set());
      setShowStyleEditor(false);
      toast.success(`"${trimmedValue}" actualizado correctamente`);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
    setEditingStyles(new Map());
    setSelectedCharIndexes(new Set());
    setShowStyleEditor(false);
  };

  const dismissHint = () => {
    setShowHint(false);
    localStorage.setItem(HINT_KEY, "true");
  };

  const handleCharClick = (index: number, ctrlKey: boolean = false) => {
    if (editValue[index] === " ") return;

    if (ctrlKey) {
      // CTRL + Click: agregar/quitar de la selección múltiple
      const newSelection = new Set(selectedCharIndexes);
      if (newSelection.has(index)) {
        newSelection.delete(index);
      } else {
        newSelection.add(index);
      }
      setSelectedCharIndexes(newSelection);
    } else {
      // Click normal: seleccionar solo este carácter
      setSelectedCharIndexes(new Set([index]));
    }

    // Abrir el panel de estilos automáticamente cuando se selecciona una letra
    setShowStyleEditor(true);
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
    setSelectedCharIndexes(new Set());
  };

  const resetAllStyles = () => {
    setEditingStyles(new Map());
    setSelectedCharIndexes(new Set());
    toast.success("Todos los estilos han sido restablecidos");
  };

  const applyColorToAll = (color: string) => {
    const newColors = new Map<number, string>();
    editValue.split("").forEach((char, index) => {
      newColors.set(index, color);
    });
    setEditingColors(newColors);
    toast.success(`Color aplicado a todos los caracteres`);
  };

  const resetAllColors = () => {
    setEditingColors(new Map());
    toast.success("Colores restablecidos");
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
        color: selectedColor, // Usar el color seleccionado actualmente
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

  // Funciones para reordenar nombres con drag and drop
  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", id);
    // Agregar una clase visual al elemento arrastrado
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e: React.DragEvent<HTMLLIElement>) => {
    e.currentTarget.style.opacity = "1";
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedItem && draggedItem !== id) {
      setDragOverItem(id);
    }
  };

  const handleDragOverItem = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropItem = (e: React.DragEvent<HTMLLIElement>, targetId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    // Encontrar los índices
    const draggedIndex = names.findIndex((item) => item.id === draggedItem);
    const targetIndex = names.findIndex((item) => item.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    // Crear nueva copia del array reordenado
    const newNames = [...names];
    const [removed] = newNames.splice(draggedIndex, 1);
    newNames.splice(targetIndex, 0, removed);

    setNames(newNames);
    setDraggedItem(null);
    setDragOverItem(null);
    toast.success("Nombre reordenado correctamente");
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
          <Textarea
            ref={textareaRef}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              // Permitir Enter solo si no hay Shift presionado
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                addName();
              }
            }}
            placeholder="Ingresa un nombre... (Shift+Enter para nueva línea)"
            autoComplete="off"
            className="max-w-md min-h-[40px] resize-y"
            rows={1}
          />
          <div className="flex items-center gap-0">
            <FontSelector
              value={selectedFont}
              onValueChange={setSelectedFont}
              className="w-[200px]"
            />
            <IconsGuide />
          </div>
          <ColorPicker
            value={selectedColor}
            onChange={setSelectedColor}
            className="w-[120px]"
          />
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
            min="1"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value, 10) || 12)}
            className="font-size-input w-20"
          />
          <span className="font-size-unit">px</span>
        </div>

        {/* Controles globales para cambiar fuente y tamaño de todos los nombres */}
        {names.length > 0 && (
          <div className="global-controls">
            <p className="text-sm font-semibold mb-2">Cambiar todos los nombres:</p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-xs">Fuente:</label>
                <FontSelector
                  value={selectedFont}
                  onValueChange={(font) => {
                    changeAllFonts(font);
                    setSelectedFont(font);
                  }}
                  className="w-[180px]"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs">Tamaño:</label>
                <Input
                  type="number"
                  min="1"
                  defaultValue={fontSize}
                  onChange={(e) => {
                    const newSize = parseInt(e.target.value, 10);
                    if (!isNaN(newSize) && newSize >= 1) {
                      changeAllFontSizes(newSize);
                    }
                  }}
                  className="w-20"
                />
                <span className="text-xs">px</span>
              </div>
            </div>
          </div>
        )}

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
                  } ${dragOverItem === item.id ? "drag-over" : ""}`}
                  data-id={item.id}
                  draggable={editingId !== item.id}
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragEnd={handleDragEnd}
                  onDragEnter={(e) => handleDragEnter(e, item.id)}
                  onDragOver={handleDragOverItem}
                  onDrop={(e) => handleDropItem(e, item.id)}
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
                            color:
                              names.find((n) => n.id === editingId)?.color ||
                              selectedColor,
                          }}
                        >
                          {editValue.split("").map((char, index) => {
                            const feature =
                              editingStyles.get(index) || "normal";
                            const charFont = editingFonts.get(index);
                            const charColor = editingColors.get(index);
                            const isSelected = selectedCharIndexes.has(index);
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
                                  color: charColor || undefined,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCharClick(
                                    index,
                                    e.ctrlKey || e.metaKey
                                  );
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
                            // Ajustar estilos, fuentes y colores si el texto cambió de longitud
                            if (newValue.length < editValue.length) {
                              const newStyles = new Map<number, string>();
                              const newFonts = new Map<number, string>();
                              const newColors = new Map<number, string>();
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
                              editingColors.forEach((color, idx) => {
                                if (idx < newValue.length) {
                                  newColors.set(idx, color);
                                }
                              });
                              setEditingStyles(newStyles);
                              setEditingFonts(newFonts);
                              setEditingColors(newColors);
                            }
                            setSelectedCharIndexes(new Set());
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
                              setEditingFontSize(1);
                            }
                          }}
                          onBlur={(e) => {
                            // Validar solo cuando se pierde el foco
                            const value = parseInt(e.target.value, 10);
                            if (isNaN(value) || value < 1) {
                              setEditingFontSize(1);
                            }
                          }}
                          min="1"
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
                          {selectedCharIndexes.size > 0 && (
                            <div className="char-style-selector">
                              <p className="text-xs font-semibold mb-2">
                                {selectedCharIndexes.size === 1
                                  ? `Seleccionado: "${
                                      editValue[
                                        Array.from(selectedCharIndexes)[0]
                                      ]
                                    }" (pos ${
                                      Array.from(selectedCharIndexes)[0] + 1
                                    })`
                                  : `${selectedCharIndexes.size} caracteres seleccionados`}
                              </p>

                              {/* Selector de fuente para los caracteres seleccionados */}
                              <div className="mb-3">
                                <p className="text-xs font-semibold mb-1">
                                  Fuente y Color:
                                </p>
                                <div className="flex items-center gap-2">
                                  <FontSelector
                                    value={
                                      selectedCharIndexes.size === 1
                                        ? editingFonts.get(
                                            Array.from(selectedCharIndexes)[0]
                                          ) || selectedFont
                                        : selectedFont
                                    }
                                    onValueChange={(font) => {
                                      const newFonts = new Map(editingFonts);
                                      selectedCharIndexes.forEach((index) => {
                                        newFonts.set(index, font);
                                      });
                                      setEditingFonts(newFonts);
                                    }}
                                    className="w-full"
                                  />
                                  <ColorPicker
                                    value={
                                      selectedCharIndexes.size === 1
                                        ? editingColors.get(
                                            Array.from(selectedCharIndexes)[0]
                                          ) ||
                                          names.find((n) => n.id === editingId)
                                            ?.color ||
                                          selectedColor
                                        : names.find((n) => n.id === editingId)
                                            ?.color || selectedColor
                                    }
                                    onChange={(color) => {
                                      const newColors = new Map(editingColors);
                                      selectedCharIndexes.forEach((index) => {
                                        newColors.set(index, color);
                                      });
                                      setEditingColors(newColors);
                                    }}
                                    className="w-auto"
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
                                      selectedCharIndexes.size === 1 &&
                                      (editingStyles.get(
                                        Array.from(selectedCharIndexes)[0]
                                      ) === style.feature ||
                                        (style.feature === "normal" &&
                                          !editingStyles.has(
                                            Array.from(selectedCharIndexes)[0]
                                          )))
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newStyles = new Map(editingStyles);
                                      selectedCharIndexes.forEach((index) => {
                                        if (style.feature === "normal") {
                                          newStyles.delete(index);
                                        } else {
                                          newStyles.set(index, style.feature);
                                        }
                                      });
                                      setEditingStyles(newStyles);
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

                          {/* Sección de colores globales */}
                          <div className="style-actions mt-4">
                            <p className="text-xs font-semibold mb-2">
                              Cambiar color de todo el nombre:
                            </p>
                            <div className="flex gap-2 items-center">
                              <ColorPicker
                                value={
                                  names.find((n) => n.id === editingId)
                                    ?.color || selectedColor
                                }
                                onChange={(color) => {
                                  applyColorToAll(color);
                                }}
                                className="flex-1"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  resetAllColors();
                                }}
                              >
                                Resetear colores
                              </Button>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground mt-2">
                            💡 Click en una letra para seleccionar | CTRL+Click
                            para seleccionar múltiples
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
                          color: item.color,
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
                              const charColor = charStyle?.color;
                              return (
                                <span
                                  key={index}
                                  style={{
                                    fontFeatureSettings:
                                      getFontFeatureSettings(feature),
                                    fontFamily: charFont
                                      ? getFontFamily(charFont)
                                      : undefined,
                                    color: charColor || undefined,
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
