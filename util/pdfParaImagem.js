import { fromPath } from "pdf2pic";
import path from "path";

export async function pdfParaImagem(pdfPath) {
  const outputDir = path.dirname(pdfPath);
  const outputFilename = "pagina";

  const options = {
    density: 300,
    saveFilename: outputFilename,
    savePath: outputDir,
    format: "png",
    width: 2000,
    height: 2000
  };

  const convert = fromPath(pdfPath, options);
  
  // Converte a primeira página
  const result = await convert(1, { responseType: "image" });
  
  return result.path;
}