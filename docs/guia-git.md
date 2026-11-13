# Git e GitHub no dia a dia deste projeto

Este guia explica como manter o computador e o GitHub atualizados. As tabelas e os comandos de quatro arquivos abaixo registram uma etapa anterior de 13/11/2026. A revisão mais recente acrescenta a feature 002, o roteiro Canva e o relatório; consulte o [estado verificado](revisao-conformidade.md) e use `git status` para selecionar todos os arquivos relacionados ao trabalho atual. A branch do Victor avançou de `e3d5af5` para `8bcbfeb` depois da consulta histórica deste guia.

## O que existe em cada lugar

| Termo | O que significa neste projeto |
| --- | --- |
| Pasta de trabalho | Os arquivos que você abre e edita no computador. Salvar no editor atualiza essa pasta. |
| Área de preparação | Os arquivos selecionados com `git add` para entrar no próximo commit. |
| Commit | Uma versão registrada no histórico local pelo `git commit`. |
| Branch | Uma linha de trabalho, como `main` ou `docs/detalhamento-frontend`. |
| `main` local | A linha principal guardada no seu computador. |
| `origin` | O nome do endereço do repositório GitHub configurado no seu Git. |
| `origin/main` | O último estado da `main` do GitHub que seu Git buscou. Esse registro fica no computador e pode ficar desatualizado. |
| `main` no GitHub | A linha principal que está no servidor e recebe o trabalho integrado da equipe. |

Salvar no editor, fazer commit e enviar ao GitHub são três ações diferentes. Um arquivo salvo pode ainda não ter commit; um commit local pode ainda não ter sido enviado.

## Quem estava desatualizado na verificação

| Local ou branch | Commit | Situação verificada |
| --- | --- | --- |
| `main` no computador | `ef015b7` | Estava dois commits atrás da `main` do GitHub. |
| `docs/detalhamento-frontend` no computador | `bbbda4a` | Era a branch aberta e tinha a mesma versão da `main` do GitHub. |
| `docs/detalhamento-frontend` no GitHub | `bbbda4a` | Igual à sua branch local antes dos novos documentos. |
| `main` no GitHub | `bbbda4a` | Continha o primeiro commit, a alteração do título e o merge do pull request nº 1. |
| `VictorXavierSL-patch-1-dev` no GitHub | `e3d5af5` | Tinha ajustes de documentação e prototipagem ainda separados da `main`. |

A diferença de dois commits era entre as duas `main`. Sua pasta aberta já mostrava os arquivos da versão `bbbda4a`, porque você estava em outra branch. As mudanças mais novas do Victor exigem integração própria; atualizar a `main` local não incorpora automaticamente toda branch da equipe.

## O que cada comando faz

| Comando | Efeito |
| --- | --- |
| `git status` | Mostra a branch aberta e alterações locais. |
| `git diff` | Mostra alterações em arquivos já acompanhados que ainda não foram preparadas. Arquivos novos devem ser abertos para leitura. |
| `git add caminho/do/arquivo` | Seleciona uma alteração para o próximo commit. |
| `git diff --cached` | Mostra o que foi selecionado para o commit, incluindo arquivos novos preparados. |
| `git commit -m "mensagem"` | Registra uma versão no computador. |
| `git fetch origin` | Busca commits e atualiza os registros das branches do GitHub, sem trocar os arquivos da sua branch aberta. |
| `git pull --ff-only origin main` | Busca a `main` do GitHub e tenta avançar a branch aberta até ela. Para atualizar sua `main`, entre nela primeiro. |
| `git push origin nome-da-branch` | Envia os commits locais dessa branch para a branch correspondente no GitHub. |
| Pull request, ou PR | Propõe integrar mudanças de uma branch em outra, por exemplo sua branch de documentação na `main`. |

