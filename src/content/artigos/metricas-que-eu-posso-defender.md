---
title: "Métricas que eu posso defender"
description: "Como um número de 1.0 de accuracy no meu próprio repositório virou 0.633 ± 0.192 — e por que o segundo número é o mais valioso do meu portfólio. Três protocolos que eu aplico antes de publicar qualquer métrica."
pubDate: 2026-11-10
tags: ["machine learning", "métricas", "portfólio", "benchmarks"]
---

Artigo técnico · 10 de novembro de 2026 · 12 min de leitura

Um número de `1.0` de precision, `1.0` de recall, `1.0` de F1. Número perfeito em três
frentes — e completamente falso. Esta é a história de como ele virou `0.633 ± 0.192`, e
de três protocolos que eu aplico antes de publicar qualquer métrica.

## 1. O número que me envergonhou

Meu primeiro classificador de intenção de leads media **1.0 de precision, 1.0 de
recall, 1.0 de F1**. O README estava escrito, o pacote pronto para publicar. Só tinha
um problema: o número era falso.

Eu tinha importado `train_test_split` no topo do arquivo — e nunca usado. O modelo era
treinado e avaliado nas *mesmas 15 amostras*. Um classificador decorou a lista e provou
que decorou. Qualquer recrutador técnico que abrisse o código veria em dez segundos, e
a credibilidade de todo o portfólio ia junto.

A correção produziu o oposto do marketing: expandi o dataset de 15 para 60 amostras,
reescrevi a avaliação e o número caiu para **0.633 ± 0.192** em validação cruzada de 5
folds. Mais baixo, mais feio — e defensável em qualquer entrevista. Esse é o primeiro
princípio: **uma métrica que eu não consigo explicar de memória, com o protocolo na
mão, não é métrica — é decoração.**

## 2. Protocolo 1: validação cruzada com tuning aninhado

O erro clássico depois do in-sample é o vazamento por tuning: se você escolhe o
hiperparâmetro olhando o resultado de todos os folds, o fold de teste participou da
decisão. A correção é tunar *dentro* de cada fold, como se o fold de teste não
existisse:

```python
from sklearn.model_selection import StratifiedKFold, GridSearchCV

inner = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)
outer = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

for train_idx, test_idx in outer.split(X, y):
    # o tuning NUNCA ve o fold de teste — só o treino interno
    grid = GridSearchCV(pipeline, param_grid={"C": [0.25, 0.5, 1.0, 2.0, 4.0]},
                        cv=inner, scoring="f1_macro")
    grid.fit(X[train_idx], y[train_idx])
    # avalia no fold externo com o melhor C daquele fold
    fold_score = grid.score(X[test_idx], y[test_idx])
```

O resultado publicado: **accuracy 0.633 ± 0.192**, macro-F1 0.633, com `C` variando por
fold (2.0, 0.5, 0.5, 2.0, 0.5). O desvio padrão alto (±0.192) não é defeito de
fabricação — com 60 amostras e 12 por fold, é a verdade estatística do tamanho da
amostra, e o card do modelo diz isso em voz alta. Por classe: `cold` 0.70, `hot` 0.75,
`warm` 0.45 — a classe média é a difícil, o que faz sentido de negócio e eu não teria
descoberto sem o relatório por classe.

## 3. Protocolo 2: ground truth por construção

Detecção de anomalias tem um problema de avaliação: em dados reais, ninguém sabe com
certeza quais pontos são anomalias. Meu benchmark resolve isso por construção —
sintetizo uma série determinística e injeto as anomalias eu mesmo, em datas que eu
escolhi:

```python
SEED = 20260101      # série reproduzível, byte a byte
N_DAYS = 180         # receita diária: tendência + sazonalidade + ruído

# 12 injeções em datas conhecidas: 6 spikes, 6 quedas
INJECTIONS = [
    (30, "spike", 2.6), (52, "spike", 2.3), (88, "spike", 3.2),
    (120, "spike", 2.4), (150, "spike", 2.8), (168, "spike", 2.5),
    (41, "drop", 0.70), (66, "drop", 0.62), (100, "drop", 0.72),
    (135, "drop", 0.58), (158, "drop", 0.68), (175, "drop", 0.75),
]
```

Com ground truth exato, a comparação dos métodos virou ciência medida em vez de
opinião. O resultado que eu não esperava: **o z-score detecta 6 de 6 spikes e 0 de 6
quedas.** A explicação é estatística pura — uma queda comprime a média e o desvio da
janela, então o próprio desvio anômalo entra no denominador e o evento desaparece. O
IQR ficou com o melhor F1 (0.86, zero falso positivo); o STL encontrou as 12, ao custo
de 10 falsos positivos.

