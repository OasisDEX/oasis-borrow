import type { ActionPillsItem } from 'components/ActionPills'
import { ActionPills } from 'components/ActionPills'
import { TokensGroup } from 'components/TokensGroup'
import { useErc4626CustomState } from 'features/omni-kit/protocols/erc-4626/contexts'
import { erc4626EstimatedMarketCaps } from 'features/omni-kit/protocols/erc-4626/settings'
import { formatUsdValue } from 'helpers/formatters/format'
import { Trans } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Box, Text } from 'theme-ui'

interface Erc4626EstimatedMarketCapProps {
  token: string
}

export const Erc4626EstimatedMarketCap: FC<Erc4626EstimatedMarketCapProps> = ({ token }) => {
  const {
    dispatch,
    state: { estimatedMarketCap },
  } = useErc4626CustomState()

  return (
    <Box sx={{ mb: 2, pb: '24px', borderBottom: '1px solid', borderBottomColor: 'neutral20' }}>
      <Text variant="paragraph4" as="p" sx={{ mb: 2 }}>
        <Trans
          i18nKey="erc-4626.position-page.common.estimated-market-cap"
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
        active={estimatedMarketCap.toString()}
        items={erc4626EstimatedMarketCaps.reduce<ActionPillsItem[]>(
          (list, cap) => [
            ...list,
            {
              id: cap.toString(),
              label: formatUsdValue(cap),
              action: () => {
                dispatch({ type: 'estimated-market-cap-change', estimatedMarketCap: cap })
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
