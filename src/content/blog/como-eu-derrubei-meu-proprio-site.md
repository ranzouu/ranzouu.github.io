---
title: "Como eu derrubei meu próprio site (e o que consertou em duas horas)"
description: "Deixei o repositório privado por cinco minutos e o site saiu do ar. Achei que era cache. Não era. A recuperação teve dois passos que eu não conhecia."
pubDate: 2026-11-12
tags: ["cotidiano", "estudo"]
---

Deixei o repositório do site privado por cinco minutos. Quando fui verificar, o site

estava fora do ar. Erro 404, a página inteira.

Meu primeiro palpite foi cache, porque é sempre o palpite mais preguiçoso. Esperei.

Nada. O segundo palpite foi o build, porque o workflow tinha passado verde no

GitHub. Também não era.

O que realmente aconteceu tem duas partes, e nenhuma das duas é óbvia.

A primeira: quando um repositório fica privado, o GitHub não pausa o Pages, ele

**desmonta**. Some a configuração, o site, o histórico de publicação. Tudo. E

deixar o repositório público de novo não reconstrói nada sozinho: eu devolvi a

visibilidade, olhei a API e o Pages simplesmente não existia mais.

A segunda é a parte que me custou mais tempo. Recriar o Pages pela API funcionou, o

objeto voltou, e o site continuava morto. O motivo: o último deploy de sucesso

tinha rodado **antes** de eu recriar o Pages. Ou seja, a publicação foi feita para um

destino que não existia no momento em que ela aconteceu. Verde no painel, vazio no

mundo. Só um deploy novo, rodado depois da recriação, fez o site voltar.

O conserto, quando soube o que era, levou dois comandos e um minuto. O diagnóstico

levou uma hora e meia.

O que eu levo disso, e é por isso que está escrito aqui e não num artigo técnico:

aquele deploy verde me enganou com mais eficiência do que qualquer erro

vermelho já me enganou. Verde diz que o processo rodou, não que a coisa existe. Se

eu tivesse confiado no sinal verde e ido dormir, teria acordado com o site morto sem

saber o motivo. Anotei a sequência completa pra não precisar descobrir de novo, e

hoje eu sei que a primeira pergunta não é "o build passou?", é "existe algo no

destino?".
