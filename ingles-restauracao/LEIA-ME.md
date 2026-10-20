# Inglês na Restauração: exercícios online

Esta pasta tem os ficheiros da página de exercícios para os formandos e do painel de resultados para a formadora.

| Ficheiro | Para quê |
|---|---|
| `index.html` | Página dos formandos: entram com um código, fazem 20 perguntas e veem a nota. Têm no máximo 2 tentativas. |
| `painel.html` | Painel da formadora, protegido por palavra-passe: resumo da turma, notas, respostas e acessos. |
| `perguntas.js` | As 20 perguntas. Edite aqui se quiser mudar o texto de alguma. |
| `config.js` | O endereço da Google Sheet. É preciso preenchê-lo (passo 3). |
| `apps-script/Codigo.gs` | O código que grava tudo na Google Sheet. Não vai para o GitHub. |

Enquanto o `config.js` estiver vazio, as duas páginas funcionam em **modo de demonstração**: não gravam nada e o painel mostra dados de exemplo.

---

## 1. Criar a Google Sheet (registo)

1. No Google Drive, crie uma folha de cálculo nova, por exemplo "Inglês na Restauração – Registo".
2. Abra **Extensões › Apps Script**.
3. Apague o que lá estiver e cole todo o conteúdo de `apps-script/Codigo.gs`.
4. Na linha `const PALAVRA_PASSE = 'mude-esta-palavra-passe';`, troque o texto entre aspas pela palavra-passe do seu painel.
5. Clique em **Guardar** (ícone de disquete).
6. No menu de funções, escolha **configurar** e clique em **Executar**. O Google pede autorização: aceite com a sua conta. Na folha de cálculo aparecem 3 separadores:
   - **Formandos**: a lista da turma.
   - **Tentativas**: uma linha por tentativa, com nota, duração e cada resposta (✓ ou ✗).
   - **Acessos**: cada entrada, início, retoma e conclusão, com data e hora.
7. No separador **Formandos**, escreva um código e um nome por linha. Por exemplo `1001 | Maria Silva`. O código é o que cada formando vai escrever para entrar.

## 2. Publicar o registo como aplicação web

1. No Apps Script, clique em **Implementar › Nova implementação**.
2. Em "Selecionar tipo", escolha **Aplicação Web**.
3. Preencha assim:
   - **Executar como:** Eu
   - **Quem tem acesso:** Qualquer pessoa
4. Clique em **Implementar** e copie o **URL da aplicação Web** (termina em `/exec`).

Os formandos não têm acesso à folha. A página só consegue fazer quatro coisas: entrar, começar, enviar as respostas e, com a palavra-passe, ler os resultados.

## 3. Ligar as páginas ao registo

Abra o `config.js` e cole o URL entre as aspas:

```js
window.API_URL = "https://script.google.com/macros/s/XXXXXXXX/exec";
```

## 4. Publicar no GitHub Pages

1. No seu repositório, carregue `index.html`, `painel.html`, `perguntas.js` e `config.js`, todos na raiz. Não carregue a pasta `apps-script`.
2. Vá a **Settings › Pages**. Em "Build and deployment", escolha **Deploy from a branch**, depois o ramo **main** e a pasta **/(root)**. Clique em **Save**.
3. Passado 1 a 2 minutos, as páginas ficam disponíveis em:
   - Formandos: `https://SEU-UTILIZADOR.github.io/NOME-DO-REPOSITORIO/`
   - Painel: `https://SEU-UTILIZADOR.github.io/NOME-DO-REPOSITORIO/painel.html`

Envie aos formandos **só o primeiro link**, junto com o código de cada um.

## 5. Testar antes da turma

1. Acrescente um formando de teste na folha (por exemplo `TESTE | Teste Formadora`).
2. Faça o teste com esse código no telemóvel e confirme que aparecem linhas em **Tentativas** e **Acessos**.
3. Abra o painel com a sua palavra-passe.
4. No fim, apague as linhas de teste das três folhas.

---

## Como funcionam as tentativas

- Uma tentativa conta a partir do momento em que o formando carrega em **Começar**.
- Se fechar a página a meio, ao voltar continua **a mesma tentativa**. As respostas ficam guardadas no telemóvel, por isso recomeça onde parou desde que use o mesmo telemóvel e navegador.
- Depois de 2 tentativas a página bloqueia. Para dar uma tentativa extra a alguém, apague a linha dessa tentativa no separador **Tentativas**.

## Se mudar alguma coisa depois

- **Perguntas:** edite `perguntas.js` no GitHub. A primeira opção de cada pergunta é sempre a certa (a página baralha a ordem). Mudar o texto pode ser feito a qualquer momento, mas não mude o número de perguntas depois de haver respostas.
- **Código do Apps Script:** depois de editar, vá a **Implementar › Gerir implementações › Editar (lápis) › Versão: Nova versão › Implementar**. O URL mantém-se.

## Dados pessoais

A folha guarda o código, o nome, as datas e horas, o tipo de dispositivo e as respostas. Informe os formandos de que as respostas ficam registadas para efeitos de avaliação da formação. Os dados ficam na sua conta Google.
