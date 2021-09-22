import { ContentTypeSupport } from './support'

export const content: ContentTypeSupport = {
  title: 'FAQ',
  navigation: [
    { title: 'Utilizando Oasis.app', id: 'using-oasis' },
    { title: 'Utilizando Oasis Multiply', id: 'using-multiply' },
    { title: 'Utilizando Dai Wallet', id: 'using-daiwallet' },
    { title: 'Segurança', id: 'security' },
    { title: 'Comprando Dai', id: 'buying-dai' },
  ],
  sections: [
    {
      title: 'Utilizando Oasis.app',
      id: 'using-oasis',
      questions: [
        {
          question: 'Quais ativos posso usar como colateral?',
          answer: `Você pode usar os colaterais que são aprovados pela Governança do Maker, incluindo ETH e BTC envelopado ('wrapped BTC'). Você pode ver cada um dos tipos entrando no oasis.app, podendo checar inclusive a Taxa de Estabilidade e Ratio Mínimo de Colateralização.`,
        },

        {
          question: 'Quanto custa?',
          answer: `Abrir e gerir um Cofre (Vault) é grátis no Oasis.app, exceto pelos custos com gás e Taxas de Estabilidade. A Taxa de Estabilidade é cobrada em cima da quantidade de Dai gerada e é destinada diretamente ao Protocolo Maker.`,
        },

        {
          question: 'Como eu abro um Cofre (Vault)',
          answer: `Para abrir um Cofre, selecione o colateral e seu sub-tipo (ex. ETH-A) na página inicial (oasis.app), connecte sua carteira escolhida e siga as instruções.`,
        },

        {
          question: 'O que é a Taxa de Estabilidade?',
          answer: `A Taxa de Estabilidade é a taxa anual varíavel (mostrada em porcentagem) adicionada a sua dívida - que deverá ser paga. Ela pode ser vista como o custo para gerar Dai, que é pago diretamente ao Protocolo Maker. Para ler mais sobre a Taxa de Estabilidade por favor cheque nossa [Central de Conhecimento](https://kb.oasis.app/help/the-stability-fee).`,
        },

        {
          question: 'Qual a diferença entre -A/-B/-C sub-tipos de Cofres?',
          answer: `Existem múltiplos tipos de Cofre para alguns colaterais. Cada tipo indicado pela letra tem seus próprios Ratios de Colateralização e Taxas de Estabilidade. Você pode escolher o tipo de Cofre que você preferir de acordo com suas necessidades e perfil de risco.`,
        },

        {
          question: 'O que é um Proxy? Por que eu preciso gerar um?',
          answer: `O Proxy é um contrato inteligente que facilita sua interação com protocolos, inclusive com o Maker. Ele auxilia na gestão do Cofre, geração de Dai, entre outros. Você precisa fazer isso apenas uma vez por carteira e todos os seus cofres serão geridos pelo Proxy. Por favor, nunca envie seus fundos diretamente para o endereço do Proxy.`,
        },

        {
          question: 'Por que eu preciso aprovar tokens? O que é a permissão ("allowance")?',
          answer: `As permissões de tokens permitem você controlar quanto o contrato Proxy pode interagir em relação ao balanço de sua carteira. Isso permite que o Contrato Proxy pague Dai ou interaja com os colaterais em sua carteira. Você precisará autorizar a permissão ("allowance") para cada token que deseja utilizar no Oasis.app. Você pode configurar sua permisão ("allowance") para a quantia que você deseja usar cada vez ou para um valor maior, já pensando em futuras interações com Oasis.app. Isso será apresentado para você dentro dos fluxos do Oasis.app e você não terá que realizar ação alguma se você não encontrar avisos neste sentido.`,
        },

        {
          question: 'O que é o Ratio de Liquidação?',
          answer: `O Ratio de Liquidação é o Ratio Mínimo de Colateralização que você precisa manter para evitar que seu Cofre seja liquidado. Se seu Cofre for abaixo do Ratio Mínimo de Colateralização, seu Cofre pode ser liquidado e seu colateral vendido para pagar a dívida. Para entender mais sobre o [Ratio de Colateralização](https://kb.oasis.app/help/collateralization-ratio) e [liquidações](https://kb.oasis.app/help/liquidations), entre neste links da nossa Central de Conhecimento.`,
        },

        {
          question: 'O que é o Preço de Liquidação?',
          answer: `O Preço de Liquidação é o preço no qual seu Cofre estará em risco de liquidação baseado no 'Preço Atual' do Módulo de Segurança do Protocolo Maker. É um indicador útil para você descobrir se pode ser liquidado. Por favor, note que se o seu Cofre tiver uma Taxa de Estabilidade positiva (>0), seu preço de liquidação continuará aumentando, já que mais dívida é adicionada ao seu Cofre. Você pode ler mais sobre Liquidação [aqui] (https://kb.oasis.app/help/liquidations).`,
        },

        {
          question: 'O que é Penalidade de Liquidação?',
          answer: `A Penalidade de Liquidação é a quantia adicionada a sua dívida quando seu Cofre é liquidado. Cada colateral e sub-tipo (ex. ETH-A e ETH-B) podem ter suas próprias características de penalidades, determinadas pela Governança Maker. Essa penalidade também é paga diretamente ao Protocolo Maker e Oasis.app não cobra taxas adicionais em casos de liquidação.`,
        },

        {
          question: 'O que é a Dívida Mínima do Cofre?',
          answer: `A Dívida Mínima do Cofre, também chamada de pó (dust), é a quantia mínima de Dai que você precisa para abrir e manter um novo Cofre. Essa Dívida Mínima do Cofre é determinada pela Governança Maker e pode ser ajustada a qualquer momento. Se o mínimo for aumentado para um valor acima da sua dívida atual, você irá experenciar funcionalidade reduzida do seu Cofre até que você aumente sua dívida acima do mínimo novamente. Para ler mais sobre a Dívida Mínima do Cofre, acesse [aqui] (https://kb.oasis.app/help/minimum-vault-debt-dust).`,
        },

        {
          question: 'O que é o próximo preço e como você sabe?',
          answer: `Dentro do Protocolo Maker, sempre existem 2 preços para o colateral; o preço atual e o próximo preço. Para proteger o sistema e usuários de ‘agentes maliciosos’ e quedas repentinas (flash crashes), o Protocolo Maker usa o 'Módulo de Segurança'. Isso significa que todos os preços utilizados pelo sistema são atrasados em uma hora e apenas atualizados uma vez por hora - aproximadamente no arredondar da hora. O próximo preço é o preço que entrará no sistema como 'Preço Atual'. É o Preço Atual que seu Cofre utiliza como referência, podendo apenas ser liquidado se o 'Preço Atual' estiver abaixo do seu 'Preço de Liquidação'. Isso também significa que você tem até uma hora para reagir se houver uma grande queda no preço e o próximo preço estiver abaixo do seu Preço de Liquidação. Você pode ler mais sobre o Módulo de Segurança [aqui] (https://kb.oasis.app/help/the-oracle-security-module).`,
        },

        {
          question: 'O que é gás?',
          answer: `Gás é unidade de medida utilizada para pagar por transações no blockchain do Ethereum. Os preços de gás são cobrados em ETH e você sempre precisará ter ETH em sua carteira para ser capaz de interagir com Oasis.app. Essa taxa vai diretamente para os mineradores do Ethereum que mantém a rede do Ethereum funcionando. Oasis.app não cobra taxas pelo uso de funcionalidades básicas do Cofre.`,
        },

        {
          question: 'Por que eu mudaria a velocidade da transação?',
          answer: `A velocidade na transação permite que você pague mais gás para ter sua transação minerada mais rapidamente. Se você estiver com pressa de, por exemplo, aumentar seu Ratio de Colateralização para evitar ser liquidado, você pode determinar uma velocidade mais rápida para esta transação.`,
        },

        {
          question: 'Como eu contato o time do Oasis?',
          answer:
            'Se tiver alguma pergunta, nos [contate usando esta página](/daiwallet/contact) ou nos mande uma mensagem no [Twitter](https://twitter.com/oasisdotapp).',
        },
      ],
    },
    {
      title: 'Utilizando Oasis Multiply',
      id: 'using-multiply',
      questions: [
        {
          question: 'O que é ‘Multiply’?',
          answer:
            'Oasis Multiply permite que usuários emprestem Dai e aumentem sua exposição ao colateral selecionado ao criar Posições Multiply que imediatamente trocam o Dai emprestado por mais colateral na mesma transação. Isso é semelhante às posições com margem, porém sem a necessidade de emprestar fundos de uma contraparte centralizada. Oasis Multiply é construído com base no Protocolo Maker, Agregador de DEX 1INCH e Aave.',
        },
        {
          question: 'Quais as taxas no Multiply?',
          answer:
            'Oasis.app aplica uma taxa de 0,2% para cada troca de ativo dentro de uma transação Multiply. Essas ações podem ocasionar uma taxa adicional de 0,09%, que vai para a Aave, em razão dos empréstimos relâmpagos, caso a liquidez deles seja necessária para a ação. As Posições Multiply também pagarão taxas de estabilidade para o Protocolo Maker, como qualquer Cofre Maker. As taxas com gás no Ethereum variam conforme as condições da rede. Ações tradicionais em todos os Cofres são, como sempre, gratuitas.',
        },
        {
          question: 'Como as trocas são feitas?',
          answer:
            'Quando uma posição Multiply é criada, Dai será gerado contra o colateral e trocado através do protocolo 1INCH por mais colateral, com o objetivo de aumentar a exposição ao colateral fornecido. Em razão da integração do 1INCH com outras bolsas descentralizadas, nossos usuários vão receber os melhores preços possíveis em todos os mercados.',
        },
        {
          question: 'O que é poder de compra (buying power)?',
          answer:
            'O Poder de Compra determina o máximo de Dai que você poderá comprar de colateral, baseado na sua posição. Está usando o Multiply e transformando seu atual nível de colateralização no menor nível possível.',
        },
        {
          question: 'O que é valor líquido (net value)?',
          answer:
            'O valor líquido é calculado através do valor atual do seu colateral menos sua dívida. Nota: este cálculo não será exatamente igual ao valor que você receberá quando fechar seu cofre para Dai. Isso ocorre porque taxas são aplicadas quando você troca o colateral por Dai e porque o valor líquido é calculado usado o preço intermediário de mercado, que poderá ser impactado se você tiver uma posição grande para fechar.',
        },
        {
          question: 'O que é impacto no preço (price impact)?',
          answer:
            'Impacto no preço é a diferença entre o preço intermediário (mid price) e o preço de execução da troca, em razão da relação entre o tamanho da troca solicitada e a liquidez disponível no mercado.  Se a troca for grande e a liquidez pequena, a diferença será maior e o usuário será impactado negativamente. Em razão da integração com 1INCH, os usuários do Oasis.app podem negociar com confiança de que as melhores fontes de liquidez serão usadas para conseguir o melhor preço do mercado.',
        },
        {
          question: 'O que é slippage?',
          answer:
            'Transactions sent to the network may take some time to confirm and because of this trades may execute at a different price than the one expected. Slippage refers to the difference you are willing to accept between the quoted price and the execution prices due to differences in market conditions during transaction confirmation.',
        },
        {
          question: 'O que o Multiply número (number) significa?',
          answer:
            'Os Cofres Multiply possibilitam exposição aumentada para movimentos de preços do colateral. Assim, o Multiply Number se refere a quantas vezes mais a posição deve aumentar ou diminuir em valor com relação às mudanças de preço do colateral. Se o múltiplo é 3x, os usuários deverão receber 3 vezes mais apreciação de valor do que se estivessem apenas posicionados no colateral inicial.',
        },
        {
          question: 'Como eu transformo meu Cofre Multiply de volta para um Cofre Borrow?',
          answer:
            'Se você transformou seu Cofre Borrow em um Cofre Multiply dentro da interface do Oasis e gostaria de desfazer, você terá que enviar um email para support@oasis.app declarando o endereço da sua carteira e ID do Cofre que você gostaria de transformar de volta. O time do suporte pode perguntar por mais informações para provar que você é o proprietário do Cofre e o processo pode levar até 24 horas para ser realizado (possivelmente maior nos finais de semana e feriados).',
        },
      ],
    },
    {
      title: 'Utilizando Dai Wallet',
      id: 'using-daiwallet',
      questions: [
        {
          question: 'O que é a Dai Wallet?',
          answer: `Dai Wallet é a plataforma ideal para tudo que você deseja realizar com Dai. Uma aplicação descentralizada no blockchain do Ethereum, Dai Wallet possibilita a compra, envio e gestão do Dai, tudo isso no mesmo lugar!`,
        },
        {
          question: 'O que é Dai?',
          answer: `Dai é uma forma melhor e mais inteligente de moeda virtual para todos. É a primeira moeda imparcial do mundo e seu valor é consistentemente atrelado ao dólar americano. Isso significa que ela não sofre com a volatilidade associada a várias outras moedas virtuais. Para conhecer mais sobre Dai, leia nossa [breve introdução.](/daiwallet/dai).`,
        },
        {
          question: 'Preciso ter uma conta?',
          answer: `Não. Você não precisa criar uma nova conta para usar Dai Wallet. Você pode começar com praticamente qualquer carteira do Ethereum, incluindo Metamask ou Coinbase Wallet. Além disso, você também pode usar o Magic.Link, onde você deve informar seu email e clicar no link de login direto que enviaremos para sua caixa de entrada.`,
        },
        {
          question: 'Serei cobrado pelo uso?',
          answer:
            'Nossa Dai Wallet é atualmente grátis para uso. Contudo, você terá que pagar taxas da rede Ethereum e, dependendo das funcionalidades que use, taxas associadas ao Maker e outros protocolos, como Taxas de Estabilidade ou de corretoras de cripto.',
        },
        {
          question: 'Porque eu preciso de ETH para enviar ou poupar meu Dai?',
          answer: `Para realizar qualquer transação no blockchain do Ethereum, você precisa pagar a taxa com ETH, a moeda virtual nativa da rede do Ethereum. Essa taxa é conhecida como 'gás', e de forma semelhante ao que acontece com o combustível que impulsiona seu carro, o gás na rede é necessário para sua transação ser realizada com sucesso. Em breve, nós desejamos adicionar uma funcionalidade que permite pagar as taxas do gás com a própria Dai.`,
        },
        {
          question: 'Como posso contatar o time do Oasis?',
          answer:
            'Se tiver alguma pergunta, nos [contate usando esta página](/daiwallet/contact) ou nos mande uma mensagem no [Twitter](https://twitter.com/oasisdotapp).',
        },
      ],
    },
    {
      title: 'Segurança',
      id: 'security',
      questions: [
        {
          question: 'Oasis é seguro?',
          answer:
            'A segurança é nossa prioridade número um. Nós seguimos rigidamente as melhores práticas de segurança e realizamos de forma constante auditorias em nosso código e contratos inteligentes. Além disso, o código do Oasis é aberto, possibilitando que todos testem e auditem a tecnologia utilizada.',
        },
        {
          question: 'O Oasis pode acessar meus fundos em minha conta ou carteira?',
          answer:
            'Não. Com Dai, você - e apenas você - possui acesso e controle sobre seu Dai. Dai utiliza tecnologia blockchain para prover o nível máximo de confiança e transparência. Em razão dos mecanismos de funcionamento do blockchain, você decide seu próprio nível de segurança. Isso significa que você, em última instância, é responsável por sua própria segurança. Por isso, é muito importante que você mantenha seguro o acesso ao Dai e à conta do Oasis.',
        },
      ],
    },
    {
      title: 'Comprando Dai',
      id: 'buying-dai',
      questions: [
        {
          question: 'Posso comprar Dai com a Dai Wallet?',
          answer: `Sim! Através de integrações com nossos parceiros, você pode comprar Dai em mais de 100 países, incluindo Europa, Estados Unidos e algumas regiões da América Latina. Nós fizemos parcerias com três empresas registradas - Latamex, Wyre e Moonpay - para facilitar compras de Dai pelos usuários por meio de transferências bancárias ou cartões de crédito e débito. Você deve apenas se conectar no app e clicar em 'Comprar Dai' para escolher os parceiros adequados para você.`,
        },
        {
          question: 'Há limites para compra de Dai?',
          answer:
            'Sim. O limite varia de acordo com o parceiro utilizado e o país em que você se encontra. Para mais detalhes, por favor acesse os links abaixo: [Latamex Limits](https://latamex.zendesk.com/hc/es/articles/360037752631--Cu%C3%A1les-son-los-l%C3%ADmites-de-operaci%C3%B3n-), [Moonpay](https://support.moonpay.io/hc/en-gb/articles/360011931637-What-are-your-purchase-limits-) e [Wyre](https://support.sendwyre.com/en/articles/4457158-card-processing-faqs).',
        },
        {
          question: 'Qual o mínimo para compra?',
          answer: `Assim como o valor máximo permitido, o valor mínimo também depende do parceiro escolhido e da localização. Latamex: Na Argentina, o valor mínimo é ARS2000. No Brasil, é BRL80.00. No Mexico, é MXN270.00 Moonpay: Valor mínimo é 20 Dai Wyre: Valor mínimo é 20 Dai.`,
        },
        {
          question: 'Para onde estão indo essas taxas?',
          answer: `A Dai Wallet não recebe nenhuma taxa quando você compra Dai ou ETH através de nossos parceiros. A taxa é paga única e diretamente para o parceiro.`,
        },
        {
          question: 'Posso comprar ETH na Dai Wallet para pagar minhas taxas?',
          answer:
            'Sim. Para comprar ETH, você pode iniciar o mesmo processo que você usaria para comprar Dai. Escolha o parceiro desejado e altere a moeda desejada para compra no início do processo, de Dai para ETH.',
        },
      ],
    },
  ],
  cantFind: 'Não consegue encontrar o que você está buscando?',
  contactLink: 'Nos contate aqui',
}
