---
title: "Prompt engineering sem achismo: 36 chamadas, 3 variantes e zero dados de demo"
description: "O que acontece quando você para de testar prompt com resposta de mentirinha: 8 de 12 respostas sendo recusa, a ficha explícita vencendo de 12 a 0, e três problemas de integração que só aparecem na rodada real."
pubDate: 2026-11-12
tags: ["llm", "prompt engineering", "avaliação", "groq"]
---

Artigo técnico · 12 de novembro de 2026 · 10 min de leitura

Pense num vendedor que ensaia o discurso no espelho todo dia e nunca entra numa loja.
No espelho ele é impecável. Foi assim que eu testei prompts por uma semana — até apontar
o mesmo programa para um modelo de verdade. Este artigo é a prestação de contas dessa
hora da verdade, com a rodada que quebrou e a rodada que funcionou.

## 1. O espelho que mentia

Meu avaliador de prompts tinha um modo demonstração: as respostas já estavam escritas
no código, a latência era sempre a mesma, os números redondos. Servia pra testar a
tubulação — se os dados entravam e saíam certos — e só isso.

Quando troquei o espelho pelo modelo real (`openai/gpt-oss-20b`, via Groq), a
primeira rodada falhou em 5 de 36 chamadas e devolveu resposta vazia em outras tantas.
Se eu tivesse publicado o resultado do espelho, teria publicado a foto de um programa
que nunca conversou com um modelo.

## 2. O teste que eu montei

Doze empresas de exemplo — academia, petshop, salão, padaria, coisas de bairro — e a
tarefa: classificar cada uma como cliente `quente`, `morno` ou `frio`. Três formas
diferentes de pedir a mesma coisa:

| Variante | Como eu pedia | O que eu pedia de volta |
|---|---|---|
| `v1_short` | "Classifique o lead como 'quente', 'morno' ou 'frio'. Responda só com a classificação." | uma palavra |
| `v2_structured` | "Lead: {empresa} ({categoria}) em {cidade}. Responda em JSON com campos: label, confidence, reasoning." | uma ficha com campos |
| `v3_criteria` | "Classifique seguindo critérios de fit... fit_high se cliente final claramente definido..." | ficha + regras explicadas |

Ao todo: 12 empresas × 3 pedidos = 36 chamadas, com o tempo de resposta e os tokens
gastos medidos um por um.

## 3. A primeira rodada: três problemas, três aulas

```text
Erro 404: The model `llama-3.1-8b-instant` does not exist
Erro 429: Rate limit reached — 30 requests per minute
HTTP 200 · conteúdo: "" · tokens: 200
```

**O produto saiu de linha.** O modelo que eu tinha fixado no código foi descontinuado
do plano gratuito em agosto de 2026. A regra que ficou: o teste precisa descobrir
quais modelos existem na sua chave hoje — senão ele tem data de validade.

**A fila do banco.** O servidor gratuito atende 30 pedidos por minuto. Sem esperar a
vez, 5 pedidos morreram na porta. Fila de servidor se chama *rate limit* — e ela é
problema de infraestrutura, não de prompt.

**A resposta que desapareceu.** A mais traiçoeira: com `max_tokens=200`, o modelo
gastava todo o orçamento pensando antes de falar. A resposta voltava com código 200 —
tudo certo — e o conteúdo vazio, sem nenhum erro no registro. A amostra sumia sem
deixar rastro. Pior que quebrar na cara: falhar em silêncio. A correção foi triplicar
o orçamento, pra 1000 tokens.

## 4. A rodada limpa: os números

Depois das três correções — orçamento maior, espera entre pedidos, modelo existente —
as 36 chamadas passaram, sem erro nenhum, com latência real de 367 a 2164 milésimos de
segundo. E aí veio o resultado que importa. Resumindo antes da tabela: **a ficha
explícita venceu de 12 a 0, e o pedido de uma palavra só foi ignorado.**

| Variante | Empresas classificadas | O que o modelo fez |
|---|---|---|
| `v1_short` | **4 de 12** | nas outras 8, **recusou**: "preciso de mais informações" |
| `v2_structured` | **12 de 12** | venceu limpo, com as três classes aparecendo |
| `v3_criteria` | **8 de 12** | inventou categorias: `None`, `fit_unknown`, `unknown` |

## 5. Os três achados

**Pedir uma palavra não deixa a resposta mais curta — deixa o modelo mais cauteloso.**
Soa contraditório: quanto mais eu pedia "só a classificação", mais ele recusava
classificar. Em 8 de 12 casos respondeu que precisava de mais informação. E os 4
rótulos que vieram eram todos `frio` — o pedido enxuto não distinguia cliente bom de
cliente ruim.

**A ficha explícita ganha — e saber ler a resposta importa tanto quanto pedir.** A
variante com campos nomeados acertou as 12. Só a rodada real mostra um detalhe: às
vezes a resposta veio como bloco de código markdown, não como dado puro. Se meu
programa só aceitasse o formato estrito, eu teria perdido amostras por formatação —
não por culpa do modelo.

**Categoria não escrita vira invenção.** Na terceira variante eu expliquei as regras
(`fit_high`, `fit_medium`, `fit_low`) mas não disse quais eram os valores permitidos
para o campo final. Resultado: o modelo preencheu a lacuna com criatividade. A regra
que ficou vale pra qualquer integração: **escreva a lista completa de valores
permitidos no prompt.**

## 6. O que eu faria diferente

Admitir limite faz parte do protocolo, então ficam registrados:

- **Sem resposta certa comparativa.** Os 12 casos não têm classificação "correta"
  conhecida — o teste mede a **forma da resposta** (se veio, se tem as classes, quanto
  custou), não o acerto de negócio. Um teste completo rotularia os casos antes.
- **Uma rodada é um retrato, não um filme.** Um protocolo maduro repete cada variante
  várias vezes e mostra o intervalo dos resultados, não um ponto só.
- **Custo é métrica de primeira classe.** A variante com ficha gasta ~240 tokens por
  chamada; a de uma palavra, ~1. Em 10 mil classificações por mês, isso é dinheiro e
  latência de verdade.

## 7. Fechamento

O que esta rodada me deu não foi "qual prompt é melhor" — foi a prova de que testar
prompt sem rodada real é opinião. Demonstração é treino de infraestrutura, não
evidência de qualidade. E o achado mais aplicável é o mais simples: **escreva a lista
de valores no prompt.**

A rodada está pública, dado por dado — 36 chamadas com resposta crua, latência e
tokens — no [Space do avaliador](https://huggingface.co/spaces/ranzouu/prompt-evaluator)
e o código no [GitHub](https://github.com/ranzouu/leadforge-prompt-evaluator).

— Rayson Severiano Rodrigues, Fortaleza/CE, novembro de 2026.
