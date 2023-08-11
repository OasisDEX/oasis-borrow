import { Protocol } from '@prisma/client'
import { ProtocolLabelProps } from 'components/ProtocolLabel'
import { VaultHeadline } from 'components/vault/VaultHeadline'
import { HeadlineDetailsProp } from 'components/vault/VaultHeadlineDetails'
import { useAaveContext } from 'features/aave'
import { createFollowButton } from 'features/aave/helpers/createFollowButton'
import { IStrategyConfig, ManageAaveHeaderProps, StrategyType } from 'features/aave/types'
import { FollowButtonControlProps } from 'features/follow/controllers/FollowButtonControl'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { map } from 'rxjs/operators'

function AaveHeader({
  strategyConfig,
  headerLabelString,
  followButton,
  shareButton,
}: {
  strategyConfig: IStrategyConfig
  headerLabelString: string
  followButton?: FollowButtonControlProps
  shareButton?: boolean
}) {
  const { t } = useTranslation()
  const { getAaveAssetsPrices$ } = useAaveContext(strategyConfig.protocol, strategyConfig.network)
  const [positionTokenPrices, positionTokenPricesError] = useObservable(
    getAaveAssetsPrices$({
      tokens: [strategyConfig.tokens.debt, strategyConfig.tokens.collateral],
    }).pipe(
      map(([debtTokenPrice, collateralTokenPrice]) => {
        const positionPrice =
          strategyConfig.strategyType === StrategyType.Long
            ? collateralTokenPrice.div(debtTokenPrice)
            : debtTokenPrice.div(collateralTokenPrice)
        const priceFormat =
          strategyConfig.strategyType === StrategyType.Long
            ? `${strategyConfig.tokens.collateral}/${strategyConfig.tokens.debt}`
            : `${strategyConfig.tokens.debt}/${strategyConfig.tokens.collateral}`
        return {
          positionPrice,
          priceFormat,
        }
      }),
    ),
  )

  // {
  //   label: t('ajna.position-page.common.headline.current-market-price', {
  //     collateralToken,
  //   }),
  //     value: `${formatCryptoBalance(
  //   isShort ? quotePrice.div(collateralPrice) : collateralPrice.div(quotePrice),
  // )} ${priceFormat}`,
  // },

  const detailsList: HeadlineDetailsProp[] = []
  if (positionTokenPrices) {
    detailsList.push({
      label: t('aave.header.current-market-price'),
      value: `${formatCryptoBalance(positionTokenPrices.positionPrice)} ${
        positionTokenPrices.priceFormat
      }`,
    })
  }

  const protocol: ProtocolLabelProps = {
    network: strategyConfig.network,
    protocol: strategyConfig.protocol,
  }

  return (
    <WithErrorHandler error={[positionTokenPricesError]}>
      <VaultHeadline
        header={t(headerLabelString, { ...strategyConfig.tokens })}
        tokens={[strategyConfig.tokens.collateral, strategyConfig.tokens.debt]}
        loading={!positionTokenPrices}
        details={detailsList}
        followButton={followButton}
        shareButton={shareButton}
        protocol={protocol}
      />
    </WithErrorHandler>
  )
}

export function AaveOpenHeader({ strategyConfig }: { strategyConfig: IStrategyConfig }) {
  return <AaveHeader strategyConfig={strategyConfig} headerLabelString={'vault.header-aave-open'} />
}

export function AaveManageHeader({ strategyConfig, positionId }: ManageAaveHeaderProps) {
  const { protocol } = strategyConfig
  const followButton: FollowButtonControlProps | undefined = createFollowButton(
    positionId,
    protocol.toLowerCase() as Protocol,
  )

  return (
    <AaveHeader
      strategyConfig={strategyConfig}
      headerLabelString={'vault.header-aave-view'}
      followButton={followButton}
      shareButton
    />
  )
}
