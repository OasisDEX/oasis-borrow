import { AppLink } from 'components/Links'
import { FaqLayout } from 'features/content/faqs/FaqLayout'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import React from 'react'
import { Text } from 'theme-ui'

export default () => (
  <FaqLayout
    learnMoreUrl={EXTERNAL_LINKS.KB.HELP}
    contents={[
      {
        title: 'How does it work?',
        body: (
          <Text>
            When you login to Summer.fi and deposit into the Dai Savings Rate Earn Strategy, you
            will be locking your DAI into a Smart Contract which will accrue more DAI at the shown
            annual percentage yield (APY). MakerDAO pays to deposits in the Dai Saving Rate the
            shown APY continuously on every block. You can deposit as much as you want and withdraw
            at any moment. There are no lock-ups and no fees for using the Dai Savings Rate.
          </Text>
        ),
      },
      {
        title: 'Do I need to manage this Earn position?',
        body: (
          <Text>
            You don't need to manage this positions, you will Earn more Dai at the rate shown
            continuously until the rate is adjusted by MakerDAO. Rate could be adjusted up or down
            without prior notice, in general rate adjustments will be announced in advance, and we
            will communicate the changes in all our channels such as Discord or Twitter. You don't
            need to do anything if the Dai Savings Rate changes. You can leave your Dai in the DSR
            as long for as long as you see fit.
          </Text>
        ),
      },
      {
        title: 'Where does the yield come from?',
        body: (
          <Text>
            The yield comes from the profits generated by MakerDAO. Since Maker wants Dai to be used
            extensively in DeFi it has a mechanism for incentivizing users to hold Dai.
            Redistributing a part of the profits of MakerDAO for the Dai Savings Rate makes Dai
            grow. To understand the DSR, it could be compared to base rates of different fiat
            currencies since the yield comes directly from the entity that works to back the coin.
            This, in turn, has the same effect as what happens in the world of currencies: users are
            incentivized to swap other coins with no base rate for Dai. This increases the demand
            and supply of Dai making it more used, which is the end goal of Maker: to have DAI as a
            leading stablecoin in DeFi.
          </Text>
        ),
      },
      {
        title: 'What are the risks?',
        body: (
          <ol>
            <li>
              **1.Lower than expected returns:** Maker makes no promise of how long the Dai Savings Rate
              will be at the shown level. If the Dai Savings Rate changes, users can leave their
              money deposited there until the rate changes again, decide to withdraw or deposit
              more. The changes only affect the rate of earning, the principal deposited is always
              available for withdrawal. Dai in the DSR has no lockup, money is not lent out or used
              in any fashion.
            </li>
            <li>
              **2.Systemic risk:** Summer.fi works tirelessly to have the safest and most trusted platform
              to deploy capital and conducts regular audits of its contracts and places security as
              the top priority, nevertheless blockchains have unavoidable risks arising from smart
              contract bugs or fatal errors in any protocols being used.
            </li>
          </ol>
        ),
      },
      {
        title: 'Where is my capital?',
        body: (
          <>
            <Text>
              Your Dai is deposited into a 
              <AppLink
                href=" https://etherscan.io/address/0x197E90f9FAD81970bA7976f33CbD77088E5D7cf7#code"
                target="_blank"
              >
                dedicated contract
              </AppLink>{' '}
              within the Maker Protocol commonly referred to as the Dai Savings Rate.
            </Text>
          </>
        ),
      },
      {
        title: 'How much does it cost?',
        body: (
          <Text>
            This Earn Strategy is free of charge, all you have to pay for are the gas fees for each
            transaction.
          </Text>
        ),
      },
      {
        title: 'Is this a short or long-term position?',
        body: (
          <Text>
            This is a long-term position, you can leave your Dai in the Dai Saving Rate contract for
            as long as you need or wish to. Even in cases where Maker reduces the Dai Savings Rate
            your Dai will remain there until you withdraw it.
          </Text>
        ),
      },
      {
        title: 'How to see my sDAI balance in my wallet',
        body: (
          <Text>
            If your sDAI balance is not visible in your wallet, you can import the contract -
            <AppLink href="https://etherscan.io/token/0x83f20f44975d03b1b09e64809b757c47f942beea" target="_blank">sDAI Contract Address</AppLink>
          </Text>
        ),
      },
      {
        title: 'How can I learn more?',
        You can visit our{' '}
            <AppLink href="https://discord.gg/summerfi" target="_blank">
              Discord
            </AppLink>{' '}
            to ask more questions to our community or the team.
        ),
      },
    ]}
  />
)
