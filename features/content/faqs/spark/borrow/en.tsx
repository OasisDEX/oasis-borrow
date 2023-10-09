import { AppLink } from 'components/Links'
import { FaqLayout } from 'features/content/faqs/FaqLayout'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import React from 'react'
import { Text } from 'theme-ui'

export default () => (
  <FaqLayout
    learnMoreUrl={EXTERNAL_LINKS.KB.BORROW}
    contents={[
      {
        title: 'What is Summer.fi Borrow with Spark?',
        body: (
          <Text>
            Summer.fi borrow with Spark allows you to easily borrow against your crypto collateral.
            You choose a pair with a collateral token and a borrow token, and you enter a deposit
            amount and an amount to borrow to get started. You can use the borrowed amount in any
            way. Spark loans are perpetual, with a predictable interest rate for borrowing DAI.
            Borrowing other tokens has a variable interest rate. The collateral is deposited in
            Spark on which you receive some interest, whilst you are paying an interest on the
            amount borrowed.
          </Text>
        ),
      },
      {
        title: 'How does it work?',
        body: (
          <>
            <Text>
              When you open a new position you will select a collateral and an amount to borrow.
              Thereby determining your Loan to Value(LTV) according to your desired risk and reward.
              Within the transaction you will deposit your collateral to Spark, and borrow the
              chosen debt. When the transaction is successful, you will obtain the borrowed amount
              in your wallet.
            </Text>
            <Text>
              To start you will need to create a
              <AppLink href={EXTERNAL_LINKS.KB.WHAT_IS_DPM} target="_blank">
                Smart Defi Account
              </AppLink>
              , each Summer.fi Borrow with Spark position will use a single Smart Defi Account to
              isolate your position, this feature allows you to manage more than one account at
              Spark from a single wallet.
            </Text>
          </>
        ),
      },
      {
        title: 'What are the risks?',
        body: (
          <>
            <Text>
              When borrowing you need to look after your liquidation price & LTV. If your LTV goes
              above the liquidation threshold, you will be liquidated, suffering a penalty fee
              charged by the protocol. You should adjust your risk to your preferred profile, move
              your risk up or down according to your needs and market conditions, and continually
              monitor your position to avoid liquidations. Spark has a buffer between the maximum
              LTV and the liquidation threshold to give you some time to repay your debt.
            </Text>
            <Text>
              Your position has risks associated with the underlying protocol: bugs in smart
              contracts and errors in oracle prices that force an incorrect liquidation. You should
              be aware that the Spark protocol also has governance risk, this means that decisions
              made by the protocol can impact your position. It's expected to see changes to the
              interest rate curve, liquidation and LTV parameters, adding or removing support for
              collaterals. As Spark protocol is a unified liquidity pool, these changes could impact
              your position directly or indirectly.
            </Text>
          </>
        ),
      },
      {
        title: 'What are the differences between supported protocols for Summer.fi Borrow?',
        body: (
          <>
            <Text>
              For Summer.fi Borrow, you can choose between Maker, AAVE, Spark and Ajna. Spark
              protocol is a fork of Aave v3, governed by a sub-division of MakerDAO. The main
              difference between Spark & Aave is that the rate for borrowing DAI is not fluctuating
              with every deposit, but is predictably set by the Maker governance. It changes about
              every two weeks. The most important differences with each protocol are:
            </Text>
            <ol>
              <li>
                Maker, Aave, Spark use oracles. Maker has a 1-hour delay between oracle updates.
                This means that a position only becomes uncollateralized with a one-hour delay,
                allowing you more time to unwind your position. For Aave and Spark, liquidations are
                instantaneous, but this allows the protocol to have a lower penalty fee for
                liquidation. The liquidation penalty for each asset can be seen in the liquidation
                price tooltip. Maker uses its own oracle network to report prices, while Aave &
                Spark utilizes Chainlink services. Ajna does not use internal oracles.
              </li>
              <li>
                Aave and Spark support higher multiples and pays interest on the collateral
                deposited since it works with a single pool for lending and borrowing. This means
                that in cases where the protocol fails to properly deal with defaulting accounts and
                is left with bad debt, the risk is spread across all users of the protocol.
              </li>
              <li>
                Aave has, in general, support for different tokens both as collateral and debt,
                allowing you to borrow different tokens.
              </li>
            </ol>
            <Text>
              These are some of the main factors that you should consider when choosing an
              underlying protocol for Borrow. You can always ask more questions in our
              <AppLink href="https://discord.gg/oasisapp" target="_blank">
                Discord
              </AppLink>
            </Text>
          </>
        ),
      },
      {
        title: 'How much does it cost?',
        body: (
          <Text>
            Depositing and borrowing actions are completely free of charge! When you are using the
            one-click risk adjustment actions available in multiply, Summer.fi charges a fee of 0.2%
            over the required swap. We source free flash loans from multiple providers to guarantee
            the best execution. Your Borrow position will pay a variable borrowing fee to Spark and
            will get paid a variable lending fee for providing liquidity to Spark. You can see this
            in your 'Net Borrowing Cost' in the main view. As usual, Ethereum gas fees will apply,
            with the value dependent on the network conditions.
          </Text>
        ),
      },
    ]}
  />
)
