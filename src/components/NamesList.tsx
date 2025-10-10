import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Upload, Plus, Trash2, Edit2, Check, X, Wand2 } from "lucide-react";

interface CharStyle {
  index: number;
  feature: string;
}

interface NameItem {
  id: string;
  name: string;
  charStyles?: CharStyle[];
}

export default function NamesList() {
  const [names, setNames] = useState<NameItem[]>([]);
  const [newName, setNewName] = useState("");
  const [fontSize, setFontSize] = useState<number>(12);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [editingStyles, setEditingStyles] = useState<Map<number, string>>(
    new Map()
  );
  const [selectedCharIndex, setSelectedCharIndex] = useState<number | null>(
    null
  );
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const STORAGE_KEY = "names-list";
  const FONT_SIZE_KEY = "names-font-size";

  const LETTER_STYLES = [
    { feature: "normal", label: "Normal", emoji: "📝" },
    { feature: "ss01", label: "Corazón final", emoji: "❤️" },
    { feature: "ss02", label: "Línea + Corazón", emoji: "✨❤️" },
    { feature: "ss03", label: "Alternativa 3", emoji: "🎨" },
    { feature: "swsh", label: "Flourish", emoji: "💫" },
    { feature: "salt", label: "Alternativa", emoji: "🎭" },
  ];

  // Cargar nombres del localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setNames(JSON.parse(stored));
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

  const addName = () => {
    const trimmedName = newName.trim();
    if (trimmedName) {
      const newItem: NameItem = {
        id: Date.now().toString(),
        name: trimmedName,
      };
      setNames([...names, newItem]);
      setNewName("");
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addName();
    }
  };

  const deleteName = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este nombre?")) {
      setNames(names.filter((item) => item.id !== id));
      setActiveId(null);
    }
  };

  const deleteAllNames = () => {
    if (names.length === 0) return;

    if (
      confirm(
        `¿Estás seguro de que quieres eliminar todos los ${names.length} nombre(s)?`
      )
    ) {
      setNames([]);
      localStorage.removeItem(STORAGE_KEY);
      setActiveId(null);
    }
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
    setActiveId(activeId === id ? null : id);
  };

  const startEdit = (id: string, currentName: string) => {
    const item = names.find((n) => n.id === id);
    setEditingId(id);
    setEditValue(currentName);

    // Cargar estilos existentes si los hay
    if (item?.charStyles) {
      const stylesMap = new Map<number, string>();
      item.charStyles.forEach((style) => {
        stylesMap.set(style.index, style.feature);
      });
      setEditingStyles(stylesMap);
    } else {
      setEditingStyles(new Map());
    }
    setSelectedCharIndex(null);
    setShowStyleEditor(false);
  };

  const saveEdit = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && editingId) {
      // Convertir el Map de estilos a array
      const charStyles: CharStyle[] = [];
      editingStyles.forEach((feature, index) => {
        if (feature !== "normal" && index < trimmedValue.length) {
          charStyles.push({ index, feature });
        }
      });

      setNames(
        names.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: trimmedValue,
                charStyles: charStyles.length > 0 ? charStyles : undefined,
              }
            : item
        )
      );
      setEditingId(null);
      setEditValue("");
      setEditingStyles(new Map());
      setSelectedCharIndex(null);
      setShowStyleEditor(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
    setEditingStyles(new Map());
    setSelectedCharIndex(null);
    setShowStyleEditor(false);
  };

  const handleCharClick = (index: number) => {
    if (editValue[index] === " ") return;
    setSelectedCharIndex(selectedCharIndex === index ? null : index);
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
    }
    setEditingStyles(newStyles);
    setSelectedCharIndex(null);
  };

  const resetAllStyles = () => {
    setEditingStyles(new Map());
    setSelectedCharIndex(null);
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
      }));

      // Agregar a los nombres existentes
      setNames([...names, ...newItems]);

      // Limpiar el input de archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
          <ul className="names-list">
            {names.map((item) => (
              <li
                key={item.id}
                className={`name-item ${activeId === item.id ? "active" : ""} ${
                  editingId === item.id ? "editing" : ""
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
                          fontFamily: "CustomFont, Georgia, serif",
                          fontSize: `${fontSize}px`,
                        }}
                      >
                        {editValue.split("").map((char, index) => {
                          const feature = editingStyles.get(index) || "normal";
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
                          // Ajustar estilos si el texto cambió de longitud
                          if (newValue.length < editValue.length) {
                            const newStyles = new Map<number, string>();
                            editingStyles.forEach((feature, idx) => {
                              if (idx < newValue.length) {
                                newStyles.set(idx, feature);
                              }
                            });
                            setEditingStyles(newStyles);
                          }
                          setSelectedCharIndex(null);
                        }}
                        onKeyDown={handleEditKeyPress}
                        style={{ fontSize: `${fontSize}px` }}
                      />
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
                            <div className="style-buttons">
                              {LETTER_STYLES.map((style) => (
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
                            {LETTER_STYLES.map((style) => (
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
                          estilo
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <span
                      className="name-text"
                      style={{
                        fontSize: `${fontSize}px`,
                        fontFamily: "CustomFont, Georgia, serif",
                      }}
                    >
                      {item.charStyles && item.charStyles.length > 0
                        ? // Renderizar con estilos personalizados
                          item.name.split("").map((char, index) => {
                            const charStyle = item.charStyles?.find(
                              (cs) => cs.index === index
                            );
                            const feature = charStyle?.feature || "normal";
                            return (
                              <span
                                key={index}
                                style={{
                                  fontFeatureSettings:
                                    getFontFeatureSettings(feature),
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
        )}
      </div>
    </>
  );
}
