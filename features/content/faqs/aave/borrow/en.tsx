import { AppLink } from 'components/Links'
import { FaqLayout } from 'features/content/faqs/FaqLayout'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { Heading, Text } from 'theme-ui'

export default () => (
  <FaqLayout learnMoreUrl={EXTERNAL_LINKS.KB.BORROW}>
    <Heading variant="h5">What is Summer.fi Borrow with Aave?</Heading>
    <Text variant="paragraph1">
      Summer.fi borrow with Aave allows you to easily borrow against your crypto collateral. You
      choose a pair with a collateral token and a borrow token, and you enter a deposit amount and
      an amount to borrow to get started. You can use the borrowed amount in any way. Aave v3 loans
      are perpetual with a variable interest rate. The collateral is deposited in Aave v3 on which
      you receive some interest, whilst you are paying an interest on the amount borrowed.
    </Text>

    <Heading variant="h5">How does it work?</Heading>

    <Text variant="paragraph1">
      When you open a new position you will select a collateral and an amount to borrow. Thereby
      determining your Loan to Value(LTV) according to your desired risk and reward. Within the
      transaction you will deposit your collateral to Aave v3, and borrow the chosen debt. When the
      transaction is successful, you will obtain the borrowed amount in your wallet.
    </Text>

    <Text variant="paragraph1">
      To start you will need to create a
      <AppLink href={EXTERNAL_LINKS.KB.WHAT_IS_DPM} target="_blank">
        Smart Defi Account
      </AppLink>
      , each Summer.fi Borrow with Aave position will use a single Smart Defi Account to isolate
      your position, this feature allows you to manage more than one account at Aave from a single
      wallet.
    </Text>

    <Heading variant="h5">What are the risks?</Heading>

    <Text variant="paragraph1">
      When borrowing you need to look after your liquidation price & LTV. If your LTV goes above the
      liquidation threshold, you will be liquidated, suffering a penalty fee charged by the
      protocol. You should adjust your risk to your preferred profile, move your risk up or down
      according to your needs and market conditions, and continually monitor your position to avoid
      liquidations. Aave has a buffer between the maximum LTV and the liquidation threshold to give
      you some time to repay your debt.
    </Text>
    <Text variant="paragraph1">
      Your position has risks associated with the underlying protocol: bugs in smart contracts and
      errors in oracle prices that force an incorrect liquidation. You should be aware that the Aave
      protocol also has governance risk, this means that decisions made by the protocol can impact
      your position. It's expected to see changes to the interest rate curve, liquidation and LTV
      parameters, adding or removing support for collaterals. As Aave protocol is a unified
      liquidity pool, these changes could impact your position directly or indirectly.
    </Text>

    <Heading variant="h5">
      What are the differences between supported protocols for Summer.fi Borrow?
    </Heading>

    <Text variant="paragraph1">
      For Summer.fi Borrow, you can choose between Maker, AAVE, and Ajna. The most important
      differences with each protocol are:
    </Text>
    <ol>
      <li>
        Maker & Aave both use oracles. Maker has a 1-hour delay between oracle updates. This means
        that a position only becomes uncollateralized with a one-hour delay, allowing you more time
        to unwind your position. For Aave, liquidations are instantaneous, but this allows the
        protocol to have a lower penalty fee for liquidation. The liquidation penalty for each asset
        can be seen in the liquidation price tooltip. Maker uses its own oracle network to report
        prices, while Aave utilizes Chainlink services. Ajna does not use internal oracles.
      </li>
      <li>
        Aave supports higher multiples and pays interest on the collateral deposited since it works
        with a single pool for lending and borrowing. This means that in cases where the protocol
        fails to properly deal with defaulting accounts and is left with bad debt, the risk is
        spread across all users of the protocol.
      </li>
      <li>
        Aave has, in general, support for different tokens both as collateral and debt, allowing you
        to borrow different tokens.
      </li>
    </ol>
    <Text variant="paragraph1">
      These are some of the main factors that you should consider when choosing an underlying
      protocol for Borrow. You can always ask more questions in our
      <AppLink href="https://discord.gg/oasisapp" target="_blank">
        Discord
      </AppLink>
    </Text>

    <Heading variant="h5">How much does it cost?</Heading>
    <Text variant="paragraph1">
      Depositing and borrowing actions are completely free of charge!
    </Text>
    <Text variant="paragraph1">
      When you are using the one-click risk adjustment actions available in multiply, Summer.fi
      charges a fee of 0.2% over the required swap. We source free flash loans from multiple
      providers to guarantee the best execution. Your Borrow position will pay a variable borrowing
      fee to Aave and will get paid a variable lending fee for providing liquidity to Aave. You can
      see this in your 'Net Borrowing Cost' in the main view. As usual, Ethereum gas fees will
      apply, with the value dependent on the network conditions.
    </Text>
  </FaqLayout>
)
