import type { AaveLikePosition } from '@oasisdex/dma-library'
import type { ProtocolLabelProps } from 'components/ProtocolLabel.types'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { useAaveContext } from 'features/aave'
import type { IStrategyConfig, ManageAaveHeaderProps } from 'features/aave/types'
import { StrategyType } from 'features/aave/types'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'

function AaveHeader({
  strategyConfig,
  headerLabelString,
  shareButton,
  currentPosition,
}: {
  strategyConfig: IStrategyConfig
  headerLabelString: string
  shareButton?: boolean
  currentPosition?: AaveLikePosition
}) {
  const { t } = useTranslation()
  const { getAaveLikeAssetsPrices$ } = useAaveContext(
    strategyConfig.protocol,
    strategyConfig.network,
  )
  const [positionTokenPrices, positionTokenPricesError] = useObservable(
    getAaveLikeAssetsPrices$({
      tokens: [strategyConfig.tokens.collateral, strategyConfig.tokens.debt],
    }),
  )

  const detailsList = useMemo(() => {
    if (!positionTokenPrices) {
      return []
    }
    const collateralTokenPrice = positionTokenPrices[0]
    const debtTokenPrice = positionTokenPrices[1]
    const positionPrice =
      strategyConfig.strategyType === StrategyType.Long
        ? collateralTokenPrice.div(debtTokenPrice)
        : debtTokenPrice.div(collateralTokenPrice)
    const priceFormat =
      strategyConfig.strategyType === StrategyType.Long
        ? `${strategyConfig.tokens.collateral}/${strategyConfig.tokens.debt}`
        : `${strategyConfig.tokens.debt}/${strategyConfig.tokens.collateral}`

    if (currentPosition) {
      return [
        {
          label: t('aave.header.current-ltv'),
          value: `${formatPercent(currentPosition.riskRatio.loanToValue.times(100), {
            precision: 2,
            roundMode: 1,
          })}`,
        },
        {
          label: t('aave.header.current-market-price'),
          value: `${formatCryptoBalance(positionPrice)} ${priceFormat}`,
        },
      ]
    }

    return [
      {
        label: t('aave.header.current-market-price'),
        value: `${formatCryptoBalance(positionPrice)} ${priceFormat}`,
      },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionTokenPrices, currentPosition, strategyConfig])

  const protocol: ProtocolLabelProps = {
    network: strategyConfig.network,
    protocol: strategyConfig.protocol,
  }

  return (
    <WithErrorHandler error={[positionTokenPricesError]}>
      <VaultHeadline
        header={t(headerLabelString, {
          ...strategyConfig.tokens,
          protocol: {
            aavev2: 'Aave',
            aavev3: 'Aave',
            sparkv3: 'Spark',
          }[strategyConfig.protocol],
        })}
        tokens={[strategyConfig.tokens.collateral, strategyConfig.tokens.debt]}
        loading={!positionTokenPrices}
        details={detailsList}
        shareButton={shareButton}
        protocol={protocol}
      />
    </WithErrorHandler>
  )
}

export function AaveOpenHeader({ strategyConfig }: { strategyConfig: IStrategyConfig }) {
  return <AaveHeader strategyConfig={strategyConfig} headerLabelString={'vault.header-aave-open'} />
}

export function AaveManageHeader({ strategyConfig, currentPosition }: ManageAaveHeaderProps) {
  return (
    <AaveHeader
      strategyConfig={strategyConfig}
      headerLabelString={'vault.header-aave-view'}
      shareButton
      currentPosition={currentPosition}
    />
  )
}
