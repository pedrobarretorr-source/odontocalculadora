import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);
const pdfPoppler = require("pdf-poppler");

export async function pdfParaImagem(pdfPath) {
  const outputDir = path.dirname(pdfPath);

  await pdfPoppler.convert(pdfPath, {
    format: "png",
    out_dir: outputDir,
    out_prefix: "pagina",
    page: 1 // normalmente o orçamento está na 1ª página
  });

  return path.join(outputDir, "pagina-1.png");
}

