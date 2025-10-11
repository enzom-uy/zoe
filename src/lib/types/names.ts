export interface CharStyle {
  index: number;
  feature: string;
}

export interface NameItem {
  id: string;
  name: string;
  charStyles?: CharStyle[];
  fontSize?: number;
}

export type CommandMode = "main" | "edit" | "delete";

export interface LetterStyle {
  feature: string;
  label: string;
  emoji: string;
}
