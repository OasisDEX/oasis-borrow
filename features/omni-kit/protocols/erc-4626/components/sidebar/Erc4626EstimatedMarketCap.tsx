import BigNumber from 'bignumber.js'
import type { ActionPillsItem } from 'components/ActionPills'
import { ActionPills } from 'components/ActionPills'
import { TokensGroup } from 'components/TokensGroup'
import { useErc4626CustomState } from 'features/omni-kit/protocols/erc-4626/contexts'
import type { Erc4626PricePicker } from 'features/omni-kit/protocols/erc-4626/types'
import { formatUsdValue } from 'helpers/formatters/format'
import { Trans } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Box, Text } from 'theme-ui'

interface Erc4626EstimatedMarketPriceProps {
  pricePicker: Erc4626PricePicker
}

export const Erc4626EstimatedMarketPrice: FC<Erc4626EstimatedMarketPriceProps> = ({
  pricePicker: { marketCap, prices, token },
}) => {
  const {
    dispatch,
    state: { estimatedPrice },
  } = useErc4626CustomState()

  return (
    <Box sx={{ mb: 2, pb: '24px', borderBottom: '1px solid', borderBottomColor: 'neutral20' }}>
      <Text variant="paragraph4" as="div" sx={{ mb: 2 }}>
        <Trans
          i18nKey={
            marketCap
              ? 'erc-4626.position-page.common.estimated-market-cap'
              : 'erc-4626.position-page.common.estimated-price'
          }
          components={{
            icon: (
              <TokensGroup
                tokens={[token]}
                forceSize={16}
                sx={{ display: 'inline-block', verticalAlign: 'text-bottom' }}
              />
            ),
          }}
          values={{ token }}
        />
      </Text>
      <ActionPills
        active={estimatedPrice.toString()}
        items={prices.reduce<ActionPillsItem[]>(
          (list, price) => [
            ...list,
            {
              id: price.toString(),
              label: formatUsdValue(
                new BigNumber(marketCap ? marketCap * price : price),
                marketCap ? 0 : undefined,
              ),
              action: () => {
                dispatch({ type: 'estimated-price-change', estimatedPrice: new BigNumber(price) })
              },
            },
          ],
          [],
        )}
        variant="tertiary"
      />
    </Box>
  )
}
