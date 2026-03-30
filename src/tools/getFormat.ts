import { MermaidTemplates } from '../utils/templates';

export async function getMermaidFormat(diagramType?: string) {
  if (!diagramType) {
    return {
      supported_types: Object.keys(MermaidTemplates),
      message: "Silakan pilih salah satu tipe untuk mendapatkan format detail.",
    };
  }

  const template = MermaidTemplates[diagramType.toLowerCase()];
  if (!template) {
    throw new Error(
      `Tipe diagram '${diagramType}' tidak didukung. Tipe yang tersedia: ${Object.keys(MermaidTemplates).join(', ')}`
    );
  }

  return template;
}
