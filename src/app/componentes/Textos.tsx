import { Legenda } from './Legenda';

export function TextoAjuda() {
  return (
    <div className="texto-dialogo">
      <h3>Ver relações entre disciplinas</h3>
      <p>
        Clique no <strong>nome</strong> de uma disciplina para ver como ela se relaciona com as demais. A disciplina fica
        destacada e as outras ganham uma cor <em>e</em> uma etiqueta: pré-requisitos diretos e indiretos (o que você
        precisa cursar antes) e disciplinas que ela tranca diretamente ou indiretamente (o que depende dela). Relações
        marcadas como &quot;alternativa&quot; dependem de uma opção &quot;ou&quot; do pré-requisito. Clique de novo no
        mesmo nome, ou em &quot;Limpar destaques&quot;, para remover os destaques.
      </p>
      <Legenda />
      <h3>Marcar disciplinas cursadas</h3>
      <p>
        Use a caixa ao lado do nome para marcar uma disciplina como cursada. A marcação é automática em cascata: ao marcar
        uma disciplina de fase avançada, seus pré-requisitos também são marcados; ao desmarcar uma disciplina, as que
        dependem dela são desmarcadas.
      </p>
      <p>
        A caixa no topo de cada fase marca ou desmarca todas as disciplinas obrigatórias daquela fase. Ela aparece
        parcialmente preenchida quando só algumas estão marcadas.
      </p>
      <h3>Simular</h3>
      <p>
        O botão &quot;Simular&quot; destaca as disciplinas que você já pode cursar (todos os pré-requisitos cumpridos) e
        mostra os totais de horas-aula e créditos disponíveis e das disciplinas já cursadas. Ao selecionar uma disciplina,
        a simulação sai de cena, mas os totais continuam visíveis. <strong>h-a</strong> significa horas-aula;{' '}
        <strong>créditos</strong> são as aulas por semana de cada disciplina.
      </p>
      <h3>Integralização do curso</h3>
      <p>
        A barra no topo mostra quanto do curso você já integralizou: as horas-aula das disciplinas cursadas sobre o total
        exigido (4.518 h-a no currículo 2020.1, contando obrigatórias, estágio, projeto integrador e 432 h-a de optativas).
        Optativas além das 432 h-a não somam. Na aba Planejamento, a barra também mostra quanto você terá ao fim do plano.
      </p>
      <h3>Limpar</h3>
      <p>
        &quot;Limpar seleção&quot; apaga o status de todas as disciplinas (após confirmação) e mantém o plano. &quot;Limpar destaques&quot; remove apenas os
        destaques de cores, mantendo o que você marcou.
      </p>
      <h3>Situação no histórico</h3>
      <p>
        Ao selecionar uma disciplina, escolha em &quot;Situação no histórico&quot; se ela está <em>Não cursada</em>,{' '}
        <em>Aprovada</em>, <em>Cursando</em> ou <em>Reprovada</em>. Só &quot;Aprovada&quot; marca a caixa do cartão; as
        demais aparecem como etiqueta no cartão. A opção &quot;Considerar disciplinas em andamento como aprovadas&quot;
        decide se as disciplinas &quot;Cursando&quot; entram na simulação e no planejamento. Disciplinas do currículo
        anterior podem ser informadas pelo código na seção &quot;Disciplinas do currículo anterior&quot;.
      </p>
      <h3>Planejamento</h3>
      <p>
        Na aba &quot;Planejamento&quot;, monte os próximos semestres: adicione semestres, escolha disciplinas entre as
        que já podem ser cursadas naquele ponto do plano e veja, em cada semestre, o que falta, os créditos somados e os
        avisos de carga. O botão &quot;Sugerir&quot; preenche o semestre automaticamente por fase e por quantas
        disciplinas cada uma libera; é só uma ajuda, confira com a coordenação e o CAGR. A integralização projetada
        mostra o progresso ao fim do plano.
      </p>
      <h3>Salvar, exportar e importar</h3>
      <p>
        Seus dados ficam salvos só neste navegador. Para levá-los a outro dispositivo, use &quot;Exportar (.json)&quot; e,
        no outro aparelho, &quot;Importar&quot;. &quot;Limpar seleção&quot; apaga as marcações salvas e pede confirmação.
      </p>
      <h3>Uso sem internet</h3>
      <p>
        Depois da primeira visita, funciona sem internet e pode ser instalado no celular pelo menu do navegador.
      </p>
      <h3>Pré-requisitos com &quot;ou&quot;</h3>
      <p>
        Pré-requisitos com &quot;ou&quot; aceitam também códigos do currículo anterior (indicados como &quot;currículo
        anterior&quot; no detalhe da disciplina).
      </p>
      <h3>Fonte dos dados</h3>
      <p>
        Os dados vêm do PDF oficial do currículo 2020.1. Confira sempre no CAGR; esta ferramenta pode conter erros.
      </p>
    </div>
  );
}

export function TextoSobre() {
  return (
    <div className="texto-dialogo">
      <p>
        O currículo interativo do Curso de Engenharia Civil da UFSC foi desenvolvido pelos bolsistas do Programa de
        Educação Tutorial em Engenharia Civil (PET/ECV) com o objetivo de auxiliar os graduandos no que diz respeito à
        interdependência entre as disciplinas do curso.
      </p>
      <p>Esta versão web é uma reconstrução do programa original.</p>
      <p>Lembramos que este programa pode conter erros. Caso encontre algum, entre em contato:</p>
      <p>
        E-mail: petecv@contato.ufsc.br · Fone: (48) 3721-9940
        <br />
        Departamento de Engenharia Civil, Campus Reitor João David Ferreira Lima.
      </p>
    </div>
  );
}
