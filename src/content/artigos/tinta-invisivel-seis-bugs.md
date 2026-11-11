---
title: "O app que estava pronto e tinha seis bugs: a revisão do LeitorWatch tela por tela"
description: "Um leitor para Apple Watch que compilava e rodava no simulador — com botões invisíveis, uma coroa que mudava o número mas não a velocidade, e um bug que apagava a biblioteca do usuário. Seis achados, o mecanismo de cada um e o que a revisão tela por tela pegou que o build não pega."
pubDate: 2026-11-11
tags: ["swift", "watchos", "revisão", "bugs", "produto"]
---

Artigo técnico · 11 de novembro de 2026 · 11 min de leitura

Um app que compila, roda e passa nos testes ainda pode estar inutilizável. O

[LeitorWatch](https://github.com/ranzouu/leitorwatch) — leitor de livros para Apple

Watch que importa arquivos do iCloud e lê em dois modos: **RSVP** (uma palavra por

vez no centro da tela, como um letreiro) e **TTS** (o relógio lendo em voz alta) —

passava nesses três critérios antes de uma revisão tela por tela. A revisão encontrou

seis problemas, três deles invisíveis a olho nu. Este artigo percorre cada achado no

formato sintoma → mecanismo → correção.

## A coroa que mudava o número, não a velocidade

**Sintoma:** girar a coroa digital trocava o ritmo na etiqueta — 300, 325, 350 — e a

leitura continuava na mesma velocidade.

**Mecanismo:** a variável exibida na tela e o timer que move as palavras eram estados

separados. O timer nascia com um intervalo calculado a partir do valor da coroa e não

era informado das mudanças seguintes.

**Correção:** uma observação da variável, que recria o timer com o novo intervalo:

```swift
.onChange(of: wpm) { _, _ in
    if isPlaying { startTimer() }   // o novo ritmo vale na hora
}
```

## Botões invisíveis (dois achados, mesma raiz)

**Sintoma:** os botões de voltar e avançar no leitor, e os A-/A+ de tamanho de fonte,

apareciam como manchas escuras sobre o fundo preto. Existiam, respondiam ao toque —

e não eram vistos.

**Mecanismo:** os dois casos usavam tinta translúcida: laranja a 15% de opacidade

sobre preto vira preto; azul a 15% de opacidade sobre preto vira preto. A borda

continuava lá, só não havia pixels suficientes para enxergá-la.

**Correção:** ícone com cor sólida e controle explícito de contraste, mantendo a área

de toque grande o bastante para o pulso:

```swift
Button(action: { goForwardWords(5) }) {
    Image(systemName: "goforward")
        .foregroundColor(.orange)              // cor sólida, não tinta translúcida
}
.buttonStyle(.plain)
.frame(width: 36, height: 36)
.contentShape(Rectangle())                     // a área de toque continua grande
```

## Avançar com o áudio pausado começava a falar

**Sintoma:** no modo de leitura por voz, pular uma frase com a fala pausada iniciava

a leitura.

**Mecanismo:** os dois botões de navegação chamavam a mesma rotina que reinicia a

fala — escrita para o caso comum (áudio tocando) e sem tratamento do estado pausado.

**Correção:** separar as responsabilidades. Navegar é sempre permitido; tocar áudio

só quando o usuário pediu para tocar:

```swift
guard currentSentenceIndex < sentenceInfos.count - 1 else { return }
currentSentenceIndex += 1
if isPlaying { restartSpeech() } else { updateProgress() }
```

## A biblioteca substituída pelos livros de exemplo

**Sintoma:** em falhas de leitura do arquivo de dados, o app voltava a exibir três

livros de demonstração no lugar da biblioteca do usuário.

**Mecanismo:** a abertura do arquivo usava um bloco `try/catch` único. Qualquer erro

— proteção de arquivo com o relógio bloqueado, arquivo momentaneamente indisponível

— caía no mesmo caminho do "primeiro uso", que semeia os exemplos **e regrava o

arquivo**. Falhar era tolerável; sobrescrever os dados do usuário, não.

**Correção:** separar os dois cenários no carregamento, e ajustar a proteção do

arquivo para `completeFileProtectionUntilFirstUserAuthentication` — um leitor precisa

funcionar assim que o pulso é levantado, não só após o primeiro desbloqueio do dia:

```swift
// arquivo NÃO existe = primeira execução → semeia os exemplos
guard FileManager.default.fileExists(atPath: libraryURL.path) else {
    saveLibrary(mockBooks); return mockBooks
}
// arquivo existe mas não pôde ser lido → preserva, reporta, não sobrescreve
do { return try JSONDecoder().decode([Book].self, from: Data(contentsOf: libraryURL)) }
catch { print("biblioteca preservada: \(error)"); return [] }
```

## Identificador confundido com rótulo, e a barra que dominava a tela

**Sintoma:** em livros com dois capítulos de mesmo título, a lista de capítulos

misturava as linhas.

**Mecanismo:** o `id` do capítulo era o próprio título. Identificador repetido quebra

a correspondeência entre dados e linhas na tela — a correção passou a usar título

somado à posição no texto.

**Sintoma:** a barra de progresso ocupava altura equivalente a um botão nas três

telas que a usavam.

**Mecanismo:** o `ProgressView` padrão do watchOS desenha uma barra alta, pensada

para telas maiores. **Correção:** barra fina de 4 pontos desenhada à mão, com fundo

translúcido e preenchimento proporcional.

## Como a revisão foi feita

Sem testes automatizados de interface: o app foi executado no simulador do watchOS

26.5 e cada tela inspecionada por captura de tela. Para chegar a telas de profundidade

sem depender de cliques imprecisos no simulador de relógio, um seletor de tela por

variável de ambiente foi incluído temporariamente, corrigido o que era preciso, e as

capturas repetidas comparando o obtido com o esperado. O seletor saiu do código antes

da publicação.

## O que ficou, verificável

- build ok no watchOS 26.5, executado no simulador;
- botões laterais e A-/A+ visíveis — antes: tinta invisível;
- velocidade da coroa aplicada no momento da mudança;
- navegação com áudio pausado não dispara a fala;
- falha de leitura preserva a biblioteca do usuário;
- quatro das cinco ações do livro visíveis de uma vez na tela de opções — antes: duas.

O código e o histórico das correções estão em

**[github.com/ranzouu/leitorwatch](https://github.com/ranzouu/leitorwatch)**.

O que esse exercício muda na prática: uma revisão que se limita a rodar o build valida

o caminho fácil. Os defeitos que impedem o uso — contraste, velocidade que não

responde, dados que somem — surgem quando alguém percorre as telas e compara o que

está escrito com o que acontece. Compilar é o começo da revisão, não o fim.
