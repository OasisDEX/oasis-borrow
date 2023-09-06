import { IAdjustStrategy, IRiskRatio, IStrategy, RiskRatio } from '@oasisdex/dma-library'
import { BigNumber } from 'bignumber.js'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { MessageCard } from 'components/MessageCard'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { WithArrow } from 'components/WithArrow'
import { hasUserInteracted } from 'features/aave/helpers/hasUserInteracted'
import { SecondaryInputProps } from 'features/aave/types'
import { getLiquidationPriceAccountingForPrecision } from 'features/shared/liquidationPrice'
import { formatPercent } from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Grid, Link, Text } from 'theme-ui'

import { StopLossAaveErrorMessage } from './StopLossAaveErrorMessage'

export function richFormattedBoundary({ value, unit }: { value: string; unit: string }) {
  return (
    <>
      {value}{' '}
      <Text as="span" variant="paragraph4" color="neutral80">
        {unit}
      </Text>
    </>
  )
}

export type TokenDisplay = JSX.Element

type BoundaryConfig = {
  translationKey: string
  valueExtractor: ({
    oracleAssetPrice,
    oraclesPricesRatio,
    ltv,
  }: {
    oracleAssetPrice: BigNumber
    oraclesPricesRatio: BigNumber
    ltv: BigNumber
  }) => BigNumber
  formatter: (qty: BigNumber) => TokenDisplay
}

export type AdjustRiskViewConfig = {
  liquidationPriceFormatter: (qty: BigNumber) => TokenDisplay
  rightBoundary: BoundaryConfig
  link?: {
    url: string
    textTranslationKey: string
  }
  riskRatios: {
    minimum: IRiskRatio
    default: IRiskRatio | 'slightlyLessThanMaxRisk'
  }
}

function transitionHasMinConfigurableRiskRatio(
  transition?: IAdjustStrategy | IStrategy,
): transition is IAdjustStrategy {
  return (
    !!transition &&
    (transition.simulation as IAdjustStrategy['simulation']).minConfigurableRiskRatio !== undefined
  )
}

