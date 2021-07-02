import { ContentTypeSupport } from './support'

export const content: ContentTypeSupport = {
  title: 'FAQ',
  navigation: [
    { title: 'Usando Oasis.app', id: 'using-oasis' },
    { title: 'Seguridad', id: 'security' },
    { title: 'Comprar Dai', id: 'buying-dai' },
  ],
  sections: [
    {
      title: 'Usando Oasis.app',
      id: 'using-oasis',
      questions: [
        {
          question: '¿Qué es Oasis.app?',
          answer:
            'Oasis.app es el sitio para todo lo que quieras lograr con Dai. Una aplicación descentralizada que corre sobre la blockchain de Ethereum, Oasis te permite comprar, enviar y administrar tu Dai, todo en un único lugar.',
        },
        {
          question: '¿Qué es Dai?',
          answer:
            'Dai es una moneda digital mejor y más inteligente, disponible para todos. Es la primera moneda imparcial del mundo cuyo valor sigue consistentemente el dólar estadounidense, esto significa que no sufre de la volatilidad asociada a muchas otras monedas digitales. Para conocer más sobre Dai, lee nuestra [breve introducción.](/dai).',
        },
        {
          question: '¿Necesito crear una cuenta?',
          answer:
            'No. No necesitas creas una cuenta nueva para usar Oasis.app Puedes comenzar con casi cualquier billetera de Ethereum como Metamask o Coinbase Wallet. También puedes utilizar la funcionalidad de Magic.link, con la cual ingresas una dirección de email, y con un solo click en el link que enviaremos a tu bandeja de entrada ya puedes ingresar.',
        },
        {
          question: '¿Oasis cobra comisión por su uso?',
          answer:
            'Oasis es gratis actualmente. Sin embargo, tendrás que pagar los costos de las transacciones y dependiendo las funcionalidades que utilices, tendrás que pagar las comisiones asociadas con Maker y otros protocolos, tales cómo la tasa de estabilidad o bien las comisiones de los servicios de cambio de criptomonedas.',
        },
        {
          question: '¿Por qué necesito ETH para enviar o ahorrar mi Dai?',
          answer:
            'Para completar cualquier transacción en la blockchain de Ethereum, necesitas pagar una tarifa de transacción utilizando ETH, la criptomoneda por defecto de la red. Está tarifa se conoce como "gas", y es similar al combustible que da energía a tu automóvil, el gas impulsa tu transacción. Esperamos añadir pronto la posibilidad de pagar las tarifas de gas con Dai.',
        },
        {
          question: '¿Cómo puedo contactar al equipo de Oasis?',
          answer:
            'Si tienes alguna pregunta contáctanos a través de nuestra [página de contacto](/contact) o en [Twitter](https://twitter.com/oasisdotapp).',
        },
      ],
    },
    {
      title: 'Seguridad',
      id: 'security',
      questions: [
        {
          question: '¿Es Oasis seguro?',
          answer:
            'La seguridad es nuestra prioridad número uno. Seguimos las mejores prácticas de seguridad estrictamente y regularmente realizamos auditorias de nuestro código y los contratos inteligentes. Además, Oasis es de código abierto, de este modo, todos en la comunidad tienen la posibilidad de auditar la tecnología empleada.',
        },
        {
          question: '¿Puede Oasis acceder a los fondos en mi cuenta o billetera?',
          answer:
            'No. Con Dai, tu y solo tu, puedes acceder y controlar tus fondos. Dai usa tecnología de blockchain para asegurar el mayor nivel de confianza y transparencia. Por la forma en funciona la tecnología de blockchain, tú decides sobre el nivel de seguridad de tus fondos. Esto significa que eres tu propia seguridad en última instancia y es muy importante que mantengas el acceso a tu Dai y cuenta de Oasis seguros.',
        },
      ],
    },
    {
      title: 'Comprar Dai',
      id: 'buying-dai',
      questions: [
        {
          question: '¿Puedo comprar Dai utilizando Oasis.app?',
          answer:
            '¡Sí! Por medio de la integración con nuestros proveedores asociados puedes comprar Dai en más de 100 países alrededor del mundo, incluyendo Europa, EE. UU. partes de Latinoamérica y más utilizando Oasis.app. Nos hemos asociado con tres proveedores registrados - Latamex,Wyre y Moonpay- para facilitar a los usuarios la compra de Dai por medio de tarjeta de débito, crédito o transferencia bancaria. Con solo conectarte a la app y hacer click en "comprar Dai" podrás ver los proveedores disponibles en tu región.',
        },
        {
          question: '¿Hay algún limite para comprar Dai?',
          answer:
            'Sí. El límite varía dependiendo que proveedor de terceros utilices y en qué país te encuentres. Para más información puedes visitar los siguientes links: [Límites Latamex](https://latamex.zendesk.com/hc/es/articles/360037752631--Cu%C3%A1les-son-los-l%C3%ADmites-de-operaci%C3%B3n-), [Límites Moonpay](https://support.moonpay.io/hc/en-gb/articles/360011931637-What-are-your-purchase-limits-) and [Límites Wyre](https://support.sendwyre.com/en/articles/4457158-card-processing-faqs)',
        },
        {
          question: '¿Cuál es el monto mínimo para comprar?',
          answer: `Del mismo modo que existen montos máximos existen mínimos que dependen del proveedor de terceros y de la ubicación. Latamex: Argentina: ARS $ 2000, Brazil: 80.00 BRL, Mexico: 270.00 MXN Moonpay: El monto mínimo es 20 Dai Wyre: El monto mínimo es 20 Dai`,
        },
        {
          question: '¿A dónde van los gastos de las comisiones?',
          answer:
            'Oasis.app no recibe ninguna comisión cuando compras Dai o ETH a través de uno de nuestros proveedores asociados. La comisión que pagas va directamente al proveedor de terceros.',
        },
        {
          question: '¿Puedo comprar ETH en Oasis para pagar por las tarifas de la red?',
          answer:
            'Sí. Para comprar ETH puedes iniciar el mismo proceso que para comprar Dai. Luego de elegir el proveedor de terceros cada uno ofrece la opción de cambiar de Dai a ETH al inicio del proceso.',
        },
      ],
    },
  ],
  cantFind: '¿No puedes encontrar lo que estás buscando?',
  contactLink: 'Contactanos aquí.',
}
