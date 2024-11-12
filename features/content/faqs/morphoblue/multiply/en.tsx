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
        title: 'What is Summer.fi Multiply Morpho?',
        body: (
          <Text as="p" sx={{ mb: 3 }}>
            Summer.fi multiply with Morpho is a feature that allows you to get increased exposure to
            your assets with one click. You can deposit supported collaterals into Morpho and with
            the power of Summer.fi smart contracts you can multiply your exposure to it by borrowing
            debt within Morpho protocol and gaining extra exposure to your collateral.
          </Text>
        ),
      },
      {
        title: 'How does it work?',
        body: (
          <Text>
            When you open a new position you will select a collateral and a Loan to Value(LTV)
            according to your desired risk and reward, and in a single transaction, Summer.fi will
            deposit your collateral to Morpho, borrow the selected debt token and purchase more
            collateral with it, depositing it back into the protocol. This way, you will obtain
            increased exposure to your assets. To start, you will need to create a{' '}
            <AppLink href={EXTERNAL_LINKS.KB.WHAT_IS_DPM}>Smart Defi Account</AppLink>, used for all
            your Morpho positions.
          </Text>
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
              Multiply has no risk associated with Governance, once deployed each market is isolated
              and its parameters are fixed.
            </Text>
          </>
        ),
      },

      {
        title: 'What are the benefits of supported protocols for Summer.fi Multiply?',
        body: (
          <>
            <Text>
              For Summer.fi Multiply, you can choose between Morpho, Maker, AAVE and Ajna. The most
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
              underlying protocol for Multiply. You can always ask more questions in our{' '}
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
            the best execution. Your Multiply position will pay a variable borrowing fee to Morpho
            Blue. You can see this in your Borrowing Cost in the main view. As usual, Ethereum gas
            fees will apply, with the value dependent on the network conditions.
          </Text>
        ),
      },
    ]}
  />
)
