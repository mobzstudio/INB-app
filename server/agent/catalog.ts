export type MarkerSeed = {
  id: string
  name: string
  unit: string
  scale: [number, number]
  ideal: [number, number]
  limit: [number, number]
  value: number
  previous: number
  why: string
  goals?: string[]
  conditions?: string[]
}

export const GOAL_LABEL: Record<string, string> = {
  emagrecimento: 'emagrecimento',
  massa: 'ganho de massa',
  energia: 'mais energia',
  sono: 'sono e recuperação',
  hormonal: 'saúde hormonal',
  esporte: 'performance esportiva',
  preventivo: 'prevenção',
}

export const CONDITION_LABEL: Record<string, string> = {
  hipertensao: 'hipertensão',
  diabetes: 'diabetes',
  dislipidemia: 'dislipidemia',
  hipotireoidismo: 'hipotireoidismo',
  sop: 'síndrome do ovário policístico',
  outra: 'outra condição',
}

export const ACTIVITY_LABEL: Record<string, string> = {
  sedentario: 'sedentário',
  leve: 'levemente ativo',
  moderado: 'moderadamente ativo',
  muito: 'muito ativo',
  extremo: 'extremamente ativo',
}

export const seeds: MarkerSeed[] = [
  { id: 'cortisol', name: 'Cortisol', unit: 'μg/dL', scale: [5, 25], ideal: [6, 11], limit: [5, 13], value: 14, previous: 11.2, why: 'O cortisol é o hormônio do alerta. Quando passa da faixa, costuma acompanhar cansaço, sono ruim e mais dificuldade para controlar o peso.', goals: ['emagrecimento', 'energia', 'sono'], conditions: [] },
  { id: 'tsh', name: 'TSH', unit: 'mUI/L', scale: [0, 10], ideal: [0.4, 2.5], limit: [0.4, 4.5], value: 6.8, previous: 5.4, why: 'O TSH mostra o quanto a tireoide está sendo cobrada. Acima da faixa, o corpo pode desacelerar: menos energia, mais frio e metabolismo mais lento.', goals: ['energia', 'emagrecimento'], conditions: ['hipotireoidismo'] },
  { id: 'ldl', name: 'LDL', unit: 'mg/dL', scale: [40, 220], ideal: [0, 100], limit: [0, 130], value: 168, previous: 151, why: 'O LDL é a fração do colesterol que, em excesso, se acumula na parede dos vasos. É um dos marcadores que a prevenção cardiovascular acompanha de perto.', goals: ['preventivo'], conditions: ['dislipidemia', 'hipertensao'] },
  { id: 'vitamina-d', name: 'Vitamina D', unit: 'ng/mL', scale: [5, 80], ideal: [30, 60], limit: [20, 80], value: 18, previous: 21, why: 'A vitamina D participa de imunidade, humor e disposição. Abaixo da faixa, a queixa mais comum é falta de energia.', goals: ['energia', 'preventivo'], conditions: [] },
  { id: 'ferritina', name: 'Ferritina', unit: 'ng/mL', scale: [0, 250], ideal: [40, 150], limit: [15, 200], value: 12, previous: 16, why: 'A ferritina é a reserva de ferro. Quando cai, o sangue leva menos oxigênio e a energia baixa, mesmo com hemoglobina ainda estável.', goals: ['energia', 'esporte'], conditions: [] },
  { id: 'insulina', name: 'Insulina', unit: 'μUI/mL', scale: [0, 40], ideal: [2, 8], limit: [2, 18], value: 28, previous: 16, why: 'A insulina em jejum alta sugere que o corpo está precisando de mais hormônio para guardar açúcar. Isso pesa no emagrecimento e no apetite.', goals: ['emagrecimento', 'preventivo'], conditions: ['diabetes'] },
  { id: 'pcr', name: 'PCR ultrassensível', unit: 'mg/L', scale: [0, 12], ideal: [0, 1], limit: [0, 3], value: 8.4, previous: 3.6, why: 'A PCR ultrassensível mede inflamação silenciosa. Fora da faixa, o corpo está em alerta mesmo sem uma infecção aparente.', goals: ['preventivo', 'energia'], conditions: [] },
  { id: 'homocisteina', name: 'Homocisteína', unit: 'μmol/L', scale: [3, 30], ideal: [5, 10], limit: [5, 15], value: 18, previous: 13, why: 'A homocisteína alta se associa a mais desgaste dos vasos. É um marcador de prevenção, não um diagnóstico sozinho.', goals: ['preventivo'], conditions: ['hipertensao'] },
  { id: 'hba1c', name: 'Hemoglobina glicada', unit: '%', scale: [4, 10], ideal: [4, 5.6], limit: [4, 6], value: 6.8, previous: 6.3, why: 'A hemoglobina glicada resume a média de açúcar no sangue em cerca de três meses. Acima da faixa, o açúcar ficou alto por tempo longo.', goals: ['emagrecimento', 'preventivo'], conditions: ['diabetes'] },

  { id: 'glicemia', name: 'Glicemia de jejum', unit: 'mg/dL', scale: [60, 180], ideal: [70, 99], limit: [70, 125], value: 108, previous: 96, why: 'A glicemia de jejum é o açúcar do momento. Entre a faixa ideal e o limite, ela pede atenção antes de virar um problema maior.', goals: ['emagrecimento', 'preventivo'], conditions: ['diabetes'] },
  { id: 'triglicerides', name: 'Triglicerídeos', unit: 'mg/dL', scale: [40, 300], ideal: [0, 150], limit: [0, 200], value: 168, previous: 190, why: 'Os triglicerídeos sobem com excesso de açúcar e de energia guardada. Ainda dentro do limite largo, mas acima do ideal.', goals: ['emagrecimento', 'preventivo'], conditions: ['dislipidemia'] },
  { id: 'hdl', name: 'HDL', unit: 'mg/dL', scale: [20, 100], ideal: [50, 90], limit: [40, 100], value: 42, previous: 38, why: 'O HDL ajuda a recolher colesterol dos vasos. Abaixo do ideal, a proteção fica mais fina.', goals: ['preventivo'], conditions: ['dislipidemia'] },
  { id: 'colesterol-total', name: 'Colesterol total', unit: 'mg/dL', scale: [100, 300], ideal: [0, 190], limit: [0, 240], value: 214, previous: 206, why: 'O colesterol total junta as frações. Sozinho diz pouco, mas acima do ideal combina com o LDL para a leitura de prevenção.', goals: ['preventivo'], conditions: ['dislipidemia'] },
  { id: 't4', name: 'T4 livre', unit: 'ng/dL', scale: [0.4, 2.5], ideal: [0.9, 1.7], limit: [0.7, 1.8], value: 0.78, previous: 0.74, why: 'O T4 livre é o hormônio que a tireoide entrega. Perto do limite de baixo, combina com um TSH alto.', goals: ['energia'], conditions: ['hipotireoidismo'] },
  { id: 't3', name: 'T3 livre', unit: 'pg/mL', scale: [1.5, 5], ideal: [2.3, 4.2], limit: [2, 4.4], value: 2.1, previous: 2.05, why: 'O T3 livre é a forma mais ativa do hormônio da tireoide. Um pouco abaixo do ideal reduz disposição.', goals: ['energia'], conditions: ['hipotireoidismo'] },
  { id: 'b12', name: 'Vitamina B12', unit: 'pg/mL', scale: [100, 1200], ideal: [400, 900], limit: [200, 1100], value: 240, previous: 190, why: 'A B12 cuida de energia e de sistema nervoso. Abaixo do ideal, o cansaço aparece antes da anemia.', goals: ['energia'], conditions: [] },
  { id: 'folato', name: 'Folato', unit: 'ng/mL', scale: [1, 25], ideal: [6, 20], limit: [3, 20], value: 4.4, previous: 5.1, why: 'O folato trabalha com a B12 na produção de células. Abaixo do ideal, a homocisteína tende a subir.', goals: ['preventivo', 'energia'], conditions: [] },
  { id: 'magnesio', name: 'Magnésio', unit: 'mg/dL', scale: [1, 3], ideal: [1.8, 2.4], limit: [1.5, 2.6], value: 1.62, previous: 1.7, why: 'O magnésio participa de sono, músculo e pressão. Um pouco abaixo do ideal já muda a recuperação.', goals: ['sono', 'esporte'], conditions: ['hipertensao'] },
  { id: 'zinco', name: 'Zinco', unit: 'μg/dL', scale: [40, 160], ideal: [80, 120], limit: [60, 140], value: 66, previous: 72, why: 'O zinco entra em imunidade e em hormônios. Abaixo do ideal, a cicatrização e a disposição pioram.', goals: ['energia', 'hormonal'], conditions: [] },
  { id: 'ferro', name: 'Ferro sérico', unit: 'μg/dL', scale: [20, 220], ideal: [70, 170], limit: [50, 190], value: 58, previous: 64, why: 'O ferro sérico é o ferro circulando agora. Junto com a ferritina baixa, explica falta de fôlego.', goals: ['energia', 'esporte'], conditions: [] },
  { id: 'saturacao', name: 'Saturação de transferrina', unit: '%', scale: [5, 60], ideal: [25, 45], limit: [15, 50], value: 18, previous: 22, why: 'A saturação mostra quanto do transportador de ferro está ocupado. Baixa, confirma que a reserva está curta.', goals: ['energia'], conditions: [] },
  { id: 'acido-urico', name: 'Ácido úrico', unit: 'mg/dL', scale: [2, 10], ideal: [3.5, 6], limit: [3, 7.2], value: 6.8, previous: 6.3, why: 'O ácido úrico acima do ideal irrita articulações e também entra na conta de risco metabólico.', goals: ['preventivo'], conditions: [] },
  { id: 'creatinina', name: 'Creatinina', unit: 'mg/dL', scale: [0.4, 2], ideal: [0.7, 1.1], limit: [0.6, 1.3], value: 1.22, previous: 1.08, why: 'A creatinina ajuda a ler o rim. Acima do ideal, vale olhar junto com a filtração, sem concluir lesão só por este número.', goals: ['preventivo'], conditions: ['hipertensao'] },
  { id: 'ureia', name: 'Ureia', unit: 'mg/dL', scale: [5, 80], ideal: [15, 40], limit: [10, 50], value: 46, previous: 42, why: 'A ureia sobe com desidratação ou com mais carga sobre o rim. Ainda no limite, mas acima do ideal.', goals: ['preventivo'], conditions: [] },
  { id: 'ggt', name: 'GGT', unit: 'U/L', scale: [0, 120], ideal: [0, 38], limit: [0, 73], value: 58, previous: 70, why: 'A GGT é uma enzima do fígado e das vias biliares. Acima do ideal, o fígado está trabalhando mais do que o desejável.', goals: ['preventivo'], conditions: [] },
  { id: 'tgo', name: 'TGO', unit: 'U/L', scale: [0, 80], ideal: [0, 32], limit: [0, 45], value: 39, previous: 30, why: 'A TGO aparece quando células do fígado ou do músculo liberam enzima. Um pouco acima do ideal pede contexto, não alarde.', goals: ['preventivo', 'esporte'], conditions: [] },
  { id: 'tgp', name: 'TGP', unit: 'U/L', scale: [0, 80], ideal: [0, 33], limit: [0, 48], value: 40, previous: 36, why: 'A TGP é mais específica do fígado. Acima do ideal, combina com a leitura de gordura hepática e de metabolismo.', goals: ['emagrecimento', 'preventivo'], conditions: [] },
  { id: 'plaquetas', name: 'Plaquetas', unit: 'mil/mm³', scale: [50, 500], ideal: [150, 400], limit: [130, 450], value: 141, previous: 136, why: 'As plaquetas participam da coagulação. Um pouco abaixo do ideal ainda está no limite, e a tendência importa mais que um ponto isolado.', goals: ['preventivo'], conditions: [] },
  { id: 'homa', name: 'HOMA-IR', unit: 'índice', scale: [0, 6], ideal: [0, 2], limit: [0, 2.7], value: 2.4, previous: 2.1, why: 'O HOMA-IR estima resistência à insulina. Acima do ideal, o corpo está forçando o hormônio para manter o açúcar.', goals: ['emagrecimento', 'preventivo'], conditions: ['diabetes'] },
  { id: 'peptideo-c', name: 'Peptídeo C', unit: 'ng/mL', scale: [0.5, 6], ideal: [0.8, 3], limit: [0.5, 4], value: 3.6, previous: 3.2, why: 'O peptídeo C mostra quanto de insulina o pâncreas está produzindo. Acima do ideal, a produção está alta.', goals: ['emagrecimento'], conditions: ['diabetes'] },

  { id: 'hemoglobina', name: 'Hemoglobina', unit: 'g/dL', scale: [8, 20], ideal: [13.5, 17], limit: [12, 18], value: 15.2, previous: 12.4, why: 'A hemoglobina carrega oxigênio. Na faixa ideal, o cansaço deixa de ser explicado por anemia.', goals: ['energia', 'esporte'], conditions: [] },
  { id: 'hematocrito', name: 'Hematócrito', unit: '%', scale: [25, 60], ideal: [40, 50], limit: [36, 52], value: 45, previous: 44, why: 'O hematócrito é a parcela de células vermelhas no sangue. Na faixa, a capacidade de levar oxigênio está preservada.', goals: ['esporte'], conditions: [] },
  { id: 'leucocitos', name: 'Leucócitos', unit: '/mm³', scale: [2000, 15000], ideal: [4000, 10000], limit: [3500, 11000], value: 6800, previous: 7100, why: 'Os leucócitos são as células de defesa. Na faixa ideal, não há sinal de infecção ou de baixa imunidade neste exame.', goals: ['preventivo'], conditions: [] },
  { id: 'neutrofilos', name: 'Neutrófilos', unit: '/mm³', scale: [500, 10000], ideal: [1800, 7000], limit: [1500, 8000], value: 3800, previous: 3600, why: 'Os neutrófilos são a primeira linha contra bactérias. Na faixa, essa defesa está presente.', goals: ['preventivo'], conditions: [] },
  { id: 'linfocitos', name: 'Linfócitos', unit: '/mm³', scale: [400, 6000], ideal: [1000, 3500], limit: [800, 4000], value: 2100, previous: 1900, why: 'Os linfócitos cuidam de vírus e de memória imune. Na faixa, não há desvio neste exame.', goals: ['preventivo'], conditions: [] },
  { id: 'vcm', name: 'VCM', unit: 'fL', scale: [60, 120], ideal: [82, 96], limit: [80, 100], value: 88, previous: 87, why: 'O VCM mede o tamanho da célula vermelha. Na faixa, a anemia por falta de B12 ou de ferro não é o padrão atual.', goals: ['energia'], conditions: [] },
  { id: 'hcm', name: 'HCM', unit: 'pg', scale: [18, 42], ideal: [27, 33], limit: [26, 34], value: 30, previous: 29, why: 'O HCM é a quantidade de hemoglobina em cada célula. Na faixa, a cor do sangue está adequada.', goals: ['energia'], conditions: [] },
  { id: 'rdw', name: 'RDW', unit: '%', scale: [8, 22], ideal: [11, 14], limit: [11, 15.5], value: 12.8, previous: 13.1, why: 'O RDW mostra se as células vermelhas têm tamanhos parecidos. Na faixa, a produção está uniforme.', goals: ['energia'], conditions: [] },
  { id: 'eosinofilos', name: 'Eosinófilos', unit: '/mm³', scale: [0, 800], ideal: [50, 400], limit: [0, 500], value: 180, previous: 160, why: 'Os eosinófilos sobem em alergia e em alguns parasitas. Na faixa, não há esse sinal agora.', goals: ['preventivo'], conditions: [] },
  { id: 'monocitos', name: 'Monócitos', unit: '/mm³', scale: [0, 1500], ideal: [200, 800], limit: [100, 1000], value: 420, previous: 400, why: 'Os monócitos limpam tecido e inflamação. Na faixa, esse braço da defesa está calmo.', goals: ['preventivo'], conditions: [] },
  { id: 'basofilos', name: 'Basófilos', unit: '/mm³', scale: [0, 300], ideal: [0, 100], limit: [0, 200], value: 30, previous: 40, why: 'Os basófilos participam de alergia. Na faixa, não alteram a leitura.', goals: ['preventivo'], conditions: [] },
  { id: 'sodio', name: 'Sódio', unit: 'mEq/L', scale: [120, 160], ideal: [136, 145], limit: [132, 148], value: 140, previous: 139, why: 'O sódio equilibra água e pressão. Na faixa, a hidratação deste exame está estável.', goals: ['esporte'], conditions: ['hipertensao'] },
  { id: 'potassio', name: 'Potássio', unit: 'mEq/L', scale: [2.5, 6.5], ideal: [3.6, 5], limit: [3.4, 5.2], value: 4.2, previous: 4.4, why: 'O potássio regula músculo e ritmo do coração. Na faixa, não explica cãibra nem arritmia por este exame.', goals: ['esporte'], conditions: ['hipertensao'] },
  { id: 'calcio', name: 'Cálcio', unit: 'mg/dL', scale: [7, 12], ideal: [8.8, 10.2], limit: [8.5, 10.5], value: 9.4, previous: 9.2, why: 'O cálcio entra em osso, músculo e nervo. Na faixa, a calcemia não é o problema atual.', goals: ['esporte', 'preventivo'], conditions: [] },
  { id: 'fosforo', name: 'Fósforo', unit: 'mg/dL', scale: [1, 6], ideal: [2.5, 4.5], limit: [2.3, 4.8], value: 3.4, previous: 3.2, why: 'O fósforo trabalha com o cálcio no osso e na energia celular. Na faixa, o equilíbrio está preservado.', goals: ['energia'], conditions: [] },
  { id: 'albumina', name: 'Albumina', unit: 'g/dL', scale: [2, 6], ideal: [3.8, 5], limit: [3.5, 5.2], value: 4.5, previous: 4.3, why: 'A albumina reflete proteína e função do fígado. Na faixa, a nutrição proteica deste exame está boa.', goals: ['massa'], conditions: [] },
  { id: 'proteinas', name: 'Proteínas totais', unit: 'g/dL', scale: [4, 10], ideal: [6.4, 8.2], limit: [6, 8.5], value: 7.2, previous: 7, why: 'As proteínas totais juntam albumina e globulinas. Na faixa, não há falta nem excesso grosseiro.', goals: ['massa'], conditions: [] },
  { id: 'bilirrubina-total', name: 'Bilirrubina total', unit: 'mg/dL', scale: [0, 3], ideal: [0.2, 1], limit: [0.1, 1.2], value: 0.7, previous: 0.8, why: 'A bilirrubina vem do processamento do sangue pelo fígado. Na faixa, não há sinal de acúmulo.', goals: ['preventivo'], conditions: [] },
  { id: 'bilirrubina-direta', name: 'Bilirrubina direta', unit: 'mg/dL', scale: [0, 1], ideal: [0, 0.3], limit: [0, 0.4], value: 0.2, previous: 0.18, why: 'A bilirrubina direta é a fração já processada. Na faixa, a via biliar não aparece obstruída neste exame.', goals: ['preventivo'], conditions: [] },
  { id: 'fosfatase', name: 'Fosfatase alcalina', unit: 'U/L', scale: [10, 250], ideal: [40, 120], limit: [30, 150], value: 72, previous: 80, why: 'A fosfatase alcalina aparece em fígado e osso. Na faixa, não sugere obstrução nem desgaste ósseo agudo.', goals: ['preventivo'], conditions: [] },
  { id: 'amilase', name: 'Amilase', unit: 'U/L', scale: [10, 200], ideal: [30, 110], limit: [20, 130], value: 68, previous: 74, why: 'A amilase é uma enzima do pâncreas e da saliva. Na faixa, não há sinal de irritação pancreática.', goals: ['preventivo'], conditions: [] },
  { id: 'lipase', name: 'Lipase', unit: 'U/L', scale: [0, 150], ideal: [0, 60], limit: [0, 80], value: 32, previous: 40, why: 'A lipase é mais específica do pâncreas. Na faixa, este exame não aponta pancreatite.', goals: ['preventivo'], conditions: [] },
  { id: 'ck', name: 'CK', unit: 'U/L', scale: [10, 400], ideal: [30, 200], limit: [20, 250], value: 110, previous: 240, why: 'A CK sobe quando o músculo foi exigido ou lesionado. Voltar para a faixa é um sinal de recuperação.', goals: ['esporte', 'massa'], conditions: [] },
  { id: 'ldh', name: 'LDH', unit: 'U/L', scale: [50, 400], ideal: [120, 220], limit: [100, 250], value: 160, previous: 170, why: 'A LDH aparece em várias células quando há desgaste. Na faixa, não há destruição celular relevante neste exame.', goals: ['preventivo'], conditions: [] },
  { id: 'b6', name: 'Vitamina B6', unit: 'μg/L', scale: [2, 50], ideal: [8, 25], limit: [5, 40], value: 18, previous: 16, why: 'A B6 participa de humor, sono e homocisteína. Na faixa, essa vitamina não é o gargalo.', goals: ['sono', 'energia'], conditions: [] },
  { id: 'vitamina-c', name: 'Vitamina C', unit: 'mg/dL', scale: [0, 3], ideal: [0.4, 1.5], limit: [0.2, 2], value: 1.1, previous: 0.9, why: 'A vitamina C é antioxidante e ajuda na imunidade. Na faixa, a ingestão recente parece suficiente.', goals: ['preventivo'], conditions: [] },
  { id: 'vitamina-e', name: 'Vitamina E', unit: 'mg/L', scale: [2, 30], ideal: [5, 18], limit: [4, 20], value: 12, previous: 11, why: 'A vitamina E protege membranas da oxidação. Na faixa, não há déficit neste exame.', goals: ['preventivo'], conditions: [] },
  { id: 'omega', name: 'Índice ômega-3', unit: '%', scale: [2, 16], ideal: [8, 12], limit: [4, 14], value: 8.2, previous: 5.5, why: 'O índice de ômega-3 reflete gordura anti-inflamatória nas células. Entrar na faixa é uma evolução favorável para o coração.', goals: ['preventivo'], conditions: ['hipertensao'] },
  { id: 'apob', name: 'ApoB', unit: 'mg/dL', scale: [30, 180], ideal: [40, 90], limit: [40, 120], value: 78, previous: 96, why: 'A ApoB conta as partículas que carregam colesterol para os vasos. Na faixa, essa conta está controlada, mesmo com o LDL ainda alto.', goals: ['preventivo'], conditions: ['dislipidemia'] },
  { id: 'lpa', name: 'Lp(a)', unit: 'nmol/L', scale: [0, 150], ideal: [0, 30], limit: [0, 75], value: 18, previous: 19, why: 'A Lp(a) é um colesterol herdado. Na faixa baixa, ela não soma risco extra neste exame.', goals: ['preventivo'], conditions: [] },
  { id: 'fibrinogenio', name: 'Fibrinogênio', unit: 'mg/dL', scale: [80, 600], ideal: [200, 400], limit: [150, 450], value: 280, previous: 300, why: 'O fibrinogênio participa da coagulação e sobe com inflamação. Na faixa, não há excesso.', goals: ['preventivo'], conditions: [] },
  { id: 'dheas', name: 'DHEA-S', unit: 'μg/dL', scale: [20, 600], ideal: [80, 350], limit: [50, 450], value: 220, previous: 200, why: 'O DHEA-S é um precursor hormonal da adrenal. Na faixa, não explica sozinho cansaço ou queda de hormônio.', goals: ['hormonal', 'energia'], conditions: [] },
  { id: 'igf', name: 'IGF-1', unit: 'ng/mL', scale: [40, 400], ideal: [100, 250], limit: [80, 300], value: 180, previous: 150, why: 'O IGF-1 acompanha o eixo do crescimento e da recuperação. Na faixa, a sinalização de reparo está presente.', goals: ['massa', 'esporte'], conditions: [] },
  { id: 'testosterona', name: 'Testosterona total', unit: 'ng/dL', scale: [50, 1400], ideal: [400, 900], limit: [250, 1100], value: 620, previous: 480, why: 'A testosterona total participa de massa, energia e libido. Na faixa, este eixo não é o limitante do exame.', goals: ['massa', 'hormonal', 'energia'], conditions: [] },
  { id: 'shbg', name: 'SHBG', unit: 'nmol/L', scale: [5, 100], ideal: [15, 50], limit: [10, 70], value: 38, previous: 42, why: 'A SHBG transporta hormônios sexuais. Na faixa, a leitura da testosterona livre não fica distorcida por este carregador.', goals: ['hormonal'], conditions: ['sop'] },
  { id: 'prolactina', name: 'Prolactina', unit: 'ng/mL', scale: [1, 40], ideal: [4, 15], limit: [3, 20], value: 9, previous: 11, why: 'A prolactina alta pode bagunçar ciclo e libido. Na faixa, esse eixo está quieto.', goals: ['hormonal'], conditions: ['sop'] },
  { id: 'egfr', name: 'eGFR', unit: 'mL/min', scale: [20, 140], ideal: [90, 120], limit: [60, 130], value: 98, previous: 86, why: 'A filtração estimada resume como o rim limpa o sangue. Voltar para acima de 90 é uma evolução positiva.', goals: ['preventivo'], conditions: ['hipertensao'] },
  { id: 'clearance', name: 'Clearance de creatinina', unit: 'mL/min', scale: [20, 160], ideal: [90, 130], limit: [60, 140], value: 102, previous: 94, why: 'O clearance mede a limpeza real de creatinina. Na faixa, confirma a filtração estimada.', goals: ['preventivo'], conditions: ['hipertensao'] },
  { id: 'psa', name: 'PSA', unit: 'ng/mL', scale: [0, 10], ideal: [0, 2.5], limit: [0, 4], value: 1.1, previous: 1.3, why: 'O PSA é um marcador da próstata. Na faixa baixa, este exame não sugere acompanhamento urgente.', goals: ['preventivo'], conditions: [] },
]