O `fetch` é descrito na [documentação do Git](https://git-scm.com/docs/git-fetch). O `pull --ff-only` avança quando o histórico permite; se houver commits exclusivos dos dois lados, ele para e informa a divergência. Veja a [documentação de pull](https://git-scm.com/docs/git-pull). O envio ocorre com [push](https://git-scm.com/docs/git-push).

## O que fazer agora com os documentos novos

Este trabalho acrescentou dois guias e atualizou o README e o registro da entrega. Eles começam como alterações locais na branch `docs/detalhamento-frontend`. Primeiro leia os arquivos e confira o estado:

```powershell
git status
git diff
```

Para registrar exatamente esses quatro arquivos e enviar a branch:

```powershell
git add README.md docs/guia-git.md docs/detalhamento-projeto.md docs/entrega-e-proximos-passos.md
git diff --cached
git commit -m "docs: detalha projeto e rotina de Git"
git push -u origin docs/detalhamento-frontend
```

Execute um comando por vez e confira a saída antes de continuar. `-u` associa a branch local à correspondente no GitHub. Depois disso, nela, `git push` pode usar essa associação.

O push atualiza a branch `docs/detalhamento-frontend` na nuvem. Para colocar os documentos na `main` compartilhada:

1. Abra o [repositório no GitHub](https://github.com/leonardodavi9274-byte/HackaRun-2026-projeto-Yvisalro-13-).
2. Abra **Pull requests** e escolha **New pull request**.
3. Use **base: main** como destino e **compare: docs/detalhamento-frontend** como origem.
4. Confira os arquivos, crie o PR e revise com a equipe.
5. Conclua o merge quando a revisão estiver pronta. A `main` do GitHub passa a conter as mudanças integradas.

Esses campos e a criação do PR estão descritos na [documentação do GitHub](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request). Antes de registrar os documentos, sua branch e a `main` tinham o mesmo commit; naquele estado não havia mudança nova para um PR entre elas.

## Como atualizar a main do computador

Com o trabalho atual registrado em commit e sem alterações pendentes, execute:

```powershell
git status
git switch main
git pull --ff-only origin main
git status --short --branch
```

Na situação verificada antes dos novos documentos, isso permitiria avançar a `main` local de `ef015b7` para `bbbda4a`. Se outros PRs já tiverem sido integrados quando você executar, serão buscados também.

O comando `git switch main` apenas muda a branch aberta. O `pull` é que busca e aplica a atualização. Se o status mostrar mudanças que você ainda está fazendo, registre-as na branch correta antes de trocar de trabalho. Se o Git informar divergência ou conflito, leia a mensagem e examine `git status` antes de continuar.

## Rotina para começar um trabalho novo

Comece com o trabalho anterior salvo no histórico e a pasta sem alterações pendentes:

```powershell
git switch main
git pull --ff-only origin main
git switch -c docs/revisao-planejamento
```

`docs/revisao-planejamento` é um exemplo de nome novo. Use um nome relacionado ao trabalho que fará. O `-c` cria a branch; para entrar em uma branch já existente, use `git switch nome-da-branch`.

Edite, salve, revise e registre arquivos relacionados à mesma mudança. Por exemplo, se você alterou o README:

```powershell
git status
git diff
git add README.md
git diff --cached
git commit -m "docs: revisa planejamento"
git push -u origin docs/revisao-planejamento
```

Depois abra um PR dessa branch para `main`. Após o merge, volte à `main` local e faça `git pull --ff-only origin main`. Para a próxima tarefa, crie outra branch a partir dessa base atualizada.

## Como continuar uma branch enquanto a equipe muda a main

Com suas alterações registradas e a pasta sem alterações pendentes, entre na branch em que está trabalhando e traga o que já foi integrado na `main`. Exemplo para a branch atual:

```powershell
git switch docs/detalhamento-frontend
git fetch origin
git merge origin/main
```

O merge reúne os históricos. Ele pode avançar diretamente, criar um commit de integração ou pedir resolução de conflitos. Se concluir com sucesso, revise o resultado e envie a branch com `git push`. Se houver conflito, o Git marca os trechos envolvidos: será preciso revisar os arquivos, escolher o conteúdo correto e concluir a resolução antes do envio. O procedimento está na [documentação de merge](https://git-scm.com/docs/git-merge).

Um `git pull` sem indicar outra origem, dentro de `docs/detalhamento-frontend`, normalmente atualiza essa branch a partir da correspondente no GitHub. Isso não significa trazer também mudanças de `main` ou da branch do Victor.

## Como saber se falta baixar ou enviar algo

```powershell
git fetch origin
git status --short --branch
git branch -vv
git log --all --oneline --graph --decorate -15
```

- `behind N`: a branch está atrás da branch acompanhada em N commits.
- `ahead N`: há N commits locais que ainda não aparecem na branch acompanhada.
- Ambos: os históricos divergiram e precisam ser integrados.
- Arquivos modificados ou novos: há trabalho na pasta que ainda precisa ser revisado e registrado.
- Pasta limpa: não há alterações pendentes nos arquivos mostrados pelo status. Isso, sozinho, não prova que todas as branches estão sincronizadas.

O status compara com registros locais. Faça o `fetch` antes de usar esses números para avaliar o estado atual do GitHub. Veja também as documentações de [status](https://git-scm.com/docs/git-status), [add](https://git-scm.com/docs/git-add), [commit](https://git-scm.com/docs/git-commit) e [switch](https://git-scm.com/docs/git-switch).

## O que significa manter a nuvem atualizada

Para manter seu trabalho disponível no GitHub, faça commits e push ao terminar uma mudança coerente. Para manter a `main` compartilhada atualizada, integre os trabalhos revisados por PR. Para manter seu computador atualizado, busque as mudanças e atualize a branch em que vai trabalhar.

O GitHub guarda os arquivos e o histórico do projeto. Publicar o repositório não coloca automaticamente o aplicativo em funcionamento: a hospedagem do backend, o Supabase e as landing pages são partes diferentes, ainda pendentes neste projeto.