export function adjustRiskView(viewConfig: AdjustRiskViewConfig) {
  return function AdjustRiskView({
    state,
    send,
    isLoading,
    viewLocked = false,
    showWarring = false,
    onChainPosition,
    stopLossError,
  }: SecondaryInputProps) {
    const { t } = useTranslation()
    const transition = state.context.transition
    const positionTransitionHasMinConfigurableRisk =
      transitionHasMinConfigurableRiskRatio(transition)

    const simulation = transition?.simulation
    const targetPosition = simulation?.position

    const strategyInfo = state.context.strategyInfo

    const maxRisk =
      targetPosition?.category.maxLoanToValue || onChainPosition?.category.maxLoanToValue || zero

    const minRisk = positionTransitionHasMinConfigurableRisk
      ? BigNumber.max(
          transition?.simulation?.minConfigurableRiskRatio.loanToValue,
          viewConfig.riskRatios.minimum.loanToValue,
        )
      : viewConfig.riskRatios.minimum.loanToValue

    const liquidationPrice = targetPosition
      ? getLiquidationPriceAccountingForPrecision(targetPosition)
      : onChainPosition
      ? getLiquidationPriceAccountingForPrecision(onChainPosition)
      : zero

    const oracleAssetPrice = strategyInfo?.oracleAssetPrice.collateral || zero
    const oraclePriceCollateralToDebt = strategyInfo
      ? strategyInfo.oracleAssetPrice.collateral.div(strategyInfo.oracleAssetPrice.debt)
      : zero

    const priceMovementUntilLiquidationPercent = (
      (targetPosition
        ? targetPosition?.relativeCollateralPriceMovementUntilLiquidation
        : onChainPosition?.relativeCollateralPriceMovementUntilLiquidation) || zero
    ).times(100)

    const warningPriceMovementPercentThreshold = new BigNumber('20')

    const isWarning =
      targetPosition &&
      priceMovementUntilLiquidationPercent.lte(warningPriceMovementPercentThreshold)

    const collateralToken = state.context.strategyInfo?.tokens.collateral

    const debtToken = state.context.tokens.debt

    const liquidationPenalty = formatPercent(
      (state.context.strategyInfo?.liquidationBonus || zero).times(100),
      {
        precision: 2,
      },
    )

    const sliderValue =
      state.context.userInput.riskRatio?.loanToValue ||
      onChainPosition?.riskRatio.loanToValue ||
      state.context.defaultRiskRatio?.loanToValue

    return (
      <Grid gap={3}>
        <SliderValuePicker
          leftLabel={t('open-earn.aave.vault-form.configure-multiple.liquidation-price')}
          leftBoundry={liquidationPrice}
          leftBoundryFormatter={(value) => {
            if (isLoading()) {
              return '...'
            } else {
              return (onChainPosition || hasUserInteracted(state)) && !value.isNaN()
                ? viewConfig.liquidationPriceFormatter(value)
                : '-'
            }
          }}
          leftBoundryStyling={{
            color: isWarning ? 'warning100' : 'neutral100',
          }}
          rightBoundry={
            sliderValue
              ? viewConfig.rightBoundary.valueExtractor({
                  oracleAssetPrice: oracleAssetPrice,
                  oraclesPricesRatio: oraclePriceCollateralToDebt,
                  ltv: sliderValue,
                })
              : one
          }
          rightBoundryFormatter={(value) => {
            return onChainPosition
              ? viewConfig.rightBoundary.formatter(value)
              : hasUserInteracted(state)
              ? viewConfig.rightBoundary.formatter(value)
              : '-'
          }}
          rightLabel={t(viewConfig.rightBoundary.translationKey)}
          onChange={(ltv) => {
            send({
              type: 'SET_RISK_RATIO',
              riskRatio: new RiskRatio(ltv, RiskRatio.TYPE.LTV),
            })
          }}
          minBoundry={minRisk}
          maxBoundry={maxRisk}
          lastValue={sliderValue || zero}
          disabled={viewLocked || !maxRisk}
          step={0.001}
          sliderPercentageFill={
            maxRisk && sliderValue
              ? sliderValue.minus(minRisk).times(100).dividedBy(maxRisk.minus(minRisk))
              : new BigNumber(0)
          }
        />
        <Flex
          sx={{
            variant: 'text.paragraph4',
            justifyContent: 'space-between',
            color: 'neutral80',
          }}
        >
          <Text as="span">{t('open-earn.aave.vault-form.configure-multiple.decrease-risk')}</Text>
          <Text as="span">{t('open-earn.aave.vault-form.configure-multiple.increase-risk')}</Text>
        </Flex>

        <SidebarResetButton
          clear={() => {
            send({ type: 'RESET_RISK_RATIO' })
          }}
          disabled={viewLocked || !state.context.userInput.riskRatio}
        />

        {collateralToken && debtToken && viewConfig.link && (
          <Link target="_blank" href={viewConfig.link.url}>
            <WithArrow variant="paragraph4" sx={{ color: 'interactive100' }}>
              {t(viewConfig.link.textTranslationKey, {
                collateralToken,
                debtToken,
              })}
            </WithArrow>
          </Link>
        )}
        {stopLossError && <StopLossAaveErrorMessage />}
        {showWarring ? (
          <MessageCard
            messages={[t('manage-earn-vault.has-asset-already')]}
            type="error"
            withBullet={false}
          />
        ) : (
          state.context.transition &&
          hasUserInteracted(state) && (
            <MessageCard
              messages={[
                isWarning
                  ? t('open-earn.aave.vault-form.configure-multiple.vault-message-warning', {
                      collateralToken,
                      priceMovement: formatPercent(priceMovementUntilLiquidationPercent, {
                        precision: 2,
                      }),
                      debtToken,
                      liquidationPenalty,
                      positionType: state.context.strategyConfig.type,
                    })
                  : t('open-earn.aave.vault-form.configure-multiple.vault-message-ok', {
                      collateralToken,
                      priceMovement: formatPercent(priceMovementUntilLiquidationPercent, {
                        precision: 2,
                      }),
                      debtToken,
                      liquidationPenalty,
                    }),
              ]}
              withBullet={false}
              type={isWarning ? 'warning' : 'ok'}
            />
          )
        )}
      </Grid>
    )
  }
}
