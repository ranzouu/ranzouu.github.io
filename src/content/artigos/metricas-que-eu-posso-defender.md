---
title: "Métricas que eu posso defender"
description: "Como um número perfeito de 1.0 no meu projeto virou 0.633 — e por que o segundo é o mais valioso do meu portfólio. Erros reais, acertos possíveis e o que eu aprendi medindo as coisas direito."
pubDate: 2026-11-10
tags: ["métricas", "machine learning", "portfólio"]
---

Artigo técnico · 10 de novembro de 2026 · 12 min de leitura

Meu primeiro classificador de leads media 1.0 de precisão, 1.0 de recall e 1.0 de F1.
Perfeito em tudo. O problema: o número era falso. Esta é a história de como ele virou
0.633 — e por que hoje eu prefiro o número feio.

## 1. O aluno que decorou a prova

Pense num aluno que tira 10 em todas as provas de uma matéria. Elogio ou suspeita? Se
ele estudou com o gabarito na mesa, o 10 não mostra nada.

Foi exatamente o que eu fiz. No código do classificador existia uma função chamada
`train_test_split` — a linha que separa o material de estudo dos dados de prova. Eu
tinha importado ela no topo do arquivo. E nunca tinha usado.

O modelo treinou e foi testado nas mesmas 15 amostras. Ele decorou a lista e provou
que decorou. Na linguagem da área, treinar e testar nos mesmos dados se chama
**métrica in-sample** — e ela vale tanto quanto o 10 do aluno com o gabarito: só serve
pra enganar quem não lê o código.

## 2. Cinco provas, nenhuma repetida

A correção começa por outra analogia da escola: em vez de uma prova só, o aluno faz
cinco — e em cada uma, uma parte diferente da turma fica de fora. É assim que funciona
a **validação cruzada**: eu divido meus dados em 5 partes, treino em 4 e testo na que
sobrou, e rolo esse processo 5 vezes. No fim, todo dado já foi prova uma vez.

Tem um detalhe que quase me pegou de novo. Antes de cada prova, eu preciso escolher um
ajuste do modelo — um botão que a área chama de *hiperparâmetro*. Se eu escolher o
botão olhando o resultado das cinco provas, a prova participou da decisão. A solução é
escolher o botão usando **só o material de estudo**, como se a prova nem existisse:

```python
inner = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)  # treino interno
outer = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)  # as 5 provas

for treino, prova in outer.split(X, y):
    # escolhe o melhor ajuste vendo SÓ o treino — nunca a prova
    grid = GridSearchCV(modelo, param_grid={"C": [0.25, 0.5, 1.0, 2.0, 4.0]},
                        cv=inner, scoring="f1_macro")
    grid.fit(X[treino], y[treino])
    # tira a prova com o melhor ajuste daquele treino
    nota = grid.score(X[prova], y[prova])
```

O resultado honesto: **0.633 de acurácia, com desvio de ±0.192** entre as provas. E
uma informação que só o relatório por classe mostra: leads `cold` (sem intenção) e
`hot` (com intenção clara) acertam 0.70 e 0.75, mas os `warm` — o talvez, o "me liga
depois" — acertam só 0.45. O modelo erra justo onde a dúvida é real. Um relatório que
só mostra a média esconderia isso.

## 3. O tesouro enterrado — e o vigia que não vê a falta

Em detecção de anomalias tem um problema: ninguém sabe quais pontos são anomalia de
verdade. A saída é criar as anomalias eu mesmo: monto uma série de dados sintética e
enterro 12 eventos em datas que eu escolho. Sei onde o tesouro está — então posso
medir se o vigia encontra. Na área, isso se chama **ground truth por construção** (a
resposta certa fabricada de propósito, pra poder medir).

