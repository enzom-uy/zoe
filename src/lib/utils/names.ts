import type { NameItem } from "@/lib/types/names";

export function processTextFile(
  file: File,
  existingNames: NameItem[]
): Promise<NameItem[]> {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith(".txt")) {
      reject(new Error("Por favor, sube un archivo .txt"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) {
        reject(new Error("El archivo está vacío"));
        return;
      }

      const lines = content
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (lines.length === 0) {
        reject(new Error("El archivo no contiene nombres válidos"));
        return;
      }

      const newItems: NameItem[] = lines.map((line, index) => ({
        id: `${Date.now()}-${index}`,
        name: line,
      }));

      resolve([...existingNames, ...newItems]);
    };

    reader.onerror = () => {
      reject(new Error("Error al leer el archivo"));
    };

    reader.readAsText(file);
  });
}

export function getFontFeatureSettings(feature: string): string {
  if (feature === "normal") return "normal";
  return `"${feature}"`;
}

export function scrollToElement(selector: string) {
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

export function focusElement(selector: string, delay = 100) {
  setTimeout(() => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
      if (element instanceof HTMLInputElement) {
        element.select();
      }
    }
  }, delay);
}
