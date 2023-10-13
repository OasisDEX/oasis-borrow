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
        title: 'How does borrowing work?',
        body: (
          <>
            <Text>
              Ajna is a unique lending protocol with no oracles and no governance. Each Borrow
              position is tied to a single collateral/debt pair. You can borrow up to the dynamic
              max LTV offered by the collective of pool lenders. The dynamic max LTV is set by the
              market activity, completely autonomously from any governance. Volatility, market
              demand and asset risk evaluation done by lenders converges on an offered max LTV, even
              if this changes, you, as a borrower are in control at all times of your liquidation
              price. Without oracles, liquidators are forced to post a bond to ensure liquidations
              only happen on bad loans. Rates are variable set by the pool utilization, there is no
              repayment schedule and listing of tokens happens permissionless.
            </Text>
            <AppLink href={EXTERNAL_LINKS.DOCS.AJNA.HOW_TO_BORROW}>
              <WithArrow>Read more about borrowing on Ajna</WithArrow>
            </AppLink>
          </>
        ),
      },
      {
        title: 'What are the risks?',
        body: (
          <>
            <Text>There are 4 main risks when borrowing in Ajna:</Text>
            <ol>
              <li>
                <strong>Liquidations</strong>: If the value of your collateral goes down or the
                value of your debt goes up your position will be liquidated to recover the borrowed
                amount. Penalties apply to liquidated loans. You must monitor your liquidation price
                to make sure the external market price is above it.
              </li>
              <li>
                <strong>Unsuccessful liquidations</strong>: If a loan is liquidated, you might be
                left with some collateral after the debt is recovered by the protocol and the
                penalties are paid. But during times of high volatility, the protocol might not
                recover all the debt or the price at which your collateral is sold could be
                suboptimal. This means that in some cases you might not recover any collateral after
                liquidations.
              </li>
              <li>
                <strong>Spurious liquidations</strong>: Loans can be liquidated at any moment in
                Ajna, but the protocol works by forcing liquidators to post a bond to liquidate a
                loan to avoid spurious liquidations. In some cases, liquidators might have
                incentives to force a spurious liquidation if the losses they take are lower than
                some other gain: For example, they were paid to grief you. This is not expected to
                happen to regular users.
              </li>
              <li>
                <strong>Systemic risk</strong>: Ajna is a new bold take in lending protocols, such
                innovation carries risk from smart contract bugs and design flaws, as the protocol
                gets used, and its design is battle tested confidence in the system will grow.
              </li>
            </ol>
            <AppLink href={EXTERNAL_LINKS.DOCS.AJNA.RISKS}>
              <WithArrow>Read more about Ajna Risks</WithArrow>
            </AppLink>
          </>
        ),
      },
      {
        title: 'What are the liquidation penalties?',
        body: (
          <>
            <Text>There are 2 liquidation penalties:</Text>
            <ol>
              <li>
                <strong>90 days of interest</strong>: Once a loan is scheduled for liquidation.
                After this, they have 1-hour grace period where they can repay or recollateralize
                their loan.
              </li>
              <li>
                <strong>7% of the total debt</strong>: After the grace period has concluded, a new
                penalty is applied as liquidation starts. During liquidations, users can still repay
                or recollateraize their position. If a loan is recollateralized during a
                liquidation, it will be removed from the liquidation engine. (penalties still apply
                for partial liquidations)
              </li>
            </ol>
          </>
        ),
      },
      {
        title: 'How is the borrow rate set?',
        body: (
          <Text>
            Interest rates are set autonomously based on utilization, with a 12 hours adjustment
            period. On each adjustment period, the interest rate can move at most 10%. This means
            that if the borrow rate is 2% after 24 hours, 2 adjustments have happened with the upper
            limit being 2.42% and the lower limit 1.62%.
          </Text>
        ),
      },
      {
        title: 'What happens if my loan gets liquidated?',
        body: (
          <Text>
            If your loan is scheduled for liquidation, 90 days of interest penalty will be applied
            first. You will have 1 hour to cover your debt or add more collateral. After that time
            has passed, the loan will be moved to a liquidation auction where the collateral will be
            sold to cover the debt and a 7% penalty will be applied. If the loan is successfully
            liquidated, the debt will be recovered and any collateral left will be left for you to
            withdraw. Liquidations can happen partially and in cases where a loan collateralized
            during the auction it will be moved out of it. At all times during this process you can
            repay your debt or add more collateral to recollateralize your position.
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
          <>
            <Text>The following costs are associated with borrowing in Ajna:</Text>
            <ol>
              <li>
                <strong>Origination Fee</strong>: The origination fee is calculated as the greater
                of the current annualized borrower interest rate divided by 52 (one week of
                interest) or 5 bps multiplied by the loan’s new debt. This applies to each new debt
                action
              </li>
              <li>
                <strong>Borrow Rate</strong>: Set by pool utilization, this is an ongoing cost of
                borrowing that’s variable and updates up to 10% every 12 hours.
              </li>
              <li>
                <strong>Liquidation Penalties</strong>: In case of liquidation, 90 days of interest
                are applied as first penalty during a 1 hour grace period. Afterwards the loan
                starts to be liquidated and a 7% penalty is added to the total debt.
              </li>
              <li>
                <strong>Transaction fees</strong>: Standard gas fees applies to the usage of the
                protocol and are determined by network demand.
              </li>
              <li>
                <strong>Summer.fi Fees</strong>: Basic borrow actions such as borrow and repay debt,
                add or withdraw collateral are free. Advance actions and automations have their own
                associated fee.
              </li>
            </ol>
          </>
        ),
      },
      {
        title: 'Is there a minimum or maximum I can borrow?',
        body: (
          <Text>
            The minimum borrow size is 10% of the average loan size. The maximum loan is determined
            by the total liquidity in the pool. When you simulate a new loan, you will be able to
            see how much you need to borrow to open a new position and how much you can borrow with
            your collateral or if you are limited by the pool liquidity.
          </Text>
        ),
      },
    ]}
  />
)
