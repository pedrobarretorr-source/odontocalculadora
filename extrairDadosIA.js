import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function extrairDadosIA(textoOCR) {
  const prompt = `Você receberá o texto de um orçamento odontológico.

IMPORTANTE: Extraia APENAS e EXCLUSIVAMENTE os 6 campos listados abaixo.
NÃO extraia nenhum outro campo.
NÃO invente dados.
Se um campo não for encontrado claramente, retorne null para ele.

Campos OBRIGATÓRIOS (retorne APENAS estes):
1. valorTratamento - número do "Valor Total" (somente número, sem símbolos)
2. unidade - APENAS uma destas: "Centro", "Tancredo Neves" ou "Raiar do Sol" (inferir do nome da clínica)
3. nomePaciente - nome do paciente
4. observacoes - observações do orçamento
5. telefone - número de telefone
6. email - endereço de email (corrija erros de OCR óbvios como Qgmail.com → gmail.com)

Regras:
- Retorne SOMENTE um JSON com esses 6 campos
- Ignore completamente: links, textos repetidos, lixo visual, outros dados do orçamento
- Formato esperado: {"valorTratamento": 1500, "unidade": "Centro", "nomePaciente": "João Silva", "observacoes": "...", "telefone": "...", "email": "..."}

Texto do orçamento:
"""
${textoOCR}
"""
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0,
    messages: [
      { role: "user", content: prompt }
    ]
  });

  const respostaIA = response.choices[0].message.content;
  
  let parsed;
  try {
    parsed = JSON.parse(respostaIA);
  } catch {
    parsed = await corrigirJSON(respostaIA);
  }

  // Filtrar apenas os campos permitidos
  const camposPermitidos = ['valorTratamento', 'unidade', 'nomePaciente', 'observacoes', 'telefone', 'email'];
  const dadosFiltrados = {};
  
  camposPermitidos.forEach(campo => {
    dadosFiltrados[campo] = parsed[campo] !== undefined ? parsed[campo] : null;
  });

  return dadosFiltrados;
}

async function corrigirJSON(jsonMalformado) {
  const prompt = `
Corrija o seguinte JSON malformado e retorne APENAS um JSON válido, sem markdown, sem explicações, apenas o JSON:

${jsonMalformado}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0,
    messages: [
      { role: "user", content: prompt }
    ]
  });

  return JSON.parse(response.choices[0].message.content);
}

