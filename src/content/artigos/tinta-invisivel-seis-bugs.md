---
title: "Abri meu próprio app pra revisar e achei seis bugs — três deles de invisibilidade"
description: "O LeitorWatch rodava bonito no simulador até eu olhar tela por tela: botões pintados com tinta invisível, uma coroa que mudava o número mas não a velocidade, e um bug que apagava a biblioteca do usuário. O que seis bugs ensinam sobre revisar o próprio trabalho."
pubDate: 2026-11-11
tags: ["swift", "watchos", "revisão", "bugs", "produto"]
---

Artigo técnico · 11 de novembro de 2026 · 12 min de leitura

Pense num restaurante onde o garçom tem um cardápio lindo — mas as páginas estão

coladas. Você vê os pratos, aponta, e nada acontece. O app "funcionando" é isso:

a tela mostra tudo, o código compila, os testes passam — e o usuário toca no botão

e nada. Foi exatamente o que encontrei quando abri o

[LeitorWatch](https://github.com/ranzouu/leitorwatch) para revisar antes de publicar.

## O que é o app, em uma frase

O LeitorWatch transforma o Apple Watch num leitor de bolso: você importa um arquivo

de texto do iCloud e lê de dois jeitos — **RSVP**, uma palavra por vez no centro da

tela (como um letreiro que não deixa seu olho passear), ou **TTS**, com o relógio

lendo em voz alta enquanto você faz outra coisa.

Compilava. Rodava. E tinha seis problemas — três deles de um tipo específico que

só aparece quando você **olha** a tela: elementos que existem no código e são

invisíveis para o olho humano.

## Bug 1 — A coroa que mudava o número, não a velocidade

O RSVP tem uma coroa digital para ajustar as palavras por minuto. Girava, o número

mudava de 300 para 325, 350… e o texto continuava no mesmo ritmo.

O motivo é uma lição clássica de interface: o número na tela e o motor do app eram

**duas coisas diferentes**. A coroa alterava uma variável que só era lida quando o

timer era criado — e o timer, já rodando, nunca ficava sabendo da mudança. A tela

dizia uma coisa; o app fazia outra.

A correção é uma linha de observação: quando a velocidade muda, o timer renasce com

o novo intervalo.

```swift
.onChange(of: wpm) { _, _ in
    if isPlaying { startTimer() }   // o novo ritmo vale na hora
}
```

A lição: **toda variável de configuração precisa de um dono que a aplique**. Mostrar

não é fazer.

## Bugs 2 e 3 — Tinta invisível

Os botões de voltar e avançar do leitor tinham fundo `laranja com 15% de opacidade`

sobre fundo preto. O resultado é um laranja quase preto — o botão existe, tem área

de toque, funciona… e é invisível. O mesmo aconteceu com os botões A-/A+ de tamanho

de fonte: preto-azulado no preto absoluto.

Contraste não é detalhe estético: é a diferença entre um controle e um vazio. A

correção foi trocar o estilo "preenchido com transparência" por **ícone colorido com

controle explícito de cor** e área de toque garantida:

```swift
Button(action: { goForwardWords(5) }) {
    Image(systemName: "goforward")
        .foregroundColor(.orange)          // cor sólida, não tinta translúcida
}
.buttonStyle(.plain)
.frame(width: 36, height: 36)
.contentShape(Rectangle())                 // a área de toque continua grande
```

## Bug 4 — Avançar com o áudio pausado começava a falar

Na leitura por voz, os botões de pular frase chamavam a função que reinicia a fala

— mesmo com o áudio pausado. O usuário pedia "pula uma frase" e recebia "comecei a

falar do nada".

Foi o bug mais fácil de corrigir e o mais fácil de não perceber no código, porque a

função funcionava perfeitamente para o caso comum (tocando). O caso de borda — pausado

— é que denunciava. A correção separa as duas responsabilidades: navegar é sempre

possível; falar só quando o usuário pediu para falar.

## Bug 5 — O bug que apagava a biblioteca do usuário

Este não era de interface, e era de longe o pior. O app guarda os livros num arquivo

JSON no relógio. A leitura tinha um `try/catch` generoso demais: **qualquer** erro

de leitura caía no caminho de "primeira execução", que semeia três livros de exemplo

e **regrava o arquivo**.

Traduzindo: se a leitura falhasse — proteção de arquivo com o relógio bloqueado,

arquivo momentaneamente indisponível — o app não reportava erro: ele substituía a

biblioteca do usuário pelos livros de demonstração. Falhar era aceitável; **apagar

não era**.

A correção separa dois cenários que nunca deveriam ter sido o mesmo `catch`:

```swift
// arquivo NÃO existe = primeira execução → semeia mocks
guard FileManager.default.fileExists(atPath: libraryURL.path) else {
    saveLibrary(mockBooks); return mockBooks
}
// arquivo existe mas não pôde ser lido → preserva, reporta, não sobrescreve
do { return try JSONDecoder().decode([Book].self, from: Data(contentsOf: libraryURL)) }
catch { print("biblioteca preservada: \(error)"); return [] }
```

E a proteção de arquivo passou de `completeFileProtection` para

`completeFileProtectionUntilFirstUserAuthentication` — porque um leitor precisa

funcionar logo depois que você levanta o pulso, não só depois do primeiro desbloqueio

do dia.

## Bugs 6 e 7 — O id que era rótulo, e a barra gorda

Dois menores, igualmente instrutivos:

- **Capítulos com o mesmo nome colidiam.** O capítulo usava o próprio título como

  identificador — e quando o livro tinha dois "Capítulo 1", o SwiftUI confundia os

  dois na lista. Identificador não é rótulo: passou a ser título + posição no texto.
- **A barra de progresso era enorme.** O `ProgressView` padrão do watchOS desenha

  uma barra alta que dominava a tela do relógio. Troquei por uma barra fina de 4

  pontos desenhada à mão. O padrão do sistema não é automaticamente o certo para o

  seu contexto.

## Como eu achei tudo isso

Nada de testes automatizados de UI: abri o simulador, **naveguei tela por tela e

olhei cada screenshot**. Para ver cada tela sem depender de cliques (que no simulador

do relógio são imprecisos), adicionei temporariamente um seletor de tela por variável

de ambiente, tirei o print de cada uma, e comparei com o que eu esperava ver.

Depois de corrigir, repeti o processo: mesma tela, mesmo print, agora legível. O

seletor de debug foi removido antes de publicar — scaffolding não vai pro repositório.

## O que ficou

- build ok no watchOS 26.5, rodando no simulador;
- botões laterais e A-/A+ visíveis (**antes: tinta invisível**);
- velocidade da coroa aplicada na hora;
- pausado é pausado — navegar não dá play sozinho;
- biblioteca do usuário nunca mais é substituída por livros de exemplo;
- cinco ações do livro visíveis de uma vez na tela de opções (antes: duas).

O código está aberto, com o histórico do que foi corrigido:

**[github.com/ranzouu/leitorwatch](https://github.com/ranzouu/leitorwatch)**

A conclusão que vale para qualquer projeto: **compilar é o começo da revisão, não o

fim**. O app que "funciona" pode estar todo escrito em tinta invisível.
