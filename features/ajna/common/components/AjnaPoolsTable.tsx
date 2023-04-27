import { getNetworkContracts } from 'blockchain/contracts'
import { Context } from 'blockchain/network'
import { AppLink } from 'components/Links'
import { ajnaComingSoonPools } from 'features/ajna/common/consts'
import { filterPoolData } from 'features/ajna/common/helpers/filterPoolData'
import { AjnaPoolData, AjnaProduct } from 'features/ajna/common/types'
import { DiscoverResponsiveTable } from 'features/discover/common/DiscoverResponsiveTable'
import { DiscoverTableContainer } from 'features/discover/common/DiscoverTableContainer'
import {
  DiscoverTableDataCellAsset,
  DiscoverTableDataCellInactive,
  DiscoverTableDataCellProtocol,
} from 'features/discover/common/DiscoverTableDataCellComponents'
import { useTranslation } from 'next-i18next'
import React, { FC, useMemo } from 'react'
import { Button } from 'theme-ui'

const splitPool = (pool: string) => pool.split('-')

const filterPools = (pool: string[], isPoolReversed: boolean, selectedValue: string) =>
  pool[isPoolReversed ? 1 : 0] === selectedValue

const getTokenAndPair = (pool: string[], isPoolReversed: boolean) => ({
  token: pool[isPoolReversed ? 0 : 1],
  pair: pool.join('-'),
})

interface AjnaPoolsTableProps {
  ajnaPoolsTableData: AjnaPoolData
  context: Context
  isPoolReversed: boolean
  product: AjnaProduct
  selectedValue: string
}

export const AjnaPoolsTable: FC<AjnaPoolsTableProps> = ({
  ajnaPoolsTableData,
  context,
  isPoolReversed,
  product,
  selectedValue,
}) => {
  const { t } = useTranslation()
  const { chainId } = context

  const rows = useMemo(
    () => [
      ...Object.keys(getNetworkContracts(chainId).ajnaPoolPairs)
        .map(splitPool)
        .filter((pool) => filterPools(pool, isPoolReversed, selectedValue))
        .map((pool) => {
          const { token, pair } = getTokenAndPair(pool, isPoolReversed)

          return {
            asset: <DiscoverTableDataCellAsset asset={pair.replace('-', '/')} icons={[token]} />,
            ...filterPoolData({
              data: ajnaPoolsTableData,
              pair,
              product,
            }),
            protocol: <DiscoverTableDataCellProtocol protocol="Ajna" />,
            action: (
              <AppLink href={`/ajna/${product}/${pair}`}>
                <Button className="discover-action" variant="tertiary">
                  {t(`nav.${product}`)}
                </Button>
              </AppLink>
            ),
          }
        }),
      ...ajnaComingSoonPools
        .filter(
          (pool) => !Object.keys(getNetworkContracts(chainId).ajnaPoolPairs || []).includes(pool),
        )
        .map(splitPool)
        .filter((pools) => filterPools(pools, isPoolReversed, selectedValue))
        .map((pool) => {
          const { token, pair } = getTokenAndPair(pool, isPoolReversed)

          return {
            asset: (
              <DiscoverTableDataCellInactive>
                <DiscoverTableDataCellAsset
                  asset={pair.replace('-', '/')}
                  icons={[token]}
                  inactive={`(${t('coming-soon')})`}
                />
              </DiscoverTableDataCellInactive>
            ),
            ...filterPoolData({
              data: ajnaPoolsTableData,
              pair,
              product,
            }),
            protocol: (
              <DiscoverTableDataCellInactive>
                <DiscoverTableDataCellProtocol protocol="Ajna" />
              </DiscoverTableDataCellInactive>
            ),
            action: (
              <Button className="discover-action" variant="tertiary" disabled={true}>
                {t('coming-soon')}
              </Button>
            ),
          }
        }),
    ],
    [chainId, isPoolReversed, selectedValue, ajnaPoolsTableData, product, t],
  )

  return (
    <DiscoverTableContainer tableOnly>
      <DiscoverResponsiveTable headerTranslationProps={{ token: selectedValue }} rows={rows} />
    </DiscoverTableContainer>
  )
}
