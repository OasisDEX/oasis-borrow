import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { FaqLayout } from 'features/content/faqs/FaqLayout'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import React from 'react'
import { Text } from 'theme-ui'

export default () => (
  <FaqLayout
    learnMoreUrl={EXTERNAL_LINKS.DOCS.AJNA.HUB}
    noTitle={true}
    contents={[
      {
        title: 'Do I need to manage this Ajna position?',
        body: (
          <>
            <Text>
              You need to monitor this position to be sure your lending price is lower than the
              current external market price of the collateral token and that it's high enough to be
              providing liquidity in a range that gets paid interest. Lending in Ajna doesn't work
              the same as lending in other protocols and requires a more active approach to monitor
              collateral volatility, in turn Ajna has no risk from faulty oracles or misbehaving
              governance since there is none.
            </Text>
            <AppLink href={EXTERNAL_LINKS.DOCS.AJNA.HOW_TO_PICK_LENDING_PRICE}>
              <WithArrow>Read How to pick a right lending price</WithArrow>
            </AppLink>
          </>
        ),
      },
      {
        title: 'What are the risks?',
        body: (
          <>
            <Text>There are 4 main risks when lending in Ajna.</Text>
            <ol>
              <li>
                You are left with collateral tokens: If your lending price is close to market and
                the price of the collateral token goes below it, you will be left with only
                collateral tokens to claim. Your lending price acts as a limit order in that case.
              </li>
              <li>
                Unable to withdraw: During liquidations, the utilized part of the pool up to the
                amount of tokens being recovered from borrowers is frozen. This means that while
                liquidations last, your liquidity might not be available for withdrawal in all
                cases. Liquidations should last at least 6 hours, after which you will be able to
                withdraw normally if the liquidation was successful.
              </li>
              <li>
                Not receiving interest: Deposits below the minimum yield point will receive no
                interest, since these deposits are not actively lent out nor work as backup
                liquidity.
              </li>
              <li>
                System risk: Ajna is a new bold take in lending protocols, such innovation carries
                risk from smart contract bugs and design flaws, as the protocol gets used, and its
                design is battle tested confidence in the system will grow.
              </li>
            </ol>
            <AppLink href={EXTERNAL_LINKS.DOCS.AJNA.RISKS}>
              <WithArrow>Read more about Ajna Risks</WithArrow>
            </AppLink>
          </>
        ),
      },
      {
        title: 'How does it work?',
        body: (
          <Text>
            Ajna is a lending protocol with no oracles or governance. Since there is no governance
            to set parameters, the protocol relies on lenders properly setting their tokens at the
            correct lending price, which implies a certain Loan to Value ratio to get the right
            lending market values. At the same time, the lack of oracles means that the protocol
            must implement a novel liquidation mechanism where liquidators must post a bond previous
            to loan liquidations to guarantee that the external market price is effectively below
            the liquidation price of the loan. In this way both lenders and borrowers are
            incentivized, driven by market mechanism, to reach a successful loan, and thanks to this
            autonomous mechanism in Ajna any token can be lent or borrowed.
          </Text>
        ),
      },
      {
        title: 'Where does the yield come from?',
        body: (
          <Text>
            The yield comes from the interest rate charged to Ajna protocol Borrowers of the
            selected pool. This yield is annualized at current utilization rates. If the pool has a
            lot of demand and utilized liquidity goes up the rate will go up and if it has little
            use the rate will go down.
          </Text>
        ),
      },
      {
        title: 'What are the token rewards?',
        body: (
          <>
            <Text>
              Selected pools receive Summer.fi × Ajna rewards weekly. These rewards incentivize
              early adopters of Ajna who use Summer.fi Smart DeFi Account. It accrues automatically
              with no staking needed and can be claimed weekly after tokens are released.
            </Text>
            <AppLink href={EXTERNAL_LINKS.DOCS.AJNA.TOKEN_REWARDS}>
              <WithArrow>Read more about token rewards</WithArrow>
            </AppLink>
          </>
        ),
      },
      {
        title: 'How much does it cost?',
        body: (
          <Text>
            Lending in Ajna is free. The protocol charges a 1 day of interest for deposits below the
            active liquidity range to incentivize meaningful lending activity. This means you will
            pay in the no yield range and the backup liquidity range but nothing at the active
            liquidity lending range or above.
          </Text>
        ),
      },
    ]}
  />
)
