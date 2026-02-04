import fs from "fs";
import { createCanvas } from "canvas";
import pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import path from "path";
import { fileURLToPath } from "url";

// CONFIGURAÇÃO OBRIGATÓRIA DO WORKER
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

pdfjsLib.GlobalWorkerOptions.workerSrc =
  path.join(__dirname, "node_modules/pdfjs-dist/legacy/build/pdf.worker.js");

export async function pdfParaImagem(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));

  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const page = await pdf.getPage(1);

  const viewport = page.getViewport({ scale: 2 });
  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext("2d");

  await page.render({ canvasContext: context, viewport }).promise;

  const outputPath = pdfPath + ".png";
  fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));

  return outputPath;
}
