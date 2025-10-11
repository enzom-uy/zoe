import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Plus } from "lucide-react";

interface AddNameInputProps {
  newName: string;
  setNewName: (name: string) => void;
  onAddName: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasUsedCommand: boolean;
}

export function AddNameInput({
  newName,
  setNewName,
  onAddName,
  onFileUpload,
  hasUsedCommand,
}: AddNameInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onAddName();
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="input-group">
      <Input
        ref={inputRef}
        type="text"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Escribe un nombre..."
        className="flex-1"
      />
      <Button onClick={onAddName} size="default">
        <Plus className="mr-2 h-4 w-4" />
        Agregar
      </Button>
      <Button onClick={triggerFileUpload} variant="secondary" size="default">
        <Upload className="mr-2 h-4 w-4" />
        Subir .txt
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt"
        onChange={onFileUpload}
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
  );
}
