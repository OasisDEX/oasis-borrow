import { ContentTypeSupport } from './support'

export const content: ContentTypeSupport = {
  title: 'FAQ',
  navigation: [
    { title: 'Usando Oasis.app', id: 'using-oasis' },
    { title: 'Segurança', id: 'security' },
    { title: 'Comprando Dai', id: 'buying-dai' },
  ],
  sections: [
    {
      title: 'Usando Oasis.app',
      id: 'using-oasis',
      questions: [
        {
          question: 'O que é o Oasis.app?',
          answer:
            'Oasis.app é a plataforma ideal para tudo que você deseja realizar com Dai. Uma aplicação descentralizada no blockchain do Ethereum, Oasis possibilita a compra, envio e gestão do Dai, tudo isso no mesmo lugar!',
        },
        {
          question: 'O que é Dai?',
          answer:
            'DDai é uma forma melhor e mais inteligente de moeda virtual para todos. É a primeira moeda imparcial do mundo e seu valor é consistentemente atrelado ao dólar americano. Isso significa que ela não sofre com a volatilidade associada a várias outras moedas virtuais. Para conhecer mais sobre Dai, leia nossa [breve introdução.](/dai).',
        },
        {
          question: 'Preciso criar uma conta?',
          answer:
            'Não. Você não precisa criar uma nova conta para usar Oasis.app. Você pode começar com praticamente qualquer carteira do Ethereum, incluindo Metamask ou Coinbase Wallet. Além disso, você também pode usar o Magic.Link, onde você deve informar seu email e clicar no link de login direto que enviaremos para sua caixa de entrada.',
        },
        {
          question: 'Serei cobrado pelo uso do Oasis?',
          answer:
            'Atualmente, o Oasis é gratuito para uso. Porém, você terá que pagar taxas dependendo das funcionalidades utilizadas, que podem ser associadas ao Maker ou outros protocolos, como as taxas de Estabilidade ou as exigidas por corretoras de criptomoedas.',
        },
        {
          question: 'Porque eu preciso de ETH para enviar ou poupar meu Dai?',
          answer: `Para realizar qualquer transação no blockchain do Ethereum, você precisa pagar a taxa com ETH, a moeda virtual nativa da rede do Ethereum. Essa taxa é conhecida como 'gás', e de forma semelhante ao que acontece com o combustível que impulsiona seu carro, o gás na rede é necessário para sua transação ser realizada com sucesso. Em breve, nós desejamos adicionar uma funcionalidade que permite pagar as taxas do gás com a própria Dai.`,
        },
        {
          question: 'Como posso contatar o time do Oasis?',
          answer:
            'Se tiver alguma pergunta, nos [contate usando esta página](/contact) ou nos mande uma mensagem no [Twitter](https://twitter.com/oasisdotapp).',
        },
      ],
    },
    {
      title: 'Segurança',
      id: 'security',
      questions: [
        {
          question: 'O Oasis é seguro?',
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
          question: 'Posso comprar Dai enquanto uso o Oasis.app?',
          answer: `Sim! Através de integrações com nossos parceiros, você pode comprar Dai em mais de 100 países, incluindo Europa, Estados Unidos e algumas regiões da América Latina. Nós fizemos parcerias com três empresas registradas - Latamex, Wyre e Moonpay - para facilitar compras de Dai pelos usuários por meio de transferências bancárias ou cartões de crédito e débito. Você deve apenas se conectar no app e clicar em 'Comprar Dai' para escolher os parceiros adequados para você.`,
        },
        {
          question: 'Há limites para compra de Dai?',
          answer:
            'Sim. O limite varia de acordo com o parceiro utilizado e o país em que você se encontra. Para mais detalhes, por favor acesse os links abaixo: [Latamex Limits](https://latamex.zendesk.com/hc/es/articles/360037752631--Cu%C3%A1les-son-los-l%C3%ADmites-de-operaci%C3%B3n-), [Moonpay](https://support.moonpay.io/hc/en-gb/articles/360011931637-What-are-your-purchase-limits-) and [Wyre](https://support.sendwyre.com/en/articles/4457158-card-processing-faqs)',
        },
        {
          question: 'Qual o mínimo para compra?',
          answer: `Assim como o valor máximo permitido, o valor mínimo também depende do parceiro escolhido e da localização. Latamex: Na Argentina, o valor mínimo é ARS2000. No Brasil, é BRL80.00. No Mexico, é MXN270.00 Moonpay: Valor mínimo é 20 Dai Wyre: Valor mínimo é 20 Dai`,
        },
        {
          question: 'Para onde estão indo essas taxas?',
          answer:
            'O Oasis.app não recebe nenhuma taxa quando você compra Dai ou ETH através de nossos parceiros. A taxa é paga única e diretamente para o parceiro.',
        },
        {
          question: 'Posso comprar ETH no Oasis para pagar minhas taxas?',
          answer:
            'Sim. Para comprar ETH, você pode iniciar o mesmo processo que você usaria para comprar Dai. Escolha o parceiro desejado e altere a moeda desejada para compra no início do processo, de Dai para ETH.',
        },
      ],
    },
  ],
  cantFind: 'Não consegue encontrar o que você está buscando?',
  contactLink: 'Nos contate aqui',
}
