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

  const prompt = `
Você receberá o texto de um orçamento odontológico.

Extraia os campos abaixo. Se um campo não for encontrado, retorne null.

Regras importantes:
- Email e telefone devem ser do PACIENTE (não da clínica)
- Corrija erro comum de OCR: Qgmail.com → @gmail.com
- Valor deve ser número (sem R$, sem ponto de milhar, decimal com ponto)
- Quantidade deve ser número inteiro
- descricoes deve conter TODOS os procedimentos encontrados
- Nunca omita o array descricoes (mesmo que vazio)

Texto do orçamento:
"""
${textoOCR}
"""
`;

  const response = await openai.responses.create({
    model: "gpt-4.1",
    temperature: 0,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "orcamento_odontologico",
        schema: {
          type: "object",
          properties: {
            valorTratamento: { type: ["number", "null"] },
            unidade: { type: ["string", "null"] },
            nomePaciente: { type: ["string", "null"] },
            observacoes: { type: ["string", "null"] },
            telefone: { type: ["string", "null"] },
            email: { type: ["string", "null"] },
            dataOrcamento: { type: ["string", "null"] },
            descricoes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  descricao: { type: ["string", "null"] },
                  quantidade: { type: ["number", "null"] },
                  valor: { type: ["number", "null"] }
                },
                required: ["descricao", "quantidade", "valor"]
              }
            }
          },
          required: [
            "valorTratamento",
            "unidade",
            "nomePaciente",
            "observacoes",
            "telefone",
            "email",
            "dataOrcamento",
            "descricoes"
          ]
        }
      }
    },
    input: prompt
  });

  return response.output_parsed;
}
