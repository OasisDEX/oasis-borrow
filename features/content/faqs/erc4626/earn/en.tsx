import { FaqLayout } from 'features/content/faqs/FaqLayout'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import React from 'react'
import { Box, Text } from 'theme-ui'

export default () => (
  <FaqLayout
    learnMoreUrl={EXTERNAL_LINKS.DOCS.MORPHO_BLUE.HUB}
    noTitle={true}
    contents={[
      {
        title: 'Do I need to manage this MetaMorpho position?',
        body: (
          <Text as="p">
            This position risk is managed by the Vault curator. This means the Vault curator takes
            care of selecting the markets within Morpho Blue to get the best yield at the right
            risk.
          </Text>
        ),
      },
      {
        title: 'What are the risks?',
        body: (
          <Box as="ol">
            <Box as="li">
              Bad debt risk: Under high stress market conditions, the liquidations of the protocol
              could not perform as expect at all times. This could leave some market with bad debt
              which is socialized among all lenders in the market.
            </Box>
            <Box as="li">
              Curator risk: The strategy assumes that the curator as owner of the Vault performs its
              duties and manages the risk appropriately, taking into account all relevant risks
              parameters and market conditions.
            </Box>
            <Box as="li">
              Systemic risk: Smart contract bugs, and fatal errors in any of the protocols being
              used.
            </Box>
          </Box>
        ),
      },
      {
        title: 'Where does the yield come from?',
        body: (
          <Text as="p">
            The return comes from the interest paid from Morpho Blue borrowers in each underlying
            market. As the vault deposits on different markets, it earns an interest rate
            proportional to the allocation on each market.
          </Text>
        ),
      },
      {
        title: 'Where is my capital?',
        body: (
          <Text as="p">
            This Earn position deposits into MetaMorpho Vaults which in turn allocate the funds to
            different Morpho Blue markets according to the risk parameters set by the Vault Curator.
          </Text>
        ),
      },
      {
        title: 'How much does it cost?',
        body: (
          <Text as="p">
            Summer.fi charges no fee on this Earn position. Each MetaMorpho Vault has a different
            fee expressed in the position overview that's controlled by the Vault Curator, this fee
            is charged for the risk management work done by them.
          </Text>
        ),
      },
      {
        title: 'Is this a short or long-term position?',
        body: (
          <Text as="p">
            This is a long-term position that can be passively held assuming Curators handle risks
            of the position.
          </Text>
        ),
      },
    ]}
  />
)
