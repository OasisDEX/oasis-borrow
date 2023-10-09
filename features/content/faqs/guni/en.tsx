import { AppLink } from 'components/Links'
import { FaqLayout } from 'features/content/faqs/FaqLayout'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import React from 'react'
import { Text } from 'theme-ui'

export default () => (
  <FaqLayout
    learnMoreUrl={EXTERNAL_LINKS.KB.EARN_DAI_GUNI_MULTIPLY}
    contents={[
      {
        title: 'Do I need to manage this Earn position?',
        body: (
          <Text>
            Users should regularly check whether market changes have affected the position, in terms
            of profit, governance updates, and shifts in fee tiers. At the moment the Maker protocol
            has disabled liquidations for GUNI but they could be enabled in the future. Such changes
            will be announced in
            <AppLink href="https://forum.makerdao.com/">Maker forums</AppLink> and in
            <AppLink href="https://discord.gg/oasisapp">Summer.fi communication channels</AppLink>.
          </Text>
        ),
      },
      {
        title: 'What are the risks?',
        body: (
          <ol>
            <li>
              Lower than expected returns: Collected fees from the Uniswap V3 position are dependent
              on the volume that passes through that pool and as such is a variable return that’s
              reliant on market conditions and the ratio between liquidity and volume. Users will
              need to monitor their position to be sure that the rate of return exceeds the
              stability fee paid to Maker and the costs paid to set up and close the Earn position.
            </li>
            <li>
              Liquidations: for this Vault, they have been disabled by the Maker protocol at the
              moment. This is not guaranteed since Maker could decide to enable them, users should
              monitor their positions to ensure the growth of the collateral exceeds the growth of
              the debt thanks to Uniswap V3 fees return.
            </li>
            <li>
              Systemic risk: Blockchains have unavoidable risks arising from smart contract bugs or
              fatal errors in any protocols being used.
            </li>
          </ol>
        ),
      },
      {
        title: 'How does it work',
        body: (
          <ol>
            <li>Dai is flashloaned from Maker, enough to reach the desired strategy multiple.</li>
            <li>
              Dai is swapped with USDC in the proportion needed for the Arrakis Uniswap v3 position
              in the DAI/USDC pool.
            </li>
            <li>
              Dai and USDC are locked in Arrakis Uniswap v3 position manager. This deposit gives
              shares representing the deposited amount.
            </li>
            <li>
              The shares called GUNI DAI/USDC are locked in a Maker Vault and Dai is borrowed
              against this collateral up to the maximum collateralization ratio possible.
            </li>
            <li>The flashloan is paid back.</li>
          </ol>
        ),
      },
      {
        title: 'Where does the yield come from?',
        body: (
          <Text>
            Uniswap users pay the liquidity providers when trading DAI/USDC and this return is
            multiplied thanks to Maker Vaults. Since the position is multiplied up to 50 times, the
            returns are much greater than just putting up liquidity in Uniswap V3 directly.
          </Text>
        ),
      },
      {
        title: 'Where is my capital?',
        body: (
          <Text>
            The Earn position uses 3 protocols and the power of Summer.fi smart contracts: Uniswap
            V3 is the underlying yield source. Arrakis is the Uniswap V3 position manager and Maker
            is used to multiply exposure to the Uniswap returns.
          </Text>
        ),
      },
      {
        title: 'How much does it cost?',
        body: (
          <Text>
            The Summer.fi fee is 0.005% of the amount swapped and averages around 0.125% of the
            initial deposit while setting up the Vault. The closing fee is 0. This strategy pays
            interest on the debt to Maker. This stability fee is accounted for in the net APY. Users
            need to take into account gas costs related to the Ethereum network which vary with
            congestion and ETH price
          </Text>
        ),
      },
      {
        title: 'Is this a short or long-term position?',
        body: (
          <Text>
            This is a long-term position that assumes that the volume of DAI/USDC going through
            Uniswap V3 will trend up since that's the yield source. In general, users should expect
            this position to be profitable as long as demand to use DAI or USDC grows and Uniswap V3
            remains the prime venue for these swaps. As time goes by the fixed costs for setting up
            the position will be paid off. The longer you stay in the position, the higher profit if
            all assumptions hold.
          </Text>
        ),
      },
    ]}
  />
)
