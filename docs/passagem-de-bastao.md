# Passagem de bastão: como o PET mantém o Currículo Interativo sem a gente

Este guia é para quem **herdar** a ferramenta (o próximo bolsista, o tutor, qualquer pessoa do PET). Foi escrito para quem **não** é programador. Onde precisar de programação, diz isso e indica como pedir ajuda a um agente de IA.

> **Em uma frase:** o site é um conjunto de arquivos parados (sem servidor, sem banco de dados, sem login). Ele fica no GitHub, que o publica de graça. Quase nunca é preciso mexer; as duas ocasiões em que é preciso são **mudança de currículo** e **mudança de pré-requisito** (a Coordenação avisa).

## 1. O mapa: onde está cada coisa

| O quê | Onde | Quem precisa acessar |
|---|---|---|
| **O site no ar** | `https://petecvufsc.github.io/curriculo-interativo/` | todos (alunos) |
| **O código e o histórico** (o que o GitHub publica) | repositório `petecvufsc/curriculo-interativo` no GitHub | quem for atualizar |
| **A conta do GitHub** | usuário `petecvufsc`, e-mail `pet.ecv.ufsc@gmail.com` | tutor e bolsista responsável |
| **O link no site do PET** | `petecv.ufsc.br` > Páginas > Downloads (tabela "Currículo Interativo") | quem edita o WordPress |
| **O projeto completo** (com o material original do programa antigo e a documentação) | pasta `reconstrucao-curriculo-interativo` no computador de quem criou, **mais a cópia no Drive do PET** (ver seção 3) | quem for evoluir a ferramenta |
| **O programa antigo (.NET)** e a lógica descompilada | pasta `referencias/` do projeto completo (**não é público**) | só consulta |

A parte que vai a público é só a pasta `projeto/` (código, testes e documentação). O material do programa antigo **nunca** vai para o GitHub (está de propósito fora da pasta pública).

## 2. O que fazer **agora**, antes de sair (checklist de saída)

Faça tudo isto com a pessoa que vai herdar, olhando junto. Marque cada item.

- [ ] **Acesso ao e-mail do PET** (`pet.ecv.ufsc@gmail.com`): quem controla esse e-mail controla a conta do GitHub (é nele que chegam os códigos de recuperação). A senha **não** deve ficar na cabeça de uma pessoa nem escrita neste repositório. Guarde-a num **gerenciador de senhas compartilhado do PET** (por exemplo, Bitwarden gratuito em modo "organização") ou, no mínimo, com o **tutor**. Anote ali também o telefone/e-mail de recuperação e atualize-os para algo do PET, não pessoal.
- [ ] **Segunda pessoa como dona do repositório.** Entre no GitHub com a conta do PET, vá em `Settings > Collaborators` do repositório e adicione a conta pessoal do tutor e a do novo responsável **com permissão Admin**. Assim, ninguém fica trancado do lado de fora se a conta do PET der problema.
- [ ] **(Recomendado) Organização no GitHub.** Em vez de uma conta de usuário, crie uma *organização* gratuita (por exemplo, `pet-ecv-ufsc`) e **transfira** o repositório para ela (`Settings > General > Transfer`). Várias pessoas podem ser donas. **Atenção:** o endereço do site muda (passa a ser `pet-ecv-ufsc.github.io/...`) e **os alunos perdem os dados salvos no navegador**, porque cada endereço tem o seu armazenamento. Se for fazer, faça uma vez só, e avise os alunos para **Exportar (.json)** antes. Veja a seção 6 para um endereço que nunca muda.
- [ ] **Duas etapas (2FA) do GitHub.** Ligue (obrigatório para contas que publicam). Guarde os **códigos de recuperação** impressos com o tutor ou no gerenciador de senhas.
- [ ] **Backup completo no Drive** (seção 3).
- [ ] **Quem recebe os avisos da Coordenação.** Os pré-requisitos mudam por comunicado da Coordenação (foi assim com ECV2501, ECV2505, ECV2704 e ECV2932). Combine **quem** do PET lê esses comunicados e **quem** os transforma em atualização. Anote essa pessoa na ata do PET.
- [ ] **Teste da passagem:** a pessoa nova abre o site, faz uma mudança pequena de texto (seção 4.1) e publica, **com você olhando**. Se ela consegue, a passagem funcionou.

