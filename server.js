import "dotenv/config";
import express from "express";
import multer from "multer";
import cors from "cors";
import Tesseract from "tesseract.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { unlinkSync } from "fs";
import { extrairDadosIA } from "./extrairDadosIA.js";
import { pdfParaImagem } from "./util/pdfParaImagem.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.static(__dirname));

const upload = multer({ dest: "uploads/" });

function limparTextoOCR(texto) {
  return texto
    .replace(/\n{2,}/g, "\n")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/Email:.*$/gim, "")
    .replace(/Telefone:.*$/gim, "")
    .trim();
}

async function rodarTesseract(imagemPath) {
  const result = await Tesseract.recognize(imagemPath, "por");
  return result.data.text;
}


app.post("/ocr", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;
  let imagemPath = filePath;
  let arquivoTemporario = null;

  try {
    if (req.file.mimetype === "application/pdf") {
      imagemPath = await pdfParaImagem(filePath);
      arquivoTemporario = imagemPath;
    }

    const textoOCR = await rodarTesseract(imagemPath);

    // Limpar texto antes de extrair dados
    const textoLimpo = limparTextoOCR(textoOCR);

    // Extrair dados usando IA
    const dadosExtraidos = await extrairDadosIA(textoLimpo);

    // Limpar arquivo temporário se foi criado
    if (arquivoTemporario) {
      try {
        unlinkSync(arquivoTemporario);
      } catch (e) {
        console.error("Erro ao deletar arquivo temporário:", e);
      }
    }

    // Retornar apenas os dados extraídos
    res.json(dadosExtraidos);
  } catch (error) {
    // Limpar arquivo temporário em caso de erro
    if (arquivoTemporario) {
      try {
        unlinkSync(arquivoTemporario);
      } catch (e) {
        // Ignorar erro ao deletar
      }
    }

    console.error("Erro ao processar arquivo:", error);
    res.status(500).json({ 
      error: "Erro ao processar o arquivo", 
      message: error.message 
    });
  }
});

app.listen(3000, () =>
  console.log("OCR rodando na porta 3000")
);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("OCR rodando na porta", PORT)
);