Duas aulas de disciplina entraram nesse benchmark. A primeira: os baldes de magnitude
são definidos *por tipo* — um spike de 2.3× e uma queda de 0.70× não vivem na mesma
escala, e misturá-los no mesmo balde teria produzido uma tabela mentirosa que eu mesmo
quase publiquei. A segunda: o método mais popular (*z-score*, o que todo mundo cita) é
cego exatamente para o evento que importa em receita — a queda.

## 4. Protocolo 3: queries que devem falhar

No benchmark de retrieval eu cometi um cuidado que a maioria dos tutoriais não tem:
incluí 5 queries **fora do cardápio do corpus** — crossfit, food truck, dentista,
ateliê, autoescola — para as quais nenhuma política existe. Elas *devem* falhar. O
resultado foi hit@3 21/25 (0.84) e MRR@3 0.793 sobre todas as queries, com 20/20
dentro do corpus e 1/5 fora (o crossfit acertou a academia por sobreposição lexical de
vocabulário — acidente, não acerto).

Esse tipo de dado é o oposto do que o mercado publica: sistemas de retrieval geralmente
são avaliados só em queries que têm resposta. Um benchmark sem casos negativos não mede
recall — mede otimismo. E o MRR condicional (0.944, só sobre os acertos) existe no card
apenas como comparativo; a métrica principal é a honesta, sobre todas.

## 5. Quando o benchmark encontra a realidade

A lição mais cara veio de uma rodada real de LLM. Eu tinha um avaliador de prompts que
rodava em modo demo — respostas fixas no código, latência de mentirinha. Na primeira
rodada real, contra o `openai/gpt-oss-20b` via Groq, três coisas quebraram ao mesmo
tempo:

- **Respostas vazias silenciosas.** Com `max_tokens=200`, o canal de pensamento do
  modelo de raciocínio comia o budget inteiro: HTTP 200, `content` vazio, zero erro. A
  amostra desaparecia sem deixar rastro.
- **429 sem retry.** O free tier tem limite de 30 requisições por minuto; 5 das 36
  chamadas morreram sem backoff.
- **Modelo aposentado.** O `llama-3.1-8b-instant` que eu tinha fixado saiu do free tier
  em agosto de 2026 — 404 na cara.

Depois de corrigir (budget de 1000 tokens, retry com backoff, pacing de 2s), a rodada
limpa produziu o achado mais interessante de todos: o prompt de palavra seca extraiu
rótulo em apenas 4 de 12 casos — nas outras 8, o modelo *recusava* classificar
("preciso de mais informações"). O prompt com schema JSON explícito extraiu 12/12, com
as três classes aparecendo. Nenhum desses achados existia no modo demo, e nenhum
existiria se eu tivesse publicado o benchmark só no papel.

A generalização: **benchmark mede o pipeline, não só o modelo.** A integração — budget
de tokens, rate limit, ciclo de vida dos modelos — faz parte da métrica. E o dado
sintético só vale como protocolo quando a rodada real confirma o protocolo.

## 6. O checklist do que eu publico

- Nunca métrica in-sample. Se treinei e avaliei nos mesmos dados, o número é 1.0 e não
  vale nada.
- O protocolo viaja junto com o número — seed, splits, o que foi tunado e onde.
- Desvio padrão e tamanho de amostra fazem parte da métrica, não são nota de rodapé.
- Casos que devem falhar existem no benchmark, e a falha é publicada.
- Modo demo é rotulado como demo. Latência de 120 ms constante é assinatura de dado
  falso.
- Erros ficam no repositório: `benchmark_errors.csv` existe pra ser lido.
- Limitações no card, escritas antes de alguém perguntar.

## Fechamento

Um portfólio com 0.633 honestos diz ao recrutador duas coisas que um 1.0 nunca diz:
que eu sei medir, e que eu não tenho medo do número real. A segunda importa mais.
Todos os protocolos, dados e código deste artigo estão públicos — os benchmarks no
[Hugging Face](https://huggingface.co/ranzouu), o código no
[GitHub](https://github.com/ranzouu), e a comparação de prompts rodando ao vivo no
Space do prompt-evaluator.

— Rayson Severiano Rodrigues, Fortaleza/CE, novembro de 2026.
