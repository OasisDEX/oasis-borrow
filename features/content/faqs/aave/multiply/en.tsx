import { AppLink } from 'components/Links'
import { FaqLayout } from 'features/content/faqs/FaqLayout'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import React from 'react'
import { Text } from 'theme-ui'

export default () => (
  <FaqLayout
    learnMoreUrl={EXTERNAL_LINKS.KB.OPEN_MANAGE_MULTIPLY}
    contents={[
      {
        title: 'What is Summer.fi Multiply Aave?',
        body: (
          <Text>
            Summer.fi multiply with Aave is a feature that allows you to get increased exposure to
            your assets with one click. You can deposit supported collaterals into Aave and with the
            power of Summer.fi smart contracts you can multiply your exposure to it by borrowing
            USDC within Aave protocol.
          </Text>
        ),
      },
      {
        title: 'How does it work?',
        body: (
          <>
            <Text>
              When you open a new position you will select a collateral and a Loan to Value(LTV)
              according to your desired risk and reward, and in a single transaction, Summer.fi will
              deposit your collateral to Aave, borrow USDC and purchase more collateral with it,
              depositing it back into the protocol. This way, you will obtain increased exposure to
              your assets against USDC.
            </Text>
            <Text>
              To start you will need to create a
              <AppLink href={EXTERNAL_LINKS.KB.WHAT_IS_DPM} target="_blank">
                Smart Defi Account
              </AppLink>
              , each Summer.fi multiply with Aave position will use a single Smart Defi Account to
              isolate your position, this feature allows you to manage more than one account at Aave
              from a single wallet.
            </Text>
          </>
        ),
      },
      {
        title: 'What are the risks?',
        body: (
          <>
            <Text>
              With Multiply, you are exposed to increased volatility from your assets. This means
              you will get greater returns measured against your initial deposit in case it rises,
              but you will suffer increased losses in case the price goes against you. If your LTV
              goes above the liquidation threshold, you will be liquidated, suffering a penalty fee
              charged by the protocol. You should adjust your multiple to your preferred risk
              profile, move your risk up or down according to your needs and market conditions, and
              continually monitor your position to avoid liquidations. Aave has a buffer between the
              maximum LTV and the liquidation threshold to give you some time to repay your debt.
            </Text>
            <Text>
              Your position has risks associated with the underlying protocol: bugs in smart
              contracts and errors in oracle prices that force an incorrect liquidation. You should
              be aware that a lending protocol also has governance risk, this means that decisions
              made by the protocol can impact your position. It's expected to see changes to the
              interest rate curve, liquidation and LTV parameters, adding or removing support for
              collaterals. As Aave protocol is a unified liquidity pool, these changes could impact
              your position directly or indirectly.
            </Text>
          </>
        ),
      },
      {
        title: 'What are the differences between supported protocols for Summer.fi Multiply?',
        body: (
          <>
            <Text>
              For Summer.fi Multiply, you can choose between Maker and AAVE. The most important
              differences with each protocol are:
            </Text>
            <ol>
              <li>
                Maker has a 1-hour delay between oracle updates. This means that a position only
                becomes uncollateralized with a one-hour delay, allowing you more time to unwind
                your position. For Aave, liquidations are instantaneous, but this allows the
                protocol to have a lower penalty fee for liquidation. The liquidation penalty for
                each asset can be seen in the liquidation price tooltip. Maker uses its own oracle
                network to report prices, while Aave utilizes Chainlink services.
              </li>
              <li>
                Aave supports higher multiples and pays interest on the collateral deposited since
                it works with a single pool for lending and borrowing. This means that in cases
                where the protocol fails to properly deal with defaulting accounts and is left with
                bad debt, the risk is spread across all users of the protocol.
              </li>
              <li>
                Aave has, in general, support for different tokens both as collateral and debt,
                allowing you to multiply in more ways.
              </li>
            </ol>
            <Text>
              These are some of the main factors that you should consider when choosing an
              underlying protocol for Multiply. You can always ask more questions in our{' '}
              <AppLink href="https://discord.gg/oasisapp" target="_blank">
                Discord
              </AppLink>
              .
            </Text>
          </>
        ),
      },
      {
        title: 'How much does it cost?',
        body: (
          <>
            <Text>
              Summer.fi charges a fee per Multiply action of 0.2% over the required swap. We source
              free flash loans from multiple providers to guarantee the best execution. Your
              Multiply position will pay a variable borrowing fee to Aave and will get paid a
              variable lending fee for providing liquidity to Aave. You can see this in your 'Net
              Borrowing Cost' in the main view. As usual, Ethereum gas fees will apply, with the
              value dependent on the network conditions. Summer.fi doesn't charge anything for
              standard actions that you can make by using the underlying protocol, this includes
              borrowing, paying back debt, depositing or withdrawing collateral tokens.
            </Text>
          </>
        ),
      },
    ]}
  />
)
