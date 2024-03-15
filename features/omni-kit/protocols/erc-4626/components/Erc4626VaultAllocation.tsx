import type BigNumber from 'bignumber.js'
import { getTokenGuarded } from 'blockchain/tokensMetadata'
import { AssetsResponsiveTable } from 'components/assetsTable/AssetsResponsiveTable'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import type { AssetsTableRowData } from 'components/assetsTable/types'
import { DetailsSection } from 'components/DetailsSection'
import { notAvailable } from 'handlers/portfolio/constants'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatUsdValue,
} from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Box, Text } from 'theme-ui'

interface Erc4626VaultAllocationProps {
  supplyTokenSymbol: string
  supplyTokenPrice?: BigNumber
  tokens: {
    maxLtv?: BigNumber
    supply: BigNumber
    tokenSymbol: string
  }[]
}

export const Erc4626VaultAllocation: FC<Erc4626VaultAllocationProps> = ({
  supplyTokenPrice,
  supplyTokenSymbol,
  tokens,
}) => {
  const { t } = useTranslation()

  const total = tokens.reduce<BigNumber>((sum, { supply }) => sum.plus(supply), zero)
  const rows = tokens.reduce<AssetsTableRowData[]>(
    (sum, { maxLtv, supply, tokenSymbol }) => [
      ...sum,
      {
        items: {
          collateral: (
            <AssetsTableDataCellAsset
              asset={tokenSymbol}
              icons={[tokenSymbol]}
              description={getTokenGuarded(tokenSymbol)?.name}
            />
          ),
          vaultSupply: (
            <>
              {formatCryptoBalance(supply)} {supplyTokenSymbol}
              {supplyTokenPrice && (
                <>
                  <br />
                  <Text variant="paragraph3" sx={{ color: 'neutral80' }}>
                    {formatUsdValue(supply.times(supplyTokenPrice))}
                  </Text>
                </>
              )}
            </>
          ),
          maxLtv: maxLtv ? formatDecimalAsPercent(maxLtv) : notAvailable,
          distribution: (
            <>
              <Box
                sx={{
                  display: 'inline-block',
                  width: '40px',
                  height: '4px',
                  bg: 'neutral20',
                  borderRadius: 'small',
                }}
              >
                <Box
                  sx={{
                    width: formatDecimalAsPercent(supply.div(total)),
                    height: '4px',
                    bg: 'interactive50',
                    borderRadius: 'small',
                  }}
                />
              </Box>
              <br />
              <Text variant="paragraph3" sx={{ color: 'neutral80' }}>
                {formatDecimalAsPercent(supply.div(total))}
              </Text>
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
      title={t('erc-4626.position-page.common.vault-allocation-breakdown')}
      accordion
    />
  )
}
