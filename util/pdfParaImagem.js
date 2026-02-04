import { createCanvas } from "canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { writeFileSync } from "fs";
import path from "path";

export async function pdfParaImagem(pdfPath) {
  // Carrega o PDF
  const pdf = await pdfjsLib.getDocument(pdfPath).promise;
  
  // Pega a primeira página
  const page = await pdf.getPage(1);
  
  // Define a escala (2 = boa qualidade para OCR)
  const scale = 2;
  const viewport = page.getViewport({ scale });
  
  // Cria o canvas
  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext("2d");
  
  // Renderiza a página no canvas
  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;
  
  // Salva como PNG
  const outputPath = pdfPath.replace(".pdf", ".png");
  const buffer = canvas.toBuffer("image/png");
  writeFileSync(outputPath, buffer);
  
  return outputPath;
}