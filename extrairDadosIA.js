import OpenAI from "openai";

function criarClienteOpenAI() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não definida no ambiente");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

export async function extrairDadosIA(textoOCR) {
  const openai = criarClienteOpenAI();

  const prompt = `Você receberá o texto de um orçamento odontológico.

IMPORTANTE: Extraia APENAS e EXCLUSIVAMENTE os 6 campos listados abaixo.
NÃO extraia nenhum outro campo.
NÃO invente dados.
Se um campo não for encontrado claramente, retorne null para ele.

Campos OBRIGATÓRIOS (retorne APENAS estes):
1. valorTratamento - número do "Valor Total" (somente número, sem símbolos como R$)
2. unidade - APENAS uma destas: "Centro", "Tancredo Neves" ou "Raiar do Sol" (inferir do nome da clínica)
3. nomePaciente - nome do paciente (geralmente após "Paciente:")
4. observacoes - texto que aparecer após "Observações" (se vazio, retorne null)
5. telefone - telefone DO PACIENTE (NÃO da clínica). Geralmente aparece na mesma linha ou próximo ao nome do paciente
6. email - email DO PACIENTE (NÃO da clínica). Geralmente aparece na mesma linha do nome do paciente, após "Email:"

ATENÇÃO:
- O email/telefone da CLÍNICA (que aparece junto com endereço) deve ser IGNORADO
- Procure o email do PACIENTE que aparece na linha "Paciente: Nome   Email: xxx@xxx.com"
- Corrija erros de OCR em emails (ex: Qgmail.com → @gmail.com)

Formato de resposta (JSON):
{"valorTratamento":1500,"unidade":"Centro","nomePaciente":"João Silva","observacoes":null,"telefone":"99999-9999","email":"email@gmail.com"}

Texto do orçamento:
"""
${textoOCR}
"""
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0,
    messages: [{ role: "user", content: prompt }]
  });

  const respostaIA = response.choices[0].message.content;

  let parsed;
  try {
    parsed = JSON.parse(respostaIA);
  } catch {
    parsed = await corrigirJSON(respostaIA);
  }

  // Garantir apenas os campos permitidos
  const camposPermitidos = [
    "valorTratamento",
    "unidade",
    "nomePaciente",
    "observacoes",
    "telefone",
    "email"
  ];

  const dadosFiltrados = {};
  camposPermitidos.forEach(campo => {
    dadosFiltrados[campo] =
      parsed && parsed[campo] !== undefined ? parsed[campo] : null;
  });

  return dadosFiltrados;
}

async function corrigirJSON(jsonMalformado) {
  const openai = criarClienteOpenAI();

  const prompt = `
Corrija o seguinte JSON malformado e retorne APENAS um JSON válido.
Sem markdown, sem explicações, apenas o JSON:

${jsonMalformado}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0,
    messages: [{ role: "user", content: prompt }]
  });

  return JSON.parse(response.choices[0].message.content);
}