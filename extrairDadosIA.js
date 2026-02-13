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

Extraia os campos abaixo. Se um campo não for encontrado, retorne null.

Campos:
1. valorTratamento - número do "Valor Total" (somente número, sem R$)
2. unidade - "Centro", "Tancredo Neves" ou "Raiar do Sol" (inferir do nome da clínica)
3. nomePaciente - nome do paciente (após "Paciente:")
4. observacoes - texto após "Observações" (se vazio, null)
5. telefone - telefone do PACIENTE (não da clínica)
6. email - email do PACIENTE (na linha do nome, após "Email:")
7. dataOrcamento - data do orçamento (formato DD/MM/AAAA)
8. descricoes - array com cada descrição dos procedimentos contendo:
   - descricao: nome do procedimento (ex: "Limpeza Completa com Raspagem Supra Gengival")
   - quantidade: número inteiro (ex: 1, 20, 2)
   - valor: número sem R$ (ex: 160.00, 2520.00)

ATENÇÃO:
- Email/telefone da CLÍNICA deve ser IGNORADO
- Procure email do PACIENTE na linha "Paciente: Nome   Email: xxx@xxx.com"
- Corrija erros de OCR em emails (Qgmail.com → @gmail.com)
- As descrições estão no campo "Descrição:" de cada procedimento

Formato JSON:
{
  "valorTratamento": 7189,
  "unidade": "Centro",
  "nomePaciente": "Luana Lima Santos",
  "observacoes": null,
  "telefone": null,
  "email": "luanalimaas07@gmail.com",
  "dataOrcamento": "17/11/2025",
  "descricoes": [
    {"descricao": "Limpeza Completa com Raspagem Supra Gengival", "quantidade": 1, "valor": 160.00},
    {"descricao": "Restauração em Resina - 1 Face", "quantidade": 20, "valor": 2520.00}
  ]
}

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

  const camposPermitidos = [
    "valorTratamento",
    "unidade",
    "nomePaciente",
    "observacoes",
    "telefone",
    "email",
    "dataOrcamento",
    "descricoes"
    "descricao"
    "quantidade"
    "valor"
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