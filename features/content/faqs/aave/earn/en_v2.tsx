import { AppLink } from 'components/Links'
import { FaqLayout } from 'features/content/faqs/FaqLayout'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import React from 'react'
import { Heading, Text } from 'theme-ui'

export default () => (
  <FaqLayout learnMoreUrl={EXTERNAL_LINKS.KB.WHAT_YOU_SHOULD_KNOW_ABOUT_STETH}>
    <Heading as="h1">Do I need to manage this Aave position?</Heading>
    <Text variant="paragraph1">
      You need to monitor this position often to asses its liquidation risk and profitability.
      Changes in market conditions like the ratio of stETH/ETH or updates to the AAVE market could
      impact the returns.{' '}
      <AppLink href="https://summer.fi" target="_blank">
        Summer.fi
      </AppLink>{' '}
      will announce Governance changes from AAVE that affect this strategy. Since ETH interest rates
      are variable the profitability of this strategy changes with the demand to borrow ETH in AAVE.
    </Text>

    <Heading as="h1">What are the risks?</Heading>
    <ol>
      <li>
        Liquidation risk: If the price of stETH measured in ETH goes down the position will be at
        risk of liquidation. This could happen for multiple reasons, for example, users selling
        their STETH for ETH to pursue other strategies, perceived or realized Lido execution risk,
        and lower general liquidity. If this price goes below the liquidation ratio the position
        will be liquidated.
      </li>
      <li>
        Lower than expected returns: The strategy assumes that the returns from ETH staking minus
        the Lido fee will be higher than the cost of borrowing ETH in AAVE allowing users to
        multiply this exposure. This assumption might not hold in all circumstances and you should
        monitor the position to measure the profitability and desired risk.
      </li>
      <li>
        Systemic risk: Smart contract bugs, and fatal errors in any of the protocols being used.
        Read more here.
      </li>
    </ol>

    <Heading as="h1">How does it work?</Heading>
    <ol>
      <li>A free flash loan for Dai is taken from Maker and deposited to AAVE v2 protocol.</li>
      <li>ETH is borrowed to reach the desired multiple level.</li>
      <li>The borrowed ETH plus the users initial deposit is swapped to StETH through 1inch.</li>
      <li>The total StETH minus fee is deposited back into AAVE v2 to reach the final position</li>
      <li>Dai loaned is withdrawn from AAVE and paid back to Maker.</li>
      <li>The flash loan is paid back.</li>
    </ol>

    <Heading as="h1">Where does the yield come from?</Heading>
    <Text variant="paragraph1">
      The return comes first from the ETH staking yield provided by StETH. That yield is multiplied
      by increasing exposure to StETH by borrowing ETH. An ongoing cost of the variable ETH
      borrowing rate in AAVE must be continually paid. This means that the strategy remains
      profitable as long as the borrowing cost of ETH is lower than the returns from StETH.
    </Text>

    <Heading as="h1">Where is my capital?</Heading>
    <Text variant="paragraph1">
      This Earn position uses 3 protocols and the power of{' '}
      <AppLink href="https://summer.fi" target="_blank">
        Summer.fi
      </AppLink>{' '}
      smart contracts: All capital is deposited to AAVE v2 protocol and held there for the strategy
      to work. StETH represents ETH held by Lido, which in turn gives it to the node operators that
      perform the validator duties for Lido.
    </Text>

    <Heading as="h1">How much does it cost?</Heading>
    <Text variant="paragraph1">
      The Summer.fi fee is 0.20% of the amount swapped. This fee is paid on setup and on each
      strategy adjustment. This strategy pays interest on the ETH borrowed from AAVE. This variable
      fee is accounted for in the net APY, but it changes continually as the market demands more or
      less ETH. Users need to take into account gas costs related to the Ethereum network which vary
      with congestion and ETH price.
    </Text>

    <Heading as="h1">Is this a short or long-term position?</Heading>
    <Text variant="paragraph1">
      This is a long-term position that assumes that the borrowing rate of ETH in AAVE will be lower
      than the StETH yield and that the price of StETH will tend to trend in a range with respect to
      ETH. Once withdrawals are enabled from the beacon chain it's expected that the ratio of
      StETH/ETH will move in a tighter range.
    </Text>

    <Heading as="h1">How can I learn more?</Heading>
    <Text variant="paragraph1">
      You can visit our knowledge base page to dive deeply into this strategy. Or ask more in depth
      questions to our{' '}
      <AppLink href="https://discord.gg/oasisapp" target="_blank">
        community on Discord →
      </AppLink>
    </Text>
  </FaqLayout>
)
