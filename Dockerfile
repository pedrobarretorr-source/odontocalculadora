FROM node:20-slim

# Instalar dependências do sistema (OCR + PDF)
RUN apt-get update && apt-get install -y \
  tesseract-ocr \
  poppler-utils \
  ghostscript \
  ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json primeiro (melhor cache)
COPY package*.json ./

# Instalar dependências Node
RUN npm install --omit=dev

# Copiar o restante do código
COPY . .

# Garantir que a pasta de uploads exista
RUN mkdir -p uploads && chmod -R 777 uploads

# Variáveis de ambiente
ENV PORT=3000
ENV NODE_ENV=production

# Expor porta
EXPOSE 3000

# Iniciar app
CMD ["npm", "start"]
