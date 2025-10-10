import { useState, useEffect, useRef } from "react";

interface NameItem {
  id: string;
  name: string;
}

export default function NamesList() {
  const [names, setNames] = useState<NameItem[]>([]);
  const [newName, setNewName] = useState("");
  const [fontSize, setFontSize] = useState<number>(12);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const STORAGE_KEY = "names-list";
  const FONT_SIZE_KEY = "names-font-size";

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

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const saveEdit = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && editingId) {
      setNames(
        names.map((item) =>
          item.id === editingId ? { ...item, name: trimmedValue } : item
        )
      );
      setEditingId(null);
      setEditValue("");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
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
      <div className="input-section">
        <div className="input-group">
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ingresa un nombre..."
            autoComplete="off"
          />
          <button className="add-btn" onClick={addName}>
            Agregar
          </button>
          <button className="upload-btn" onClick={triggerFileUpload}>
            📁 Subir .txt
          </button>
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
          <input
            id="fontSize"
            type="number"
            min="8"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value, 10) || 12)}
            className="font-size-input"
          />
          <span className="font-size-unit">px</span>
        </div>
        {names.length > 0 && (
          <div className="actions-section">
            <button className="delete-all-btn" onClick={deleteAllNames}>
              🗑️ Eliminar todos
            </button>
          </div>
        )}
      </div>

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
                  <>
                    <input
                      ref={editInputRef}
                      type="text"
                      className="edit-input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleEditKeyPress}
                      style={{ fontSize: `${fontSize}px` }}
                    />
                    <div className="name-actions">
                      <button
                        className="save-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          saveEdit();
                        }}
                      >
                        Guardar
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelEdit();
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span
                      className="name-text"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {item.name}
                    </span>
                    <div className="name-actions noprint">
                      <button
                        className="edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(item.id, item.name);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteName(item.id);
                        }}
                      >
                        Borrar
                      </button>
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
