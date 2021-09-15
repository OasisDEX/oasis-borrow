import { ContentTypeSupport } from './support'

export const content: ContentTypeSupport = {
  title: 'FAQ',
  navigation: [
    { title: 'Using Oasis.app', id: 'using-oasis' },
    { title: 'Multiply functionality', id: 'multiply' },
    { title: 'Security', id: 'security' },
    { title: 'Buying Dai', id: 'buying-dai' },
  ],
  sections: [
    {
      title: 'Using Oasis.app',
      id: 'using-oasis',
      questions: [
        {
          question: 'What is Oasis.app?',
          answer: `Oasis.app is the home for everything you want to accomplish with Dai. A decentralized application that runs on the Ethereum blockchain, Oasis enables you to Buy, Send, and Manage your Dai all in one place.`,
        },
        {
          question: 'What is Dai?',
          answer: `Dai is a better, smarter digital currency for everyone. It is the world’s first unbiased currency and its value consistently tracks the US Dollar, which means it doesn't suffer from the volatility associated with many other digital currencies. To learn more about Dai, read our [short primer](/dai).`,
        },
        {
          question: 'Do I need an account?',
          answer: `No. You do not need to create a new account to use oasis.app. You can get started with almost any Ethereum wallet, including Metamask or Coinbase Wallet, or you can use our new Magic.Link feature -- where you provide an email address, click a link in the email we send you in response, and you're logged in.`,
        },
        {
          question: 'Will I be charged fees?',
          answer:
            'Oasis is currently free to use. However, you will have to pay transaction fees and, depending on the features you use, fees associated with Maker and other protocols, such as Stability or exchange fees.',
        },
        {
          question: 'Why do I need ETH to send or save my Dai?',
          answer: `To complete any transaction on the Ethereum blockchain, you need to pay a transaction fee using ETH, its default token. This fee is referred to as 'gas', and much like the gas that powers your car, this gas fee powers your transaction.`,
        },
        {
          question: 'How can I contact the Oasis team?',
          answer:
            'If you have any questions, reach out to us through our [Contact page](/contact) or on [Twitter](https://twitter.com/oasisdotapp).',
        },
      ],
    },
    {
      title: 'Multiply functionaly',
      id: 'multiply',
      questions: [
        {
          question: 'What is ‘Multiply’?',
          answer: `Oasis Multiply, allows users to borrow Dai and increase their exposure to their selected collateral by creating Multiply Positions that immediately swap the borrowed Dai for more collateral in the same transaction.This is similar to margin positions but without the need to borrow funds from a centralised counterparty. Oasis Multiply is built on top of the Maker Protocol, 1Inch Dex Aggregator and Aave.`,
        },
        {
          question: 'What are the fees for Multiply?',
          answer: `Oasis.app applies a fee of 0.2% for each token swap that takes place within a Multiply transaction. These actions may also incur an additional flashloan fee of 0.09% that goes to Aave in case their liquidity is needed for the action. Multiply Positions will pay an ongoing stability fee to the Maker Protocol like every Maker Vault. As usual Ethereum gas fees may apply depending on the network conditions. Standard actions in all Vaults are, as always, free.`,
        },
        {
          question: 'How are swaps done?',
          answer: `When a Multiply position is created Dai will be generated against collateral and swapped through 1inch protocol for more collateral in order to gain higher exposure to the supplied collateral. Thanks to the 1inch integration users will get the best possible prices across all markets.`,
        },
        {
          question: 'What is buying power?',
          answer: `The Buying Power specifies the maximum of Dai you can buy more collateral with, based on your position. It is using Multiply and going from the current collateralization ratio to the minimum collateralization ratio.`,
        },
        {
          question: 'What is net value?',
          answer: `The Net Value is calculated as the current value of the collateral in your vault minus the current debt. Note: This will not be exactly equal to the amount you will receive if you close your vault to Dai. This is due to fees applied when swapping collateral to Dai and because the Net Value is calculated using the mid-market price and you may suffer a larger price impact if you have a large position to close.`,
        },
        {
          question: 'What is Price impact?',
          answer: `Price impact is the spread between the mid price and the execution price of a trade as the size of the trade grows with respect to available liquidity. If trade size is big and liquidity shallow the difference between mid market price and execution price will be high and the user will be negatively impacted. Thanks to 1inch integration, Oasis.app users can trade with confidence that the best liquidity sources will be used to get the best price possible.`,
        },
        {
          question: 'What is slippage?',
          answer: `Transactions sent to the network may take some time to confirm and because of this trades may execute at a different price than the one expected. Slippage refers to the difference you are willing to accept between the quoted price and the execution prices due to differences in market conditions during transaction confirmation.`,
        },
        {
          question: 'What does the multiple number mean?',
          answer: `Multiply Vaults allow increased exposure to collateral price movements. As such the multiple number refers to how much more the position is expected to increase or decrease in value with respect to movements of the collateral. If multiple is 3x Vault owners will get 3 times as much price appreciation as if it was only holding their initial collateral. `,
        },
        {
          question: 'How can I convert my Multiply view back to a Borrow view?',
          answer: `If you have upgraded your Borrow Vault to a Multiply Vault in the Oasis UI and would like to swap it back, you will need to email support@oasis.app stating your wallet address and Vault ID you would like to swap back. The support team may ask for additional information to prove you own the Vault, and it can take up to 24 hours (longer at weekends) to change it.`,
        },
      ],
    },
    {
      title: 'Security',
      id: 'security',
      questions: [
        {
          question: 'Is Oasis Secure?',
          answer:
            'Security is our top priority. We stringently follow the best security practices, and regularly conduct smart contract and code audits. In addition, Oasis code is open-source, giving everyone in the community the ability to pressure test and audit the core technology.',
        },
        {
          question: 'Can Oasis access the funds in my account or wallet?',
          answer:
            'No. With Dai, you - and only you - have access and control over your Dai. Dai uses blockchain technology to ensure the highest level of trust and transparency, and because of the way blockchain technology works, you ultimately get to decide just how secure you want it to be. This does mean you are your own security ultimately, so it is very important you keep access to your Dai and Oasis account secure.',
        },
      ],
    },
    {
      title: 'Buying Dai',
      id: 'buying-dai',
      questions: [
        {
          question: 'Can I buy Dai while using Oasis.app?',
          answer: `Yes! Through connections with our partners, you can buy Dai in over 100 countries around the world, including Europe, the US, parts of Latin America. We have partnered with three registered third-party providers - Latamex, Wyre and Moonpay - to facilitate user purchases of  Dai using a range of debit or credit cards or bank transfers. Just connect to the app and hit the 'Buy Dai' button to see applicable providers for you.`,
        },
        {
          question: 'Is there a limit on how much Dai I can buy?',
          answer:
            'Yes, and it can vary depending on which third-party provider you use and what country you are in. Full details can be found on using the links; [Latamex Limits](https://latamex.zendesk.com/hc/es/articles/360037752631--Cu%C3%A1les-son-los-l%C3%ADmites-de-operaci%C3%B3n-), [Moonpay](https://support.moonpay.io/hc/en-gb/articles/360011931637-What-are-your-purchase-limits-) and [Wyre](https://support.sendwyre.com/en/articles/4457158-card-processing-faqs)',
        },
        {
          question: 'What is the minimum amount I can buy?',
          answer: `Like the maximum limits, there are also minimum amounts which are dependant on the third-party provider and location. Latamex: Argentina: 2000 ARS, Brazil: 80.00 BRL, Mexico: 270.00 MXN Moonpay: Minimum order is 20 Dai Wyre: Minimum order is 20 Dai`,
        },
        {
          question: 'Who are the fees going to?',
          answer: `Oasis.app doesn't take any of the fees when you buy Dai or ETH through one of our partner providers. The fee you pay goes solely and directly to the third-party provider.`,
        },
        {
          question: 'Can I buy ETH on Oasis to pay for my transaction fees?',
          answer:
            'Yes. Just like buying Dai, you can start the same process as you would to buy Dai, choose your third-party provider, and each offers an option to change Dai for ETH when you start the process.',
        },
      ],
    },
  ],
  cantFind: 'Can’t find what you’re looking for?',
  contactLink: 'Contact us here',
}
