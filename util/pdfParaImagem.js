import { execSync } from "child_process";
import { createRequire } from "module";
import path from "path";
import os from "os";

export async function pdfParaImagem(pdfPath) {
  const outputDir = path.dirname(pdfPath);
  const outputName = path.basename(pdfPath, path.extname(pdfPath));

  // Windows: usa pdf-poppler
  if (os.platform() === "win32") {
    const require = createRequire(import.meta.url);
    const pdfPoppler = require("pdf-poppler");

    await pdfPoppler.convert(pdfPath, {
      format: "png",
      out_dir: outputDir,
      out_prefix: outputName,
      page: 1
    });

    return path.join(outputDir, `${outputName}-1.png`);
  }

  // Linux: usa pdftoppm direto
  const outputPath = path.join(outputDir, `${outputName}.png`);
  execSync(`pdftoppm -png -f 1 -l 1 -singlefile "${pdfPath}" "${path.join(outputDir, outputName)}"`);

  return outputPath;
}