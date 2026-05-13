export type RenderHtmlToPdfOptions = {
  format?: "A4" | "Letter";
  margin?: { top?: string; right?: string; bottom?: string; left?: string };
  printBackground?: boolean;
};
