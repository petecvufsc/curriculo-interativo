# Publicar o Currículo Interativo na internet

Objetivo: o app ficar num endereço público e gratuito (GitHub Pages), com um link na página **Downloads** do site do PET (`petecv.ufsc.br`, que é WordPress).

O app é um **site estático**: não tem servidor, banco de dados nem login. Os dados de cada aluno ficam só no navegador dele, e nada é enviado para lugar nenhum.

## Visão geral

| Parte | Quem faz | Tempo |
|---|---|---|
| A. Conta e repositório no GitHub | você (precisa de login) | 10 min |
| B. Enviar o site | você, com 2 comandos | 5 min |
| C. Ligar o GitHub Pages | você, 3 cliques | 5 min |
| D. Colocar o link no site do PET | você (acesso ao WordPress) | 10 min |
| E. Atualizações futuras | 2 comandos | 2 min |

## A. Conta e repositório no GitHub

1. Entre em <https://github.com> e crie uma conta. **De preferência uma conta do PET**, com o e-mail do grupo (por exemplo `petecv@contato.ufsc.br`), e não uma conta pessoal: assim o projeto continua com o PET quando os bolsistas mudarem. O nome de usuário vira parte do endereço (por exemplo `pet-ecv-ufsc`).
2. Clique em **New repository** (<https://github.com/new>).
   - **Repository name:** `curriculo-interativo`
   - **Public** (o GitHub Pages gratuito exige repositório público)
   - **Não marque** "Add a README file", ".gitignore" nem "license". O repositório precisa nascer **vazio**.
3. Clique em **Create repository**. A próxima tela mostra o endereço do repositório, algo como `https://github.com/pet-ecv-ufsc/curriculo-interativo.git`. Anote.

## B. Enviar o site

A pasta `curriculo-interativo-publicacao` (ao lado da pasta do projeto) já tem só o que deve ser público: o site, os testes e a documentação. Ela **não** tem os arquivos de referência, a lógica descompilada do programa antigo nem o histórico com e-mails pessoais. Para gerá-la de novo, rode `node scripts/exportar-publicacao.mjs --refazer` dentro de `projeto/`.

Abra um terminal **dentro dessa pasta** (no Explorador de Arquivos: clique com o botão direito na pasta > "Abrir no Terminal") e rode, trocando o endereço pelo do passo A3:

```bash
git remote add origin https://github.com/NOME-DA-CONTA/curriculo-interativo.git
git push -u origin main
```

O Git abre uma janela para você entrar na conta do GitHub. Entre e autorize.

## C. Ligar o GitHub Pages

1. No repositório, abra **Settings > Pages**.
2. Em **Build and deployment > Source**, escolha **GitHub Actions**.
3. Abra a aba **Actions**. Deve haver uma execução "Publicar no GitHub Pages" em andamento (se não houver, clique nela e em **Run workflow**).
4. Espere ficar verde (cerca de 2 minutos). O endereço do site aparece em **Settings > Pages**:

   `https://NOME-DA-CONTA.github.io/curriculo-interativo/`

O fluxo roda os testes antes de publicar: se algum falhar, o site **não** é atualizado, e você vê o erro na aba Actions.

**Teste:** abra o endereço no computador e no celular. No celular, o menu do navegador oferece "Instalar" ou "Adicionar à tela inicial", e depois da primeira visita o app abre sem internet.

## D. Colocar o link no site do PET (WordPress)

1. Entre no painel do site: `https://petecv.ufsc.br/wp-admin` (com a conta que o PET usa).
2. **Páginas > Downloads > Editar.** Essa página já lista o Currículo Interativo antigo.
3. Acrescente, perto dele, um texto como:

   > **Currículo Interativo (versão web).** Planeje sua matrícula direto no navegador, no computador ou no celular, sem instalar nada: <https://NOME-DA-CONTA.github.io/curriculo-interativo/>

   Transforme o endereço em link (selecione o texto > ícone de corrente). Mantenha o instalador antigo por um tempo, ou retire-o quando o PET decidir.
4. Se quiser um item no menu (por exemplo, em **Graduação**), crie uma página nova com o título "Currículo Interativo" e, no campo do plugin **Page Links To** (já instalado), escolha "Um endereço personalizado" e cole o endereço do site.
5. Clique em **Atualizar**.

## E. Atualizações futuras

Quando o projeto mudar (por exemplo, um currículo novo), dentro de `projeto/`:

```bash
node scripts/exportar-publicacao.mjs --atualizar
```

Depois, na pasta `curriculo-interativo-publicacao`:

```bash
git push
```

O GitHub testa, constrói e publica sozinho. A data "Última atualização" do cabeçalho muda a cada publicação.

## O que decidir antes de publicar

- **Conta:** do PET ou pessoal (recomendo a do PET).
- **Endereço definitivo:** se o endereço mudar depois, os planos que os alunos salvaram no navegador **não acompanham** (cada endereço tem seu próprio armazenamento). Vale escolher o nome da conta e do repositório antes de divulgar.
- **Licença:** o repositório sai **sem licença**, o que significa "todos os direitos reservados": outras pessoas poderiam ver o código, mas não reutilizá-lo. Se o PET quiser permitir reuso (por exemplo, outros cursos adaptarem), escolha uma licença (MIT é a mais comum). Essa decisão é do PET e da universidade.
- **Material do programa antigo:** por padrão, a lógica descompilada (`docs/engenharia-reversa`) **não** vai. Se quiser incluí-la, use `--com-engenharia-reversa`.
- **Endereço `.ufsc.br`:** o GitHub Pages usa `github.io`. Se a UFSC exigir um endereço institucional, é preciso pedi-lo à SeTIC; o site funciona em qualquer endereço, sem mudar nada.

## Se algo der errado

| Sintoma | O que fazer |
|---|---|
| `git push` pede senha e recusa | Use a janela de login do navegador (Git Credential Manager) ou crie um token em Settings > Developer settings > Personal access tokens. |
| Actions fica vermelho no passo "npm test" | Há um teste quebrado. O texto do erro aparece na execução; mande para quem mantém o projeto. |
| Actions fica vermelho em "deploy-pages" | Confira se o passo C2 foi feito (Source: GitHub Actions). |
| A página abre em branco | Aguarde 1 a 2 minutos depois do verde e limpe o cache (Ctrl+F5). |
| O WordPress remove o link | Use o editor "Código" e cole `<a href="...">Currículo Interativo</a>`. |
