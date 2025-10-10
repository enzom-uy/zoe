import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Wand2, RotateCcw } from "lucide-react";

interface LetterStyle {
  feature: string;
  label: string;
  emoji: string;
}

const LETTER_STYLES: LetterStyle[] = [
  { feature: "normal", label: "Normal", emoji: "📝" },
  { feature: "ss01", label: "Corazón final", emoji: "❤️" },
  { feature: "ss02", label: "Línea + Corazón", emoji: "✨❤️" },
  { feature: "ss03", label: "Alternativa 3", emoji: "🎨" },
  { feature: "swsh", label: "Flourish", emoji: "💫" },
  { feature: "salt", label: "Alternativa", emoji: "🎭" },
];

interface CharStyle {
  char: string;
  feature: string;
}

interface OpenTypeEditorProps {
  text: string;
  fontSize: number;
  onTextChange?: (text: string) => void;
  onStylesChange?: (styles: CharStyle[]) => void;
}

export function OpenTypeEditor({
  text,
  fontSize,
  onTextChange,
  onStylesChange,
}: OpenTypeEditorProps) {
  const [charStyles, setCharStyles] = useState<Map<number, string>>(new Map());
  const [selectedCharIndex, setSelectedCharIndex] = useState<number | null>(
    null
  );

  const handleCharClick = (index: number) => {
    setSelectedCharIndex(selectedCharIndex === index ? null : index);
  };

  const applyStyleToChar = (index: number, feature: string) => {
    const newStyles = new Map(charStyles);
    if (feature === "normal") {
      newStyles.delete(index);
    } else {
      newStyles.set(index, feature);
    }
    setCharStyles(newStyles);

    // Notificar cambios
    if (onStylesChange) {
      const stylesArray: CharStyle[] = [];
      text.split("").forEach((char, i) => {
        stylesArray.push({
          char,
          feature: newStyles.get(i) || "normal",
        });
      });
      onStylesChange(stylesArray);
    }
  };

  const resetAllStyles = () => {
    setCharStyles(new Map());
    setSelectedCharIndex(null);
    if (onStylesChange) {
      onStylesChange(
        text.split("").map((char) => ({ char, feature: "normal" }))
      );
    }
  };

  const applyStyleToAll = (feature: string) => {
    const newStyles = new Map<number, string>();
    if (feature !== "normal") {
      text.split("").forEach((_, index) => {
        if (text[index] !== " ") {
          newStyles.set(index, feature);
        }
      });
    }
    setCharStyles(newStyles);
    setSelectedCharIndex(null);
  };

  const getFontFeatureSettings = (feature: string): string => {
    if (feature === "normal") return "normal";
    return `"${feature}"`;
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Editor de Alternativas OpenType
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetAllStyles}
            disabled={charStyles.size === 0}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetear
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Área de texto editable con estilos por letra */}
        <div
          className="mb-4 p-4 bg-muted rounded-md min-h-[120px] flex flex-wrap items-center gap-1"
          style={{
            fontFamily: "CustomFont, Georgia, serif",
            fontSize: `${fontSize}px`,
            lineHeight: 1.6,
          }}
        >
          {text.split("").map((char, index) => {
            const feature = charStyles.get(index) || "normal";
            const isSelected = selectedCharIndex === index;
            const isSpace = char === " ";

            return (
              <span
                key={index}
                className={`inline-block cursor-pointer transition-all ${
                  isSelected
                    ? "bg-primary/20 ring-2 ring-primary rounded"
                    : "hover:bg-accent rounded"
                } ${isSpace ? "w-4" : "px-1"}`}
                style={{
                  fontFeatureSettings: getFontFeatureSettings(feature),
                }}
                onClick={() => !isSpace && handleCharClick(index)}
                title={`Carácter: ${char} | Estilo: ${feature}`}
              >
                {char}
              </span>
            );
          })}
        </div>

        {/* Panel de control cuando hay un carácter seleccionado */}
        {selectedCharIndex !== null && (
          <div className="mb-4 p-4 bg-accent rounded-md border-2 border-primary">
            <p className="text-sm font-semibold mb-3">
              Seleccionado: "
              <span
                style={{
                  fontFamily: "CustomFont, Georgia, serif",
                  fontSize: "24px",
                }}
              >
                {text[selectedCharIndex]}
              </span>
              " (posición {selectedCharIndex + 1})
            </p>
            <div className="flex flex-wrap gap-2">
              {LETTER_STYLES.map((style) => (
                <Button
                  key={style.feature}
                  variant={
                    charStyles.get(selectedCharIndex) === style.feature ||
                    (style.feature === "normal" &&
                      !charStyles.has(selectedCharIndex))
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    applyStyleToChar(selectedCharIndex, style.feature)
                  }
                >
                  {style.emoji} {style.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Aplicar estilo a todas las letras */}
        <div className="border-t pt-4">
          <p className="text-sm font-semibold mb-3 text-muted-foreground">
            Aplicar estilo a todas las letras:
          </p>
          <div className="flex flex-wrap gap-2">
            {LETTER_STYLES.map((style) => (
              <Button
                key={style.feature}
                variant="secondary"
                size="sm"
                onClick={() => applyStyleToAll(style.feature)}
              >
                {style.emoji} {style.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Preview de cada estilo */}
        <div className="mt-4 border-t pt-4">
          <p className="text-sm font-semibold mb-3 text-muted-foreground">
            Vista previa de estilos disponibles:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {LETTER_STYLES.map((style) => (
              <div
                key={style.feature}
                className="p-3 bg-muted rounded-md text-center"
              >
                <div className="text-xs text-muted-foreground mb-1">
                  {style.emoji} {style.label}
                </div>
                <div
                  style={{
                    fontFamily: "CustomFont, Georgia, serif",
                    fontSize: "32px",
                    fontFeatureSettings: getFontFeatureSettings(style.feature),
                  }}
                >
                  {text.slice(0, 5) || "Texto"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instrucciones */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md text-sm">
          <p className="font-semibold mb-1">💡 Instrucciones:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Haz clic en cualquier letra para seleccionarla</li>
            <li>Elige un estilo OpenType para esa letra específica</li>
            <li>
              Usa "Aplicar a todas" para aplicar un estilo a todo el texto
            </li>
            <li>
              <strong>❤️ Corazón final:</strong> Letra termina con corazón
            </li>
            <li>
              <strong>✨❤️ Línea + Corazón:</strong> Letra comienza con línea
              caligráfica
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
