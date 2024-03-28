import type BigNumber from 'bignumber.js'
import { getTokenGuarded } from 'blockchain/tokensMetadata'
import { AssetsResponsiveTable } from 'components/assetsTable/AssetsResponsiveTable'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import type { AssetsTableRowData } from 'components/assetsTable/types'
import { DetailsSection } from 'components/DetailsSection'
import type { Erc4626Claims } from 'features/omni-kit/protocols/erc-4626/helpers/getErc4626Claims'
import { formatCryptoBalance, formatUsdValue } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Button, Flex, Text } from 'theme-ui'

interface Erc4626VaultRewardsProps extends Erc4626Claims {
  prices: {
    [key: string]: BigNumber
  }
}

export const Erc4626VaultRewards: FC<Erc4626VaultRewardsProps> = ({ claims, prices, tx }) => {
  const { t } = useTranslation()

  const rows = claims.reduce<AssetsTableRowData[]>(
    (sum, { claimable, earned, token }) => [
      ...sum,
      {
        items: {
          token: (
            <AssetsTableDataCellAsset
              asset={token}
              icons={[token]}
              description={getTokenGuarded(token)?.name}
            />
          ),
          rewardsEarned: (
            <>
              {formatCryptoBalance(earned)} {token}
              {prices[token] && (
                <>
                  <br />
                  <Text variant="paragraph3" sx={{ color: 'neutral80' }}>
                    {formatUsdValue(earned.times(prices[token]))}
                  </Text>
                </>
              )}
            </>
          ),
          claimableNow: (
            <>
              {formatCryptoBalance(claimable)} {token}
              {prices[token] && (
                <>
                  <br />
                  <Text variant="paragraph3" sx={{ color: 'neutral80' }}>
                    {formatUsdValue(claimable.times(prices[token]))}
                  </Text>
                </>
              )}
            </>
          ),
        },
      },
    ],
    [],
  )

  return (
    <DetailsSection
      content={<AssetsResponsiveTable paddless rows={rows} verticalAlign="top" />}
      title={t('erc-4626.position-page.common.vault-token-rewards')}
      accordion
      accordionOpenByDefault
      footer={
        <Flex sx={{ justifyContent: 'flex-end' }}>
          <Button sx={{ px: 4 }} variant="tertiary" disabled={!tx || claims.length === 0}>
            {t('claim')}
          </Button>
        </Flex>
      }
    />
  )
}
