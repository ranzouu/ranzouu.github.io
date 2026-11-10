---
title: "O buscador que errava a porta: como medi um retrieval de verdade"
description: "O buscador de políticas acertava 21 de 25 perguntas — e as 4 que erravam contam a história mais útil. O que um índice de palavras-que-se-repetem enxerga, o que ele não enxerga, e por que medir só os acertos é enganar a si mesmo."
pubDate: 2026-11-14
tags: ["rag", "busca", "avaliação", "métricas"]
---

Artigo técnico · 14 de novembro de 2026 · 10 min de leitura

Imagine o atendente de um salão de beleza. Você pede "quero cortar o cabelo" e ele te
entrega — o folder da academia da esquina. Acertou o bairro, errou a porta. Se você
só medisse "o cliente saiu com um folder na mão", ia concluir que o atendente é
perfeito.

Foi assim que eu montei — e medi — o buscador de políticas do LeadForge. Ele acerta
21 de 25 perguntas. As 4 que erram são a parte que vale o artigo.

## 1. O que o buscador faz

O sistema tem uma estante com 10 documentos — um por tipo de negócio: academia,
petshop, restaurante, barbearia, clínica veterinária, padaria, salão, moda, oficina,
papelaria. Cada documento é uma "política": o argumento de venda certo para aquele
tipo de cliente.

Você faz uma pergunta em português — "como abordar dono de barbearia?" — e ele
devolve os 3 documentos mais parecidos. A regra da brincadeira: contar acerto se a
política certa estiver **entre as 3 primeiras**.

O segredo do mecanismo: ele compara **quais palavras se repetem** entre a pergunta e
os documentos. Palavras raras pesam mais que palavras comuns — "barbearia" na pergunta
vale muito; "de" e "pra" não valem quase nada. Na área isso se chama
**TF-IDF**, e é a base de 90% dos sistemas de busca que existem — inclusive de
muitos RAGs por aí.

## 2. Como se mede um buscador (em uma frase cada)

- **hit@3**: a resposta certa apareceu nas 3 primeiras? Acertou ou errou — a posição
  exata não importa aqui.
- **MRR** (que significa *reciprocal rank*, 1 dividido pela posição): se a certa é a
  primeira, vale 1; se é a segunda, vale 0.5; terceira, 0.33. A posição passa a
  importar.

As duas juntas contam histórias diferentes: o hit@3 mede "achou?", o MRR mede "achou
rápido?". Um sistema pode acertar tudo no hit@3 e ser ruim no MRR — como você vai ver.

## 3. O teste: 25 perguntas, 5 delas sem resposta

Além das 20 perguntas que têm política certa, eu incluí 5 que **não têm**: crossfit,
food truck, dentista, ateliê, autoescola. Não existe documento sobre nenhum deles.
Elas estão no teste pra falhar — um sistema que só é testado no que dá certo não
mede qualidade, mede otimismo.

## 4. O placar

Resumo antes da tabela: **21 acertos de 25 no hit@3** (84%), e o MRR geral de 0.79 —
número puxado pra baixo por um único nicho, que eu conto daqui a pouco.

| Onde | Acertos | Comentário |
|---|---|---|
| 20 perguntas **com** resposta | 20/20 | acertou todas |
| 5 perguntas **sem** resposta | 1/5 | 4 erros — e eles são os interessantes |
| **Total** | **21/25 (84%)** | hit@3 |

## 5. As 4 portas erradas — e o que cada uma ensina

**A food truck virou petshop.** Pergunta: "como abordar dono de food truck?" A
política certa é a de restaurante — mas no acervo não existe a palavra "food truck",
e o documento que fala de comida não usa essa expressão. O buscador foi pelo que
reconhecia: palavras de comércio ambulante. Nenhuma conexão entre "food truck" e
"restaurante" — ele não sabe que são a mesma coisa, só sabe que as palavras são
diferentes.

**O dentista virou clínica.** "O que prometer pra dentista com agenda cheia?" A
política certa é a da clínica veterinária (atendimento com horários, agenda, retorno).
A intuição comercial diz que dentista é clínica. O buscador foi por palavras de
profissão de saúde — e parou na veterinária por outras coincidências de vocabulário.
A resposta certa não apareceu nas 3 primeiras.

**O ateliê virou moda.** "Qual argumento pra ateliê de costura sob medida?" A certa
é a de moda. Palavra por palavra: "ateliê" e "costura" não aparecem em nenhum outro
documento — mas também não aparecem juntas em lugar nenhum que ele conheça. A
conexão ateliê → moda é conhecimento de mundo, não sobreposição de palavra.

**A autoescola virou oficina.** "Como vender agenda de aulas pra autoescola?" A certa
é a de oficina? Não — a certa nem existe no acervo. Ele devolveu oficina, papelaria e
veterinária, numa zona de empate técnico (0.2 pra todos). Quando não há pista
lexical, ele entrega o que der — e o score baixo e igual é o sintoma: ele está
chutando.

O padrão das 4: **todas falham por sinônimo, não por erro de código.** O sistema
compara palavras, e o mundo é feito de coisas com nomes diferentes.

## 6. O nicho que acertou e não foi

O restaurante é a joia do teste. Das 2 perguntas de restaurante, o buscador acertou
as duas no hit@3 — mas acertou **em terceiro lugar** nas duas. MRR do nicho: 0.42.
Ou seja: o cliente pede, o sistema entrega a política certa — depois de duas
erradas. Pro usuário final, isso é meia-acerto: a resposta chegou, mas ninguém lê a
terceira sugestinha.

E o caso mais divertido: a pergunta de crossfit — uma das 5 sem resposta — acertou a
política de academia. Motivo: "crossfit" e "academia" dividem vocabulário no acervo
(treino, aula, horário). **Acidente, não acerto.** Um teste que não separa os dois
tipos de acerto aprende a lição errada.

## 7. O que eu faria diferente (e o que não mudo)

- **Semântica é o próximo passo.** Busca por significado (embeddings — cada texto
  vira um vetor de números, e a comparação é por proximidade de sentido) resolve
  direto os 4 erros de sinônimo: "food truck" e "restaurante" ficam vizinhos. Eu não
  testei isso ainda — quando testar, publico os números, inclusive se ficarem piores.
- **10 documentos e 25 perguntas é pouco.** O teste prova o método, não a escala.
  Isso está dito no card do dataset.
- **O que não mudo:** as perguntas sem resposta continuam no teste. Elas são o que
  separa um sistema medido de um sistema maquiado.

## 8. Fechamento

Um buscador que acerta 84% parece bom no cartaz. O que o cartaz não mostra é que os
16% que faltam erram sempre pela mesma porta — a falta de significado — e que um
nicho inteiro só acerta porque a resposta certa chega em terceiro. Medir o erro
específico é o que transforma "funciona" em "sei onde quebra".

Todos os dados — 25 perguntas com julgamento explícito, os scores de cada posição e
o arquivo de erros — estão públicos no
[Hugging Face](https://huggingface.co/datasets/ranzouu/retrieval-benchmark-ptbr) e o
código no [GitHub](https://github.com/ranzouu/leadforge-rag-lite).

— Rayson Severiano Rodrigues, Fortaleza/CE, novembro de 2026.
