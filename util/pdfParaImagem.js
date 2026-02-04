import { execSync } from "child_process";
import path from "path";

export async function pdfParaImagem(pdfPath) {
  const outputDir = path.dirname(pdfPath);
  const outputName = path.basename(pdfPath, path.extname(pdfPath));
  const outputPath = path.join(outputDir, `${outputName}.png`);

  // Usa pdftoppm do poppler-utils
  execSync(`pdftoppm -png -f 1 -l 1 -singlefile "${pdfPath}" "${path.join(outputDir, outputName)}"`);

  return outputPath;
}