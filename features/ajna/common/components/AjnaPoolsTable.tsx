import { getNetworkContracts } from 'blockchain/contracts'
import { Context } from 'blockchain/network'
import { NetworkIds } from 'blockchain/networkIds'
import { AssetsResponsiveTable } from 'components/assetsTable/AssetsResponsiveTable'
import { AssetsTableContainer } from 'components/assetsTable/AssetsTableContainer'
import { AssetsTableDataCellAction } from 'components/assetsTable/cellComponents/AssetsTableDataCellAction'
import { AssetsTableDataCellAsset } from 'components/assetsTable/cellComponents/AssetsTableDataCellAsset'
import { AssetsTableDataCellInactive } from 'components/assetsTable/cellComponents/AssetsTableDataCellInactive'
import { AssetsTableDataCellProtocol } from 'components/assetsTable/cellComponents/AssetsTableDataCellProtocol'
import { AppLink } from 'components/Links'
import { ajnaComingSoonPools } from 'features/ajna/common/consts'
import { filterPoolData } from 'features/ajna/common/helpers/filterPoolData'
import { AjnaPoolData, AjnaProduct } from 'features/ajna/common/types'
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
      ...Object.keys(getNetworkContracts(NetworkIds.MAINNET, chainId).ajnaPoolPairs)
        .map(splitPool)
        .filter((pool) => filterPools(pool, isPoolReversed, selectedValue))
        .map((pool) => {
          const { token, pair } = getTokenAndPair(pool, isPoolReversed)

          return {
            asset: <AssetsTableDataCellAsset asset={pair.replace('-', '/')} icons={[token]} />,
            ...filterPoolData({
              data: ajnaPoolsTableData,
              pair,
              product,
            }),
            protocol: <AssetsTableDataCellProtocol protocol="Ajna" />,
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
          (pool) =>
            !Object.keys(
              getNetworkContracts(NetworkIds.MAINNET, chainId).ajnaPoolPairs || [],
            ).includes(pool),
        )
        .map(splitPool)
        .filter((pools) => filterPools(pools, isPoolReversed, selectedValue))
        .map((pool) => {
          const { token, pair } = getTokenAndPair(pool, isPoolReversed)

          return {
            asset: (
              <AssetsTableDataCellInactive>
                <AssetsTableDataCellAsset
                  asset={pair.replace('-', '/')}
                  icons={[token]}
                  suffix={`(${t('coming-soon')})`}
                />
              </AssetsTableDataCellInactive>
            ),
            ...filterPoolData({
              data: ajnaPoolsTableData,
              pair,
              product,
            }),
            protocol: (
              <AssetsTableDataCellInactive>
                <AssetsTableDataCellProtocol protocol="Ajna" />
              </AssetsTableDataCellInactive>
            ),
            action: <AssetsTableDataCellAction cta={t('coming-soon')} disabled={true} />,
          }
        }),
    ],
    [chainId, isPoolReversed, selectedValue, ajnaPoolsTableData, product, t],
  )

  return (
    <AssetsTableContainer tableOnly>
      <AssetsResponsiveTable headerTranslationProps={{ token: selectedValue }} rows={rows} />
    </AssetsTableContainer>
  )
}