```python
SEED = 20260101      # mesma receita, mesmos números, sempre
N_DAYS = 180         # 180 dias de receita: tendência + semana + ruído

# 12 eventos enterrados: 6 picos, 6 quedas
INJECTIONS = [
    (30, "spike", 2.6), (52, "spike", 2.3), (88, "spike", 3.2),
    (120, "spike", 2.4), (150, "spike", 2.8), (168, "spike", 2.5),
    (41, "drop", 0.70), (66, "drop", 0.62), (100, "drop", 0.72),
    (135, "drop", 0.58), (158, "drop", 0.68), (175, "drop", 0.75),
]
```

O achado que eu não esperava: o **z-score**, o método mais popular — o que quase todo
mundo cita — encontra 6 dos 6 picos e **0 das 6 quedas**. A explicação é bonita:
quando a receita cai, a média e a variação da janela caem junto, e o próprio desvio
anômalo entra no denominador da conta. O evento desaparece da própria régua que
deveria medi-lo. Em receita, o evento que mais importa é justamente a queda.

Os outros dois métodos completam o retrato: o IQR ficou com o melhor equilíbrio
(F1 0.86, sem nenhum falso alarme) e o STL encontrou as 12, mas com 10 alarmes falsos
no caminho.

## 4. As perguntas que devem falhar

No meu buscador de políticas eu incluí 5 perguntas que não têm resposta no acervo —
crossfit, food truck, dentista, ateliê, autoescola. Elas estão lá pra falhar. Quando o
teste só mede o que dá certo, qualquer sistema parece bom — [conto os números no
artigo do buscador](/artigos/buscador-que-errava-a-porta/).

## 5. Quando o teste encontra a realidade

A lição mais cara veio de uma rodada real com modelo de linguagem. Em modo
demonstração, meu avaliador de prompts funcionava lindamente — respostas prontas no
código, latência de mentirinha. Quando apontado pra um modelo de verdade, ele quebrou
em três frentes:

- **Respostas que desaparecem.** Com `max_tokens=200`, o modelo gastava todo o orçamento
  pensando antes de responder: a nota vinha 200 (tudo certo), o conteúdo vazio, e
  nenhum erro no log. Pior que quebrar: sumir sem aviso.
- **Fila de banco.** O servidor gratuito permite 30 pedidos por minuto; 5 pedidos
  morreram na fila sem ninguém esperar a vez. Fila se chama *rate limit*, e a lição é
  de infraestrutura, não de prompt.
- **Produto descontinuado.** O modelo que eu tinha fixado saiu do ar em agosto de 2026.
  O teste que você faz hoje pode não existir mês que vem.

Na rodada seguinte — já com orçamento correto, fila respeitada e modelo disponível —
as 36 chamadas passaram, e o resultado foi o achado mais útil do lote: o prompt de
palavra seca extraiu classificação em só 4 de 12 casos; nas outras 8, o modelo
recusou classificar. O prompt com formato explícito acertou 12 de 12. Nenhum disso
existia na demonstração — [o caso completo está no artigo de
prompts](/artigos/prompt-engineering-sem-achismo/).

## 6. O checklist do que eu publico

- Número de demonstração é rotulado como demonstração. Latência constante de 120 ms é
  assinatura de dado falso.
- O protocolo viaja junto: semente dos números, divisões, o que foi ajustado e onde.
- Desvio padrão faz parte da métrica, não é nota de rodapé.
- Casos que devem falhar existem no teste — e a falha é publicada.
- Os erros ficam no repositório: o arquivo `benchmark_errors.csv` existe pra ser lido.
- As limitações são escritas antes de alguém perguntar.

## Fechamento

Um portfólio com 0.633 honestos diz duas coisas que um 1.0 nunca diz: que eu sei
medir, e que eu não tenho medo do número real. A segunda importa mais.

Todos os protocolos, dados e código deste artigo estão públicos — os benchmarks no
[Hugging Face](https://huggingface.co/ranzouu), o código no
[GitHub](https://github.com/ranzouu).

— Rayson Severiano Rodrigues, Fortaleza/CE, novembro de 2026.