## 3. Backup no Drive (faça agora e repita a cada atualização grande)

O GitHub guarda a parte pública. Mas **o projeto completo** (com `referencias/` e `projeto/docs/engenharia-reversa/`) existe só no computador de quem criou. Se o computador quebrar, isso se perde. Faça uma cópia:

1. No Drive do PET, crie a pasta `Currículo Interativo — backup` com acesso **restrito ao PET** (não pública: o material do programa antigo não deve ficar aberto).
2. Compacte a pasta `reconstrucao-curriculo-interativo` **sem** as pastas `node_modules` e `dist` (são recriadas sozinhas) e envie o `.zip`.
3. Envie também o arquivo de histórico do git. No terminal, dentro da pasta do projeto completo:

```bash
git bundle create curriculo-completo.bundle --all
```

4. Coloque dentro da pasta do Drive um arquivo `LEIA-ME.txt` dizendo: data do backup, o que é cada arquivo e **este guia**.
5. Marque uma lembrança anual (por exemplo, janeiro) para refazer o backup.

> **Regra de ouro:** nunca guarde senhas, chaves ou códigos de recuperação em arquivos do projeto, no GitHub ou numa planilha aberta do Drive.

## 4. Rotina: o que se faz de vez em quando

### 4.1 Mudar só um texto (sem programar)
Textos como "Sobre", "Ajuda" e o rodapé ficam em `projeto/src/app/componentes/Textos.tsx` e `projeto/src/app/App.tsx`. Para uma mudança pequena:
1. Entre no repositório no GitHub (conta do PET).
2. Abra o arquivo, clique no lápis ("Edit"), altere **só o texto entre as marcas**, e clique em "Commit changes".
3. O GitHub **testa e publica sozinho** em cerca de 1 minuto (aba **Actions** do repositório). Se ficar vermelho, **o site antigo continua no ar** e nada quebra; veja o erro na aba e peça ajuda (seção 5).
4. A data "Última atualização" no topo muda sozinha a cada publicação.

### 4.2 A Coordenação mudou um pré-requisito
Peça a um agente de IA (veja a seção 5) com este pedido, colando o comunicado:

> *"Leia `projeto/docs/guia-para-agentes-novo-curso.md` e `projeto/docs/regras-de-negocio.md`. A Coordenação enviou este comunicado: [colar]. Atualize os pré-requisitos, respeitando a data de vigência, com testes e documentação, e rode `npm test` e `npm run build`."*

O que o agente deve fazer: alterar `src/dominio/curriculos/versoes.ts` (ou o JSON do currículo), manter a versão antiga até a data de vigência, atualizar os testes, o `ACOMPANHAMENTO.md` e as regras. **Você** confere o texto na tela e publica.

### 4.3 Saiu um currículo novo (outro PDF)
É um trabalho maior: o currículo novo vira um arquivo JSON novo. O guia `guia-para-agentes-novo-curso.md` explica como transcrever um PDF para o JSON, **sem inventar regra**, e como validar. Resumo do caminho: obter o PDF oficial → agente transcreve → `npm run validar-curriculos` aponta o que não fecha → a Coordenação confirma as dúvidas → testes → publicar. **Nunca** publique um currículo que a Coordenação não conferiu.

### 4.4 Datas combinadas que já estão no código
Estas datas foram decididas e estão no código; confirme-as com a Coordenação e **limpe** o que ficar sem uso:
- **1º de novembro de 2027:** a versão de regras "2020.1" deixa de ser oferecida (constante `DATA_FIM_VERSAO_2020_1` em `src/dominio/curriculos/versoes.ts`). A data é **aproximada**: se a Coordenação disser outra, mude só essa linha.
- **2028.1:** entram em vigor os novos pré-requisitos (ECV2501, ECV2505, ECV2704, ECV2932). Depois que 2028.1 começar e a versão antiga não for mais necessária, peça a um agente para **remover** o seletor de versão e as regras antigas (código morto), mantendo os testes.
- **Todo ano (janeiro e julho):** conferir se o "próximo semestre" sugerido no planejamento faz sentido para o calendário da UFSC.

