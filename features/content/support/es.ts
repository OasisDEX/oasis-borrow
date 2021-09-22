import { ContentTypeSupport } from './support'

export const content: ContentTypeSupport = {
  title: 'FAQ',
  navigation: [
    { title: 'Usar Oasis.app', id: 'using-oasis' },
    { title: 'Usar Oasis Multiply', id: 'using-multiply' },
    { title: 'Usar Dai Wallet', id: 'using-daiwallet' },
    { title: 'Seguridad', id: 'security' },
    { title: 'Comprar Dai', id: 'buying-dai' },
  ],
  sections: [
    {
      title: 'Usar Oasis.app',
      id: 'using-oasis',
      questions: [
        {
          question: '¿Qué activos puedo utilizar como colateral?',
          answer: `Puedes utilizar muchos tipos diferentes de colateral incluyendo ETH y WBTC. Los colaterales son incorporados por el gobierno de Maker en el protocolo. Puedes ver cada uno visitando oasis.app con su correspondiente tasa de estabilidad y su ratio de colateralización mínimo.`,
        },
        {
          question: '¿Cuanto cuesta?',
          answer: `Abrir y administrar un Vault es gratis en Oasis.app. Pagarás el gas para las transacciones y la tasa de estabilidad. La tasa de estabilidad es cobrada sobre el Dai que has generado y va directamente al protocolo Maker.`,
        },
        {
          question: '¿Cómo abro un Vault? ',
          answer: `Para abrir un Vault, selecciona el colateral y el subtipo (ej. ETH-A) en la página principal (Oasis.app), conecta tu cartera preferida y sigue las instrucciones que te guiarán en el proceso.`,
        },
        {
          question: '¿Qué es la tasa de estabilidad?',
          answer: `La tasa de estabilidad es la tasa variable anual (mostrada como porcentaje) que es añadida a tu deuda y deberás pagar. Esto puede ser visto como el costo para generar Dai, que es pagado directamente al protocolo Maker.`,
        },
        {
          question: '¿Cuál es la diferencia entre los Vaults de colateral -A/-B/-C?',
          answer: `Hay múltiples tipos de Vault para algunos colaterales. Cada tipo, indicado por una letra tiene su propio ratio de colateralización y tasa de estabilidad.. Puedes elegir cualquier tipo de Vault que quieras de acuerdo a tus necesidades y perfil de riesgo.`,
        },
        {
          question: '¿Qué es un Proxy? ¿Por qué necesito generar uno?',
          answer: `Un Proxy es un contrato inteligente que te permite interactuar fácilmente con protocolos soportados, incluyendo el protocolo Maker, para manejar tus Vaults, generar Dai, etc. Necesitarás hacer esto una sola vez por cartera y todos tus Vaults serán manejados por este único Proxy. Por favor nunca envíes fondos a la dirección del Proxy.`,
        },
        {
          question: '¿Por qué necesito aprobar los tokens? ¿Qué es el permiso?',
          answer: `Los permisos de los tokens te permiten controlar cuánto puede utilizar el contrato Proxy en relación al saldo de tu cartera. Para permitir al contrato Proxy pagar tu deuda o interactuar con los colaterales en tu cartera necesitarás autorizarlo configurando un permiso hasta el monto que quieras utilizar en cada ocasión. También puedes configurar un permiso más elevado para futuras interacciones con Oasis.app. Todo esto lo verás de modo interactivo al utilizar Oasis.app y no deberás tomar ninguna acción extra en caso de que no veas indicaciones al respecto.`,
        },
        {
          question: '¿Qué es el ratio de liquidación?',
          answer: `El ratio de liquidación es el ratio mínimo de colateralización sobre el cual debes mantener tu Vault con el fin de que no esté en riesgo de ser liquidado. Si tu Vault cae por debajo de este ratio mínimo de colateralización, tu Vault podría ser liquidado y tu colateral vendido para cubrir tu deuda.`,
        },
        {
          question: '¿Qué es el precio de liquidación?',
          answer: `El precio de liquidación es el precio en el cual tu Vault estará en riesgo de liquidación basado en el “Precio Actual” del Módulo de Seguridad del Oráculo del protocolo Maker. Es un útil indicador que te permite saber cuándo podrías ser liquidado. Por favor ten en cuenta que  si tu Vault tiene una tasa de estabilidad positiva (esto es >0) entonces tu precio de liquidación aumentará constantemente a medida que más deuda es añadida a tu Vault.`,
        },
        {
          question: '¿Qué es la penalidad por liquidación?',
          answer: `La penalidad por liquidación es el monto añadido a tu deuda una vez que tu Vault es liquidado. Cada colateral y subtipo (e.j. ETH-A y ETH-B) puede tener su propia penalidad por liquidación configurada por el gobierno de Maker. Esta penalidad es pagada directamente al protocolo Maker y Oasis.app no cobra ninguna tarifa adicional por ser liquidado.`,
        },
        {
          question: '¿Qué es la deuda mínima del Vault?',
          answer: `La deuda mínima del Vault, también llamada Dust, es el monto mínimo de Dai que debes generar y mantener para abrir un Vault. Este monto mínimo de deuda del Vault es configurado por el gobierno de Maker y puede ser ajustado en cualquier momento. Si el mínimo es elevado a un valor por encima de tu deuda actual, verás la funcionalidad de tu Vault reducida hasta que incrementes la deuda por arriba del mínimo nuevamente.`,
        },
        {
          question: '¿Qué es el próximo precio y cómo lo sabes?',
          answer: `Dentro del protocolo Maker existen siempre dos precios para el colateral. El precio actual y el próximo precio. Para proteger al sistema y los usuarios de “actores maliciosos” y flash crashes, el protocolo Maker utilizar un “Módulo de Seguridad del Oráculo”. Esto significa que todos los precios que se introducen en el sistema son demorados durante una hora y actualizados únicamente una vez por hora, aproximadamente en la hora. El próximo precio es el precio que se incorporará en el sistema como el “Precio actual”. Es el Precio actual contra el cual se mide tu Vault, por lo que sólo puedes ser liquidado una vez que el Precio actual se encuentre por debajo de tu Precio de liquidación. Esto significa que tienen hasta una hora para reaccionar en caso de que haya una gran caída en el precio y el próximo precio esté por debajo de tu precio de liquidación.`,
        },
        {
          question: 'Qué es el gas? ',
          answer: `El gas es la unidad de medidas para pagar por las transacciones en la blockchain de Ethereum. Los precios del Gas se cobran en ETH y siempre necesitarás tener ETH en tu cartera para poder interactuar con Oasis.app. Esta tarifa de gas va directamente a los mineros de Ethereum que mantienen Ethereum corriendo. Oasis.app no cobra ninguna tarifa por el manejo básico de los Vaults.`,
        },
        {
          question: '¿Por qué cambiaría la velocidad de la transacción?',
          answer: `La velocidad de la transacción te permite pagar más gas para que tu transacción sea minada más rápidamente. En caso de que estés apurado, por ejemplo para incrementar tu ratio de colateralización para evitar la liquidación, puedes seleccionar velocidad rápida para tus transacciones.`,
        },
        {
          question: '¿Cómo puedo contactar al equipo de Oasis?',
          answer:
            'Si tienes preguntas, puedes comunicarte con nosotros a través de la [página de contacto](/daiwallet/contact) o en [Twitter](https://twitter.com/oasisdotapp).',
        },
      ],
    },
    {
      title: 'Usar Oasis Multiply',
      id: 'using-multiply',
      questions: [
        {
          question: '¿Qué es ‘Multiply’?',
          answer:
            'Oasis Multiply permite a los usuarios pedir prestado Dai y aumentar su exposición a su colateral elegido al crear posiciones de Multiply que intercambian inmediatamente el Dai prestado por más colateral en la misma transacción. Esto es similar a posiciones de margen pero sin la necesidad de pedir fondos prestados desde una contraparte centralizada. Oasis Multiply está construido sobre el Protocol Maker, 1inch Dex Aggregator y Aave.',
        },
        {
          question: '¿Cuáles son los costos de Multiply?',
          answer:
            'Oasis.app cobra una tarifa de 0,2% por cada intercambio de tokens que ocurre dentro de una transacción Multiply. Estas acciones pueden también generar una tarifa adicional de Flashloan de 0,09% cobrada por Aave en caso de que su liquidez sea necesaria para la acción. Las posiciones de Multiply pagan regularmente una tasa de estabilidad al protocolo Maker como cualquier otro Vault. Como es usual, se deberán pagar las tarifas de gas de la red de Ethereum dependiendo de las condiciones de la red. Las acciones estándar de todos los Vaults son gratis, como siempre.',
        },
        {
          question: '¿Cómo son realizados los intercambios?',
          answer:
            'Cuando una posición de Multiply es creada, Dai será generado contra el colateral e intercambiado por medio del protocolo 1inch por más colateral con el objetivo de obtener mayor exposición al colateral suministrado. Gracias a la integración de 1inch los usuarios obtendrán el mejor precio posible entre todos los mercados.',
        },
        {
          question: '¿Qué es el poder de compra?',
          answer:
            'El Poder de compra especifica el máximo monto de Dai que puedes utilizar para comprar más colateral, basado en tu posición. Se computa yendo desde el ratio de colateral actual al ratio de colateralización mínimo.',
        },
        {
          question: '¿Qué es el valor neto?',
          answer:
            'El Valor Neto es calculado como el valor actual del colateral en tu Vault menos tu deuda actual. Nota: Esto no será exactamente igual al monto que recibirás si cierras tu Vault a Dai. Esto se debe a las tarifas aplicadas durante el intercambio de colateral a Dai y porque el Valor Neto está calculado utilizando el precio medio del mercado y puedes incurrir en un gran impacto de precio si tienes una posición grande para cerrar.',
        },
        {
          question: '¿Qué es el impacto en el precio?',
          answer:
            'El impacto en el precio es la diferencia entre el precio medio y el precio de ejecución de un intercambio a medida que el tamaño del intercambio crece en relación a la liquidez disponible. Si el tamaño del intercambio es grande y la liquidez limitada, la diferencia entre el precio medio del mercado y el precio de ejecución será alta y el usuario será afectado negativamente.  Gracias a la integración con 1inch, los usuarios de Oasis.app pueden realizar intercambios con la confianza de que las mejores fuentes de liquidez serán usadas para obtener los mejores precios posibles.',
        },
        {
          question: '¿Qué es el deslizamiento de precios?',
          answer:
            'Las transacciones enviadas a la red pueden requerir un tiempo para ser confirmadas y, por esta razón, los intercambios pueden ejecutarse a un precio distinto del esperado. El deslizamiento de precio se refiere a la diferencia que estás dispuesto a aceptar entre el precio indicado y el precio de ejecución debido a diferencias en las condiciones del mercado durante la confirmación de la transacción.',
        },
        {
          question: '¿Qué significa el número de múltiplo?',
          answer:
            'Los Multiply Vaults permiten mayor exposición a los movimientos del precio del colateral. El múltiplo se refiere a cuánto se espera que la posición aumente o reduzca su valor con respecto al movimiento de precio del colateral. Si el múltiplo es 3x los dueños de Vaults obtendrán 3 veces más apreciación de su posición que si solamente tuvieran su colateral inicial.',
        },
        {
          question: '¿Cómo puedo convertir mi vista de Multiply nuevamente a la vista de Borrow?',
          answer:
            'Si actualizaste tu Borrow Vault a Multiply Vault en la interfaz de Oasis y te gustaría deshacer el cambio, necesitarás enviar un correo electrónico a support@oasis.app indicando la dirección de tu cartera y el ID del Vault que quieres cambiar. Puede que el equipo de soporte te solicite información adicional para demostrar que eres dueño del Vault y es posible que el cambio tarde hasta 24 horas (con mayor demora durante los fines de semana).',
        },
      ],
    },
    {
      title: 'Usando Dai Wallet',
      id: 'using-daiwallet',
      questions: [
        {
          question: '¿Qué es Dai Wallet?',
          answer:
            'Dai Wallet es el sitio para todo lo que quieras lograr con Dai. Una aplicación descentralizada que corre sobre la blockchain de Ethereum, Oasis Dai Wallet te permite comprar, enviar y administrar tu Dai, todo en un único lugar.',
        },
        {
          question: '¿Qué es Dai?',
          answer:
            'Dai es una moneda digital mejor y más inteligente, disponible para todos. Es la primera moneda imparcial del mundo cuyo valor sigue consistentemente el dólar estadounidense, esto significa que no sufre de la volatilidad asociada a muchas otras monedas digitales. Para conocer más sobre Dai, lee nuestra [breve introducción.](/daiwallet/dai).',
        },
        {
          question: '¿Necesito crear una cuenta?',
          answer:
            'No. No necesitas creas una cuenta nueva para usar Oasis.app Puedes comenzar con casi cualquier cartera de Ethereum como Metamask o Coinbase Wallet. También puedes utilizar la funcionalidad de Magic.link, con la cual ingresas una dirección de email, y con un solo click en el link que enviaremos a tu bandeja de entrada ya puedes ingresar.',
        },
        {
          question: '¿Oasis cobra comisión por su uso?',
          answer:
            'Dai Wallet es gratis actualmente. Sin embargo, tendrás que pagar los costos de las transacciones y dependiendo las funcionalidades que utilices, tendrás que pagar las comisiones asociadas con Maker y otros protocolos, tales cómo la tasa de estabilidad o bien las comisiones de los servicios de cambio de criptomonedas.',
        },
        {
          question: '¿Por qué necesito ETH para enviar o ahorrar mi Dai?',
          answer:
            'Para completar cualquier transacción en la blockchain de Ethereum, necesitas pagar una tarifa de transacción utilizando ETH, la criptomoneda por defecto de la red. Está tarifa se conoce como "gas", y es similar al combustible que da energía a tu automóvil, el gas impulsa tu transacción.',
        },
        {
          question: '¿Cómo puedo contactar al equipo de Oasis?',
          answer:
            'Si tienes alguna pregunta contáctanos a través de nuestra [página de contacto](/daiwallet/contact) o en [Twitter](https://twitter.com/oasisdotapp).',
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
          question: '¿Puede Oasis acceder a los fondos en mi cuenta o cartera?',
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
          question: '¿Puedo comprar Dai utilizando Dai Wallet?',
          answer:
            '¡Sí! Por medio de la integración con nuestros proveedores asociados puedes comprar Dai en más de 100 países alrededor del mundo, incluyendo Europa, EE. UU. y partes de Latinoamérica. Nos hemos asociado con tres proveedores registrados - Latamex,Wyre y Moonpay- para facilitar a los usuarios la compra de Dai por medio de tarjeta de débito, crédito o transferencia bancaria. Con solo conectarte a la app y hacer click en "comprar Dai" podrás ver los proveedores disponibles en tu región.',
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
            'Nuestra Dai Wallet no recibe ninguna comisión cuando compras Dai o ETH a través de uno de nuestros proveedores asociados. La comisión que pagas va directamente al proveedor de terceros.',
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
