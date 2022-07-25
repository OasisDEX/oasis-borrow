import { ContentTypeSupport } from './support'

export const content: ContentTypeSupport = {
  title: 'FAQ',
  navigation: [
    { title: 'Using Oasis.app', id: 'using-oasis' },
    { title: 'Using Oasis Multiply', id: 'using-multiply' },
    { title: 'Using Dai Wallet', id: 'using-daiwallet' },
    { title: 'Security', id: 'security' },
    { title: 'Buying Dai', id: 'buying-dai' },
  ],
  sections: [
    {
      title: 'Using Oasis.app',
      id: 'using-oasis',
      questions: [
        {
          question: 'What assets can I use as collateral?',
          answer: `You can use many different collateral types which are voted in by Maker Governance to the Maker Protocol, including ETH and wrapped BTC. You can see each one by visiting oasis.app with the corresponding Stability Fees and Minimum Collateralization Ratios.`,
        },

        {
          question: 'How much does it cost?',
          answer: `Opening and managing a Vault is free on Oasis.app except for gas costs and Stability Fees. The Stability Fee is charged on the amount of Dai you have generated and goes directly to the Maker Protocol.`,
        },

        {
          question: 'How do I open a Vault?',
          answer: `To open a Vault, select the relevant Collateral and sub-type (e.g. ETH-A) from the homepage (Oasis.app) and connect your preferred wallet and follow the on screen instructions that will guide you through.`,
        },

        {
          question: 'What is the Stability Fee?',
          answer: `The Stability Fee is the variable annual rate (shown as a percentage) added to your debt that you will need to pay back. This can be seen as the cost to generate Dai, which is paid directly to the Maker Protocol. To read more about the Stability Fee check the [Knowledge Base](https://kb.oasis.app/help/the-stability-fee).`,
        },

        {
          question: 'What is the difference between -A/-B/-C collateral Vaults?',
          answer: `There are multiple Vault types for some collaterals. Each type indicated by a letter has its own Collateralization Ratio, and Stability Fee. You can pick whatever type of Vault you want according to your needs and risk profile.`,
        },

        {
          question: 'What is a Proxy? Why do I need to generate one?',
          answer: `A Proxy is a smart contract that allows you to easily interact with supported protocols, including the Maker Protocol, to manage your Vaults, generate Dai and so on. You will only need to do this once per wallet and all your Vaults will be managed through this single Proxy. Please never send any funds to this Proxy address though.`,
        },

        {
          question: 'Why do I need to approve tokens? What is allowance?',
          answer: `Token allowances let you control how much the proxy contract can do with the token balance in your wallet. To allow the Proxy contract to pay back Dai, or interact with the collaterals in your wallet, you will need to authorize it by setting an allowance with each token that you want to use with Oasis.app. You can set the allowance to the amount you want to use each time or you can set a higher allowance for future interactions with Oasis.app. This will all be presented to you within the flows inside Oasis.app, and you won’t have to do anything extra if you don’t see any prompts.`,
        },

        {
          question: 'What is the Liquidation Ratio?',
          answer: `The Liquidation Ratio is the Minimum Collateralization Ratio which you must keep your Vault at to not put it at risk of being liquidated. If your Vault goes below this Minimum Collateralization Ratio, your Vault could be liquidated and your collateral sold off to cover your debt. To understand more about [collateralization ratio](https://kb.oasis.app/help/collateralization-ratio) and [liquidations](https://kb.oasis.app/help/liquidations) follow the links to the Knowledge Base.`,
        },

        {
          question: 'What is the Liquidation Price?',
          answer: `The Liquidation Price is the price that your Vault will be at risk of liquidation based on the ‘Current Price’ from the Oracle Security Module of the Maker Procol. It is a helpful indicator to allow you to know when you could get liquidated. Please note however that if your Vault has a positive Stability Fee (i.e. >0) then your liquidation price will continually increase as more debt is added to your Vault. You can read more about Liquidation [here](https://kb.oasis.app/help/liquidations).`,
        },

        {
          question: 'What is the Liquidation Penalty?',
          answer: `The Liquidation Penalty is the amount added to your debt once your Vault is liquidated. Each collateral and sub-type (e.g. ETH-A and ETH-B) can have their own liquidation penalties set by Maker Governance. This penalty is also paid directly to the Maker Protocol, and Oasis.app does not charge you any additional fees for being liquidated.`,
        },

        {
          question: 'What is the minimum Vault Debt?',
          answer: `The minimum Vault Debt, also called Dust, is the minimum amount of Dai you must generate to open a new Vault, and maintain. This minimum Vault Debt value is set and can be adjusted at any time by Maker Governance. If the minimum is increased to a value above your current Debt, then you will experience reduced functionality of your Vault until you increase it to above the minimum again. Read more about minimum Vaul Debt [here](https://kb.oasis.app/help/minimum-vault-debt-dust).`,
        },

        {
          question: "What is ‘Dai available’? Why can't I borrow more Dai?",
          answer: `The Maker protocol sets an upper limit for for    borrowing against each Vault type: the Debt Ceiling. Dai available represents the maximum amount of Dai all Vault owners can generate against that Vault type until the Debt Ceiling is reached. This Debt Ceiling should not be confused with the Dai available to generate seen in your Vault page. That amount represents the maximum amount of Dai you can borrow based on your current Vault state. In case the Debt Ceiling is reached no more Dai can be generated unless the debt ceiling is lifted or someone payback their debt. The Maker protocol updates the debt ceiling regularly but if you can’t generate more Dai because the Debt Ceiling has been reached please check back in a few hours.`,
        },

        {
          question: 'What is the next price and how do you know?',
          answer: `Within the Maker Protocol, there are always two prices for the collateral, the current price and the next price. To protect the system and users from ‘bad actors’ and flash crashes, the Maker Protocol uses an ‘Oracle Security Module’. This means that all prices that go into the system are delayed by one hour, and only updated once per hour - roughly on the hour. The next price is the price that will come into the system as the ‘Current Price’. It is the Current Price that your Vault is always measured against, so you can only be liquidated once the ‘Current Price’ goes below your  ‘Liquidation Price’. This also means you have up to one hour to react if there is a big price drop and the next price is below your Liquidation Price. You can read more about the Oracle Security Module [here](https://kb.oasis.app/help/the-oracle-security-module).`,
        },

        {
          question: 'What is gas?',
          answer: `Gas is the unit of measure for paying for transactions on the Ethereum Blockchain. Gas prices are charged in ETH and you will always need to have ETH in your wallet to be able to interact with Oasis.app. This Gas fee goes directly to Ethereum Miners who keep Ethereum running. Oasis.app does not charge any fees for basic Vault management.`,
        },

        {
          question: 'Why would I change the transaction speed?',
          answer: `Transaction speed allows you to pay more gas to get your transactions mined faster. In case you are in a hurry, for example to increase your Collateralization Ratio to avoid liquidation, you can set a fast speed for your transactions.`,
        },

        {
          question: 'How can I contact the Oasis team?',
          answer:
            'If you have any questions, reach out to us through our [Contact page](/daiwallet/contact) or on [Twitter](https://twitter.com/oasisdotapp).',
        },
      ],
    },
    {
      title: 'Using Oasis Multiply',
      id: 'using-multiply',
      questions: [
        {
          question: 'What is ‘Multiply’?',
          answer:
            'Oasis Multiply, allows users to borrow Dai and increase their exposure to their selected collateral by creating Multiply Positions that immediately swap the borrowed Dai for more collateral in the same transaction. This is similar to margin positions but without the need to borrow funds from a centralised counterparty. Oasis Multiply is built on top of the Maker Protocol and 1Inch Dex Aggregator.',
        },
        {
          question: 'What are the fees for Multiply?',
          answer:
            'Oasis.app applies a fee of 0.2% for each token swap that takes place within a Multiply transaction. Flashloans use Maker Flash Mint Module for borrowing Dai which is free. Multiply Positions will pay an ongoing stability fee to the Maker Protocol like every Maker Vault. As usual Ethereum gas fees may apply depending on the network conditions. Standard actions in all Vaults are, as always, free.',
        },
        {
          question: 'How are swaps done?',
          answer:
            'When a Multiply position is created Dai will be generated against collateral and swapped through 1inch protocol for more collateral in order to gain higher exposure to the supplied collateral. Thanks to the 1inch integration users will get the best possible prices across all markets.',
        },
        {
          question: 'What is buying power?',
          answer:
            'The Buying Power specifies the maximum of Dai you can buy more collateral with, based on your position. It is using Multiply and going from the current collateralization ratio to the minimum collateralization ratio.',
        },
        {
          question: 'What is net value?',
          answer:
            'The Net Value is calculated as the current value of the collateral in your vault minus the current debt. Note: This will not be exactly equal to the amount you will receive if you close your vault to Dai. This is due to fees applied when swapping collateral to Dai and because the Net Value is calculated using the mid-market price and you may suffer a larger price impact if you have a large position to close.',
        },
        {
          question: 'What is price impact?',
          answer:
            'Price impact is the spread between the mid price and the execution price of a trade as the size of the trade grows with respect to available liquidity. If trade size is big and liquidity shallow the difference between mid market price and execution price will be high and the user will be negatively impacted. Thanks to 1inch integration, Oasis.app users can trade with confidence that the best liquidity sources will be used to get the best price possible.',
        },
        {
          question: 'What is slippage?',
          answer:
            'Transactions sent to the network may take some time to confirm and because of this trades may execute at a different price than the one expected. Slippage refers to the difference you are willing to accept between the quoted price and the execution prices due to differences in market conditions during transaction confirmation.',
        },
        {
          question: 'What does the multiple number mean?',
          answer:
            'Multiply Vaults allow increased exposure to collateral price movements. As such the multiple number refers to how much more the position is expected to increase or decrease in value with respect to movements of the collateral. If multiple is 3x Vault owners will get 3 times as much price appreciation as if it was only holding their initial collateral.',
        },
        {
          question: 'How can I convert my Multiply view back to a Borrow view?',
          answer:
            'If you have upgraded your Borrow Vault to a Multiply Vault in the Oasis UI and would like to swap it back, you can go to the "Borrow" tab in your vault\'s page, and then click on the "Go to Borrow Interface" button. It will ask you for confirmation, and if allowed, the Vault interface will be changed back to Borrow. You can switch back and forth the interface as many times as you want, as it does not require transactions.',
        },
      ],
    },
    {
      title: 'Using Dai Wallet',
      id: 'using-daiwallet',
      questions: [
        {
          question: 'What is Dai Wallet?',
          answer: `Dai Wallet is the home for everything you want to accomplish with Dai. A decentralized application that runs on the Ethereum blockchain, Oasis Dai Wallet enables you to Buy, Send, and Manage your Dai all in one place.`,
        },
        {
          question: 'What is Dai?',
          answer: `Dai is a better, smarter digital currency for everyone. It is the world’s first unbiased currency and its value consistently tracks the US Dollar, which means it doesn't suffer from the volatility associated with many other digital currencies. To learn more about Dai, read our [short primer](/daiwallet/dai).`,
        },
        {
          question: 'Do I need an account?',
          answer: `No. You do not need to create a new account to use Dai Wallet. You can get started with almost any Ethereum wallet, including Metamask or Coinbase Wallet, or you can use our new Magic.Link feature -- where you provide an email address, click a link in the email we send you in response, and you're logged in.`,
        },
        {
          question: 'Will I be charged fees?',
          answer:
            'Our Dai Wallet is currently free to use. However, you will have to pay transaction fees and, depending on the features you use, fees associated with Maker and other protocols, such as Stability or exchange fees.',
        },
        {
          question: 'Why do I need ETH to send or save my Dai?',
          answer: `To complete any transaction on the Ethereum blockchain, you need to pay a transaction fee using ETH, its default token. This fee is referred to as 'gas', and much like the gas that powers your car, this gas fee powers your transaction.`,
        },
        {
          question: 'How can I contact the Oasis team?',
          answer:
            'If you have any questions, reach out to us through our [Contact page](/daiwallet/contact) or on [Twitter](https://twitter.com/oasisdotapp).',
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
            'Security is our top priority. We stringently follow the best security practices, and regularly conduct smart contract and code audits. In addition, Oasis code is open-source, giving everyone in the community the ability to pressure test and audit the core technology. You can check our [documentation](https://kb.oasis.app/help/smart-contracts-and-documentation) page where you will find links to our codebase, smart contracts addresses and code and the audit reports.',
        },
        {
          question: 'Can Oasis access the funds in my account or wallet?',
          answer:
            'No. With Dai, you - and only you - have access and control over your Dai. Dai uses blockchain technology to ensure the highest level of trust and transparency, and because of the way blockchain technology works, you ultimately get to decide just how secure you want it to be. This does mean you are your own security ultimately, so it is very important you keep access to your Dai and Oasis account secure.',
        },
        {
          question: 'I’ve found a bug? Where can I report issues?',
          answer:
            'In case you think you have found a bug critical or not, you can reach us by emailing Support@oasis.app and we will review your report with the highest priority.',
        },
      ],
    },
    {
      title: 'Buying Dai',
      id: 'buying-dai',
      questions: [
        {
          question: 'Can I buy Dai while using Dai Wallet?',
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
          question: 'Can I buy ETH on Dai Wallet to pay for my transaction fees?',
          answer:
            'Yes. Just like buying Dai, you can start the same process as you would to buy Dai, choose your third-party provider, and each offers an option to change Dai for ETH when you start the process.',
        },
      ],
    },
  ],
  cantFind: 'Can’t find what you’re looking for?',
  contactLink: 'Contact us here',
}