### 4.5 Manutenção de segurança (1 a 2 vezes por ano)
Peça a um agente: *"Rode `npm audit` e `npm outdated` em `projeto/`, atualize as dependências com cuidado e rode `npm test` e `npm run build`."* O site não tem servidor nem login nem dados de aluno, então o risco é baixo; ainda assim, bibliotecas ficam velhas.

## 5. Como pedir ajuda a um agente de IA (sem saber programar)

1. Instale o **Node.js** (versão LTS) e o **Git** no computador (instaladores oficiais).
2. Use um agente de código (por exemplo, o **Claude Code**) abrindo a **pasta do projeto completo** (a cópia do Drive, descompactada).
3. Primeira mensagem, sempre: *"Leia `CLAUDE.md`, `projeto/README.md` e `projeto/docs/ACOMPANHAMENTO.md` e me diga em que pé está o projeto."*
4. Regras que o agente já conhece pelo `CLAUDE.md`: `referencias/` é só leitura; não inventar regra acadêmica; dados de exemplo sempre identificados; nada é "pronto" sem testes passando.
5. Peça **uma coisa por vez** e exija: *"rode os testes e o build e me mostre o resultado antes de eu publicar"*.

Comandos úteis (dentro da pasta `projeto/`), caso você queira rodar sozinho:

| Para quê | Comando |
|---|---|
| Instalar as peças (1ª vez) | `npm install` |
| Ver o site no seu computador | `npm run dev` (abre em `http://localhost:5173`) |
| Rodar todos os testes | `npm test` |
| Conferir os dados do currículo | `npm run validar-curriculos` |
| Gerar a versão final | `npm run build` |
| Preparar a pasta pública para o GitHub | `node scripts/exportar-publicacao.mjs --atualizar` |

### Publicar uma mudança (passo a passo)
1. O agente faz a mudança e roda `npm test` e `npm run build` (ambos devem passar).
2. Rode `node scripts/exportar-publicacao.mjs --atualizar` (dentro de `projeto/`). Isso copia o que é público para a pasta `curriculo-interativo-publicacao` (ao lado da pasta do projeto) e cria um commit assinado pelo PET.
3. Abra um terminal **dentro dessa pasta** e rode `git push`. Uma janela do navegador pede o login do GitHub.
4. Acompanhe em `github.com/petecvufsc/curriculo-interativo/actions`. Verde = no ar. Abra o site com **Ctrl+F5** para ver a versão nova.
5. Anote o que foi feito em `projeto/docs/ACOMPANHAMENTO.md`.

## 6. O endereço do site e o servidor do PET

**Por que isto importa:** cada aluno guarda o plano **no próprio navegador**, ligado ao **endereço** do site. Se o endereço mudar, todos perdem o que salvaram. Escolha um endereço e **nunca mude**.

Opções, da mais simples à mais robusta:

1. **GitHub Pages (hoje).** Gratuito, sem manutenção. Contra: depende da conta do GitHub e o endereço tem o nome da conta.
2. **Endereço próprio apontando para o GitHub Pages** (por exemplo, `curriculo.petecv.ufsc.br`). Peça à SeTIC/UFSC (ou a quem administra o domínio do PET) um registro `CNAME` apontando para `petecvufsc.github.io`; depois, no repositório, `Settings > Pages > Custom domain`. O endereço fica estável mesmo que a conta mude.
3. **Hospedar no servidor do PET.** O site é só arquivos estáticos, então qualquer servidor web serve (Apache, Nginx, IIS). Passos:
   1. No computador: `npm run build` (dentro de `projeto/`). Isso gera a pasta `dist/`.
   2. Copie **todo o conteúdo** de `dist/` para a pasta pública do servidor (por exemplo, `/var/www/html/curriculo/`).
   3. Confira que `https://SEU-ENDERECO/curriculo/` abre. O site usa caminhos relativos, então funciona em qualquer subpasta.
   4. Para atualizar, repita 1 e 2 (apague o conteúdo antigo antes de copiar o novo).
   5. O servidor deve servir por **HTTPS** (necessário para o uso offline/instalável do site).
   6. **Atenção ao mudar de GitHub para o servidor:** o endereço muda e os alunos perdem os dados salvos. Avise com antecedência, peça para **Exportar (.json)** e, depois, **Importar** no endereço novo (o botão existe no painel).
4. **Drive:** serve para **guardar** os arquivos (backup e documentação), **não** para hospedar o site (o Google Drive não publica sites).

Recomendação: ficar no GitHub Pages e, se a UFSC permitir, pedir o `CNAME` institucional (opção 2). É o mesmo trabalho de manutenção e um endereço que sobrevive a trocas de equipe.

## 7. Se algo der errado

| Sintoma | O que fazer |
|---|---|
| O site abre em branco | Aguarde 2 minutos e atualize com Ctrl+F5. Se persistir, veja a aba **Actions** do GitHub: se a última execução está vermelha, o site antigo ainda deve estar no ar; abra o erro. |
| **Actions** ficou vermelho em `npm test` | Alguma mudança quebrou uma regra. O site antigo continua no ar. O texto do erro diz qual teste; peça a um agente para corrigir. |
| `git push` pede senha e recusa | Use a janela de login do navegador (Git Credential Manager) ou crie um token em `GitHub > Settings > Developer settings > Personal access tokens`. **Não** coloque o token em arquivos do projeto. |
| Perdi o acesso à conta do GitHub | Use os códigos de recuperação (seção 2). Se perdeu também o e-mail, a segunda pessoa com acesso Admin (seção 2) ainda consegue gerenciar o repositório. |
| O link sumiu do site do PET | Em `petecv.ufsc.br/wp-admin` > TablePress > tabela `14` (Currículo Interativo): a linha "Currículo Interativo Atualizado" deve apontar para o endereço do site. Se o WordPress remover o link, use o editor "Código" e cole `<a href="ENDEREÇO">Currículo Interativo</a>`. |
| Um aluno relata erro nos dados de uma disciplina | Compare com o PDF oficial do currículo; se o app estiver errado, abra o `ACOMPANHAMENTO.md`, registre e peça a correção a um agente com **testes**. Se for o PDF que está ambíguo, **pergunte à Coordenação**: nunca "corrija" regra acadêmica por conta própria. |
| Um aluno perdeu o plano | Os dados ficam só no navegador dele (limpar dados do navegador apaga). Oriente: usar **Exportar (.json)** de vez em quando e guardar o arquivo. Não há como recuperar do nosso lado, porque **não coletamos dados**. |

## 8. Privacidade e responsabilidade (o que **não** mudar)

- O site **não coleta, não envia e não armazena** dados de alunos em nenhum servidor. Tudo fica no navegador de cada um. **Não adicione** análise de acesso, formulários, login ou integrações que enviem dados sem antes conversar com a UFSC (LGPD) e atualizar a ajuda do site.
- O site diz que "pode conter erros" e manda **conferir no CAGR**. Mantenha isso.
- Os dados dos currículos vêm do **PDF oficial**; as exceções (como os novos pré-requisitos) vêm de **comunicados oficiais** e estão registradas no `ACOMPANHAMENTO.md` com a origem. Mantenha a origem sempre registrada.
- Licença: o repositório está **sem licença** (todos os direitos reservados). Se o PET quiser que outros cursos reutilizem o código, é preciso **escolher uma licença** com a UFSC (a MIT é a mais comum).

## 9. Lista de documentos (para quem quiser ir fundo)

| Documento | Para quê |
|---|---|
| `projeto/README.md` | visão geral e comandos |
| `projeto/docs/ACOMPANHAMENTO.md` | o que foi feito, decisões (D1 a D5), pendências, uso de modelos de IA |
| `projeto/docs/regras-de-negocio.md` | todas as regras do motor e do planejamento, com a origem de cada uma |
| `projeto/docs/modelo-de-dados.md` | como um currículo é descrito em JSON |
| `projeto/docs/publicacao.md` | publicar no GitHub Pages e no WordPress, passo a passo |
| `projeto/docs/acessibilidade.md` e `interface.md` | decisões de interface e acessibilidade |
| `projeto/docs/guia-para-agentes-novo-curso.md` | como montar a ferramenta para **outro curso** |
| `projeto/docs/relatorio-cacador-de-bugs.md` | último relatório de tentativas de quebrar a ferramenta |
| `projeto/docs/01-auditoria-e-diagnostico.md` | como era o programa antigo |
