import { fromPath } from "pdf2pic";
import path from "path";

export async function pdfParaImagem(pdfPath) {
  const options = {
    density: 200,
    saveFilename: "pagina",
    savePath: path.dirname(pdfPath),
    format: "png",
    width: 1654,
    height: 2339
  };

  const storeAsImage = fromPath(pdfPath, options);

  const result = await storeAsImage(1); // primeira página

  return result.path;
}
