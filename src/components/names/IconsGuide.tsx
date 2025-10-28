import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

export function IconsGuide() {
  const [open, setOpen] = useState(false);

  // Alfabeto completo para mapear con los iconos
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const lowercaseLetters = "abcdefghijklmnopqrstuvwxyz".split("");
  const numbers = "0123456789".split("");
  const symbols = "!@#$%^&*()_+-=[]{}|;:',.<>?/~`".split("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <HelpCircle className="mr-2 h-4 w-4" />
          Guía de Iconos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🎄 Guía de Iconos - Christmas Icons</DialogTitle>
          <DialogDescription>
            Cada letra corresponde a un ícono navideño diferente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Letras Mayúsculas */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">
              Letras Mayúsculas (A-Z)
            </h3>
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
              {letters.map((letter) => (
                <div
                  key={letter}
                  className="flex flex-col items-center p-3 border rounded-lg bg-background hover:bg-accent transition-colors"
                >
                  <span
                    className="text-4xl mb-2"
                    style={{ fontFamily: "ChristmasIcons, serif" }}
                  >
                    {letter}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {letter}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Letras Minúsculas */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">
              Letras Minúsculas (a-z)
            </h3>
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
              {lowercaseLetters.map((letter) => (
                <div
                  key={letter}
                  className="flex flex-col items-center p-3 border rounded-lg bg-background hover:bg-accent transition-colors"
                >
                  <span
                    className="text-4xl mb-2"
                    style={{ fontFamily: "ChristmasIcons, serif" }}
                  >
                    {letter}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {letter}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Números */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">Números (0-9)</h3>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-4">
              {numbers.map((num) => (
                <div
                  key={num}
                  className="flex flex-col items-center p-3 border rounded-lg bg-background hover:bg-accent transition-colors"
                >
                  <span
                    className="text-4xl mb-2"
                    style={{ fontFamily: "ChristmasIcons, serif" }}
                  >
                    {num}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {num}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Símbolos */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">
              Símbolos y Caracteres Especiales
            </h3>
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
              {symbols.map((symbol, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center p-3 border rounded-lg bg-background hover:bg-accent transition-colors"
                >
                  <span
                    className="text-4xl mb-2"
                    style={{ fontFamily: "ChristmasIcons, serif" }}
                  >
                    {symbol}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {symbol}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Instrucciones */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">💡 Cómo usar:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Selecciona la fuente "Christmas Icons" en el selector</li>
              <li>• Escribe las letras normales (A, B, C...)</li>
              <li>• Se mostrarán automáticamente como iconos navideños</li>
              <li>
                • Puedes mezclar diferentes fuentes editando el nombre después
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
