---
title: "Prompt engineering sem achismo: 36 chamadas, 3 variantes e zero dados de demo"
description: "O que acontece quando você para de avaliar prompts com resposta de mentirinha: 8 de 12 respostas sendo recusa, schema explícito vencendo por 12 a 12, e três bugs de integração que só existem em rodada real."
pubDate: 2026-11-12
tags: ["llm", "prompt engineering", "avaliação", "groq"]
---

Artigo técnico · 12 de novembro de 2026 · 10 min de leitura

Todo tutorial de prompt engineering que eu li terminava com uma tabela bonita e uma
conclusão. Nenhum mostrava a rodada real que produziu a tabela. Este artigo mostra a
minha — incluindo a primeira rodada, que quebrou de três formas diferentes.

## 1. O modo demo mentiu pra mim

Meu avaliador de prompts tinha um modo demo: respostas fixas no código, latência
constante de 120 ms, tokens redondos. Servia para testar o pipeline — e só isso. No
demo, as três variantes de prompt funcionavam perfeitamente. A verdade apareceu quando
eu apontei o mesmo código para um modelo de verdade, o `openai/gpt-oss-20b` via Groq.

A primeira rodada real falhou 5 de 36 chamadas e devolveu resposta vazia em outras
tantas. Nada disso existia no demo. Se eu tivesse publicado o demo como resultado,
teria publicado uma fotografia de um programa que nunca conversou com um modelo.

## 2. O setup

Doze leads de exemplo (SMB de Fortaleza — academia, petshop, salão, padaria…) e três
variantes de prompt para classificá-los em `quente`, `morno` ou `frio`:

| Variante | O prompt | Formato pedido |
|---|---|---|
| `v1_short` | "Classifique o lead como 'quente', 'morno' ou 'frio'. Responda só com a classificação." | texto puro |
| `v2_structured` | "Lead: {lead} ({categoria}) em {cidade}. Responda em JSON com campos: label, confidence, reasoning." | JSON com schema |
| `v3_criteria` | "Classifique seguindo critérios de fit para prospecção B2B. Responda JSON. Critérios: fit_high se cliente final claramente definido; fit_medium se segmento promissor; fit_low se muito genérico." | JSON com critérios |

Ao todo: 12 leads × 3 variantes = 36 chamadas, com latência e tokens medidos ponta a
ponta.

## 3. Rodada 1 — o desastre formativo

```text
Erro 404: The model `llama-3.1-8b-instant` does not exist
Erro 429: Rate limit reached — 30 requests per minute
HTTP 200 · content: "" · tokens: 200
```

Três falhas, três aulas:

**Modelo aposentado.** O `llama-3.1-8b-instant` que eu tinha fixado saiu do free tier
da Groq em 16 de agosto de 2026. O modelo que você testa hoje pode não existir no mês
que vem — avaliador de prompt que não descobre os modelos disponíveis na chave tem
data de validade.

**429 sem retry.** O free tier tem limite de 30 requisições por minuto. Sem backoff,
5 chamadas morreram. Rate limit não é erro de prompt; é erro de infra — e o harness
precisa saber a diferença.

**Respostas vazias silenciosas.** A mais perigosa. Modelos de raciocínio gastam tokens
no canal de pensamento *antes* de gerar a resposta. Com `max_tokens=200`, o
pensamento comia o budget inteiro: HTTP 200, `content` vazio, zero erro no log. A
amostra desaparecia sem deixar rastro — pior que um erro explícito, porque não dá
sinal nenhum. O fix foi subir o budget para 1000 tokens.

## 4. Rodada 2 — os números

Depois de corrigir (budget de 1000, retry com backoff de 5s/15s, pacing de 2s entre
chamadas), a rodada limpa: 36/36 chamadas, zero erros, latência real de 367 a 2164 ms.

| Variante | Rótulos extraídos | Labels vistos | O que o modelo fez |
|---|---|---|---|
| `v1_short` | **4/12** | só `frio` | 8 vezes **recusou**: "preciso de mais informações" |
| `v2_structured` | **12/12** | `frio`/`morno`/`quente` | venceu limpo; tolerou até bloco ` ```json ` |
| `v3_criteria` | **8/12** | `None`/`fit_unknown` | drift de vocabulário |

## 5. Os três achados

**Prompt sem formato não sustenta classe.** Pedir "responda só com a classificação"
soa restritivo — e é o oposto. Sem um schema que amarre a resposta, o modelo de
raciocínio faz o que sabe fazer: raciocinar, questionar, devolver ressalva. Em 8 de 12
casos ele recusou classificar e ainda por cima os 4 rótulos que vieram eram todos
`frio` — a variante não distingue lead bom de lead ruim.

**Schema explícito é o vencedor, e a tolerância de parsing importa.** A variante com
JSON nomeado extraiu 12/12 e produziu as três classes. Detalhe que só a rodada real
mostra: às vezes a resposta veio como bloco ` ```json ` markdown, não JSON puro. Se o
extrator só aceitasse JSON estrito, eu teria perdido amostras por causa de
formatação, não de modelo.

**Enum não fixado vira drift.** A variante de critérios descrevia `fit_high`,
`fit_medium`, `fit_low` — mas pedia o label como `{label, confidence, reasoning}` sem
dizer que o label é `quente|morno|frio`. Resultado: o modelo devolveu `None`,
`fit_unknown`, `unknown`. O prompt estava ambíguo sobre o conjunto permitido, e o
modelo preencheu a ambiguidade com criatividade. Regra que ficou: **todo campo
categórico tem o enum explícito no prompt.**

## 6. O que eu mudaria no protocolo

Honestidade sobre os limites desta rodada, porque admitir limite é parte do protocolo:

- **Sem ground truth de intenção.** Os 12 leads não têm label "correto" — a comparação
  mede **estrutura da resposta** (parse, classes produzidas, latência), não acerto de
  negócio. Um avaliador completo rotularia os leads antes e mediria accuracy também.
- **Uma rodada, uma semente.** Com `temperature=0.2` há variação residual; um
  protocolo maduro repete N vezes por variante e reporta intervalo, não ponto.
- **Custo como métrica de primeira classe.** A variante estruturada gasta ~240 tokens
  de saída por chamada contra ~1 da variante seca — em frota de 10 mil classificações
  por mês, isso é dinheiro e latency de verdade.

## 7. Fechamento

O que esta rodada me deu não foi "qual prompt é melhor" — foi a evidência de que
avaliação de prompt sem rodada real é opinião. Modo demo é treino de infraestrutura,
não evidência de qualidade. E o achado mais aplicável do lote é o mais simples:
**escreva o enum no prompt.**

A rodada está publicada, dado por dado, em
[huggingface.co/spaces/ranzouu/prompt-evaluator](https://huggingface.co/spaces/ranzouu/prompt-evaluator)
e o código em
[github.com/ranzouu/leadforge-prompt-evaluator](https://github.com/ranzouu/leadforge-prompt-evaluator)
— `runs/latest.csv` tem as 36 chamadas com resposta crua, latência e tokens.

— Rayson Severiano Rodrigues, Fortaleza/CE, novembro de 2026.
