import { AppLink } from 'components/Links'
import { FaqLayout } from 'features/content/faqs/FaqLayout'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import React from 'react'
import { Text } from 'theme-ui'

export default () => (
  <FaqLayout
    learnMoreUrl={EXTERNAL_LINKS.DOCS.MORPHO_BLUE.HUB}
    noTitle={true}
    contents={[
      {
        title: 'What is Summer.fi Borrow with Morpho?',
        body: (
          <>
            <Text as="p" sx={{ mb: 3 }}>
              Summer.fi allows you to easily borrow against your crypto utilizing Morpho. A protocol
              that allows you to borrow at higher LTVs, since collateral is deposited in the
              protocol directly, and not lent out.
            </Text>
            <Text as="p" sx={{ mb: 3 }}>
              You'll be able to borrow against your crypto by simply choosing a pair with a
              collateral token and borrow token.
            </Text>
            <Text as="p">
              To start borrowing, enter deposit amount of collateral and a borrow amount of debt.
              Morpho loans are perpetual with a variable interest rate and can be easily managed on
              Summer.fi.
            </Text>
          </>
        ),
      },
      {
        title: 'How does it work?',
        body: (
          <>
            <Text>Borrowing on Summer.fi with Morpho happens in 5 Simple Steps.</Text>
            <ol>
              <li>Create a Smart DeFi Account that makes position management easier.</li>
              <li>Open a new position with Collateral and and Amount to borrow.</li>
              <li>Choose a Loan to Value (LTV) and Liq Price according to your risk tolerance.</li>
              <li>Confirm deposit of collateral to Morpho, and borrow your chosen token.</li>
              <li>
                Borrowed token amount will be received in your wallet after successful transaction.
              </li>
            </ol>
          </>
        ),
      },
      {
        title: 'What are the risks?',
        body: (
          <>
            <Text>
              The most immediate risk your position will face is that of liquidation. Liquidation
              risk is determined by the price of the collateral asset relative to your chosen
              liquidation price and LTV. If the price drops below your liquidation price, you will
              be liquidated, suffering a penalty fee charged by the protocol. You should adjust your
              risk to your preferred profile, move your risk up or down according to your needs and
              market conditions, and continually monitor your position to avoid liquidations. Your
              position also has risks associated with the underlying protocol: bugs in smart
              contracts and errors in oracle prices that force an incorrect liquidation. Morpho
              borrowing has no risk associated with Governance, once deployed each market is
              isolated and its parameters are fixed.
            </Text>
          </>
        ),
      },

      {
        title: 'What are the benefits of supported protocols for Summer.fi Borrow?',
        body: (
          <>
            <Text>
              For Summer.fi Borrow, you can choose between Morpho, Maker, AAVE and Ajna. The most
              important benefits for Morpho are:
            </Text>
            <ol>
              <li>
                <strong>Higher Multiple</strong>: Morpho creates isolated markets. Unlike
                multi-asset pools which must consider the riskiest asset in the basket, liquidation
                parameters for each market only need to consider the loan and collateral assets.
                Markets can have higher liquidation LTV as a result.
              </li>
              <li>
                <strong>Wider range of markets</strong>: Morpho features permissionless asset
                listing. Markets with collateral and loan assets and risk parametrization can be
                created. This will allow borrowers to unlock liquidity on assets not listed
                elsewhere.
              </li>
              <li>
                <strong>Improved interest rates</strong>: Collateral assets are not lent out to
                borrowers. This allows Morpho to offer higher capital utilization. Moreover, Morpho
                Blue is fully autonomous, so it does not need to introduce fees to cover costs for
                platform maintenance and risk managers.
              </li>
              <li>
                There are some tradeoffs regarding MaxLTV, governance risk, oracle selection and
                interest rate model between each available protocol on Summer.fi to understand
                better the differences you can read more on our{' '}
                <AppLink href={EXTERNAL_LINKS.KB.HELP}>knowledge base</AppLink>.
              </li>
            </ol>
            <Text>
              These are some of the main factors that you should consider when choosing an
              underlying protocol for Borrow. You can always ask more questions in our{' '}
              <AppLink href={EXTERNAL_LINKS.DISCORD}>Discord</AppLink>.
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
            the best execution. Your Borrow position will pay a variable borrowing fee to Morpho
            Blue. You can see this in your Borrowing Cost in the main view. As usual, Ethereum gas
            fees will apply, with the value dependent on the network conditions.
          </Text>
        ),
      },
    ]}
  />
)
