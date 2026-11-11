---
title: "O pet que dorme quando você esquece dele: como um motor simples cria a ilusão de personalidade"
description: "Um companheiro digital que não usa LLM nenhum: quatro números entram, três notas saem, e o bicho decide se está dormindo, animado, curioso ou tranquilo. O código real, a ordem que vira história, e por que testar com entradas malucas é o que separa personalidade de script."
pubDate: 2026-11-11
tags: ["swift", "design de comportamento", "produto", "testes"]
---

Artigo técnico · 11 de novembro de 2026 · 11 min de leitura

Todo mundo já viu um bichinho virtual que parece morto. Você toca, ele anima, você

sai, ele dorme. Nunca surpreende. A sensação de "essa criatura tem vontade própria"

não vem de gráficos bonitos, vem de o sistema **acertar o tom** com pouca informação.

Este artigo conta como eu fiz isso no [Tameru](https://github.com/ranzouu/tameru), um

app para iPhone e Apple Watch: sem modelo de linguagem, sem rede neural, só uma regra

de decisão bem pensada, e 49 testes para não deixar a personalidade quebrar.

## O problema: parecer vivo com quatro números

O que o app sabe do usuário é pouco: **saúde, foco, humor e convívio social**, cada um

de 0 a 100. É o que dá para ajustar num controle de sliders, e é o que o relógio

consegue medir de verdade (passos, por exemplo). Quatro números não descrevem uma

pessoa, mas descrevem o suficiente para uma criatura reagir de forma coerente.

A pergunta de design é: **como transformar quatro números em um comportamento que

pareça escolha, não conta?**

## A regra que virou o coração do app

A primeira ideia de qualquer programador é somar tudo e fazer uma média. Média é

segura e é exatamente por isso que ela é chata: a criatura fica sempre no meio.

O que funcionou foi traduzir os quatro números em **três notas de personalidade**

(descoberta, energia e harmonia) e depois decidir o estado por **prioridade**, não por

cálculo. É a mesma lógica de um bom garçom: não existe "60% simpático". Ele repara que

a mesa está vazia, que o cliente acabou de sentar, e age.

No código, cada nota é uma mistura com peso diferente:

```swift
// descoberta puxa mais foco que saúde
let discovery = (focus * 0.7 + health * 0.3) / 100.0
// energia junta saúde e humor
let energy = (health * 0.6 + happiness * 0.4) / 100.0
// harmonia é o eixo social
let harmony = (happiness * 0.5 + social * 0.5) / 100.0
```

E a decisão segue uma fila explícita, do mais urgente ao mais calmo:

```swift
if health < 25 || energy < 0.25        { return .sleeping }
if health >= 70 && energy >= 0.65      { return .energized }
if focus >= 60 && discovery >= 0.55    { return .curious }
return .tranquil
```

## A ordem é a história, não a lógica

Repare que o sono vem primeiro. Parece detalhe técnico, mas na verdade é a regra

narrativa mais importante do app: **uma criatura exausta não fica curiosa**. Se a

curiosidade viesse antes, um usuário com foco alto e saúde no chão veria o bicho

animado sorrindo, e a ilusão de personalidade morreria ali.

A ordem de prioridade funciona como o roteiro de uma peça: cada condição só entra em

cena se as anteriores não estiverem resolvidas. Mudar a ordem muda o personagem sem

mudar uma linha de matemática. Foi a decisão mais barata e mais impactante do projeto.

## Onde isso quebra, e foi testado para quebrar

Uma regra com números fixos tem um monstro escondido: as bordas. O que acontece com

saúde 24.9 e energia 0.25? E se chegarem 999 em vez de 100? E se o app chamar a

decisão de cinco partes ao mesmo tempo?

Por isso o motor é um pacote Swift puro, separado da interface, com **49 testes** que

incluem três famílias que quase ninguém escreve:

- **adversariais**: entradas absurdas (negativas, gigantes, limites exatos) para

  garantir que o comportamento não "vaza" para fora dos quatro estados;

- **de stress**: milhares de avaliações seguidas para provar que o motor não acumula

  estado escondido nem degrada;

- **de concorrência**: chamadas simultâneas, porque o relógio e o iPhone podem pedir a

  mesma decisão no mesmo instante.

Rodar isso leva segundos:

```bash
cd Packages/TameruContextEngine && swift test
# Executed 49 tests, with 0 failures
```

## A parte honesta: isto não é IA

Não tem modelo de linguagem, não tem aprendizado. É engenharia de comportamento:

dados limitados, regras explícitas e testes. E isso é uma escolha, não uma limitação.

Um LLM aqui seria caro, imprevisível e, o que é pior para um produto assim,

**inconsistente**: a graça é o bicho ser o mesmo bicho sempre, ainda que reaja

diferente.

O que este projeto me ensinou, e o que ele mostra num portfólio, é diferente: a

sensação de vida mora nas **regras de transição**, não na animação. Um boneco bonito

com regra ruim parece um script; um boneco simples com a ordem certa parece que está

pensando em você.

## O que ficou pronto e o que ficou de fora

- **Pronto**: o motor (com os 49 testes), os apps de iPhone e watchOS, sincronização

  entre os dois e a documentação de produto completa (25 capítulos de visão, dos

  sistemas de evolução e memória até a direção de arte);

- **De fora**: publicação na App Store, e o sistema de memórias ainda é rascunho de

  tela, com o texto do design escrito e a persistência simples.

Se você quer ver a decisão de verdade, o código está aberto:

**[github.com/ranzouu/tameru](https://github.com/ranzouu/tameru)**

O próximo passo do projeto é justamente o mais interessante: usar as **memórias** do

usuário como um quarto eixo, para o pet não reagir só ao presente, mas ao que vocês

viveram juntos.

por Rayson Severiano Rodrigues, Fortaleza/CE, novembro de 2026.
