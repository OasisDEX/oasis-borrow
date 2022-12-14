import { IPosition, IRiskRatio, RiskRatio } from '@oasisdex/oasis-actions'
import { BigNumber } from 'bignumber.js'
import { WithArrow } from 'components/WithArrow'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Grid, Link, Text } from 'theme-ui'

import { SliderValuePicker } from '../../../../components/dumb/SliderValuePicker'
import { MessageCard } from '../../../../components/MessageCard'
import { SidebarSection, SidebarSectionProps } from '../../../../components/sidebar/SidebarSection'
import { SidebarSectionFooterButtonSettings } from '../../../../components/sidebar/SidebarSectionFooter'
import { SidebarResetButton } from '../../../../components/vault/sidebar/SidebarResetButton'
import { formatPercent } from '../../../../helpers/formatters/format'
import { one, zero } from '../../../../helpers/zero'
import { getLiquidationPriceAccountingForPrecision } from '../../../shared/liquidationPrice'
import { BaseViewProps } from '../BaseAaveContext'
import { StrategyInformationContainer } from './informationContainer'

type RaisedEvents = { type: 'SET_RISK_RATIO'; riskRatio: IRiskRatio } | { type: 'RESET_RISK_RATIO' }

export type AdjustRiskViewProps = BaseViewProps<RaisedEvents> & {
  primaryButton: SidebarSectionFooterButtonSettings
  textButton: SidebarSectionFooterButtonSettings
  viewLocked?: boolean // locks whole view
  showWarring?: boolean // displays warning
  onChainPosition?: IPosition
}

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
    ltv,
  }: {
    oracleAssetPrice: BigNumber
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
    default: IRiskRatio
  }
}

export function adjustRiskView(viewConfig: AdjustRiskViewConfig) {
  return function AdjustRiskView({
    state,
    send,
    isLoading,
    primaryButton,
    textButton,
    viewLocked = false,
    showWarring = false,
    onChainPosition,
  }: AdjustRiskViewProps) {
    const { t } = useTranslation()

    const simulation = state.context.strategy?.simulation
    const targetPosition = simulation?.position

    const maxRisk = targetPosition
      ? targetPosition?.category.maxLoanToValue
      : onChainPosition?.category.maxLoanToValue

    const minRisk =
      (simulation?.minConfigurableRiskRatio &&
        BigNumber.max(
          simulation?.minConfigurableRiskRatio.loanToValue,
          viewConfig.riskRatios.minimum.loanToValue,
        )) ||
      viewConfig.riskRatios.minimum.loanToValue

    const liquidationPrice = targetPosition
      ? getLiquidationPriceAccountingForPrecision(targetPosition)
      : onChainPosition
      ? getLiquidationPriceAccountingForPrecision(onChainPosition)
      : zero

    const oracleAssetPrice = state.context.strategyInfo?.oracleAssetPrice || zero

    enum RiskLevel {
      OK = 'OK',
      AT_RISK = 'AT_RISK',
    }

    const healthFactor = targetPosition
      ? targetPosition?.healthFactor
      : onChainPosition?.healthFactor

    const warningHealthFactor = new BigNumber('1.25')

    const riskTrafficLight = healthFactor?.gt(warningHealthFactor)
      ? RiskLevel.OK
      : RiskLevel.AT_RISK

    const collateralToken = state.context.strategyInfo?.collateralToken

    const debtToken = state.context.tokens.debt

    const priceMovementUntilLiquidation = one.minus(one.div(healthFactor || zero)).times(100)

    const priceMovementWarningThreshold = new BigNumber(20)

    const isWarning = priceMovementUntilLiquidation.lte(priceMovementWarningThreshold)

    const liquidationPenalty = formatPercent(
      (state.context.strategyInfo?.liquidationBonus || zero).times(100),
      {
        precision: 2,
      },
    )

    const sliderValue =
      state.context.userInput.riskRatio?.loanToValue ||
      onChainPosition?.riskRatio.loanToValue ||
      viewConfig.riskRatios.default.loanToValue

    const sidebarSectionProps: SidebarSectionProps = {
      title: t('open-earn.aave.vault-form.title'),
      content: (
        <Grid gap={3}>
          <SliderValuePicker
            leftLabel={t('open-earn.aave.vault-form.configure-multiple.liquidation-price')}
            leftBoundry={liquidationPrice}
            leftBoundryFormatter={(value) => {
              if (isLoading()) {
                return '...'
              } else {
                return viewConfig.liquidationPriceFormatter(value)
              }
            }}
            rightBoundry={viewConfig.rightBoundary.valueExtractor({
              oracleAssetPrice,
              ltv: sliderValue,
            })}
            rightBoundryFormatter={(value) => {
              return viewConfig.rightBoundary.formatter(value)
            }}
            rightLabel={t(viewConfig.rightBoundary.translationKey)}
            onChange={(ltv) => {
              send({ type: 'SET_RISK_RATIO', riskRatio: new RiskRatio(ltv, RiskRatio.TYPE.LTV) })
            }}
            leftBoundryStyling={{
              color: riskTrafficLight !== RiskLevel.OK ? 'warning100' : 'neutral100',
            }}
            minBoundry={minRisk}
            maxBoundry={maxRisk || zero}
            lastValue={sliderValue}
            disabled={viewLocked}
            step={0.01}
            sliderPercentageFill={
              maxRisk
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
          {showWarring ? (
            <MessageCard
              messages={[t('manage-earn-vault.has-asset-already')]}
              type="error"
              withBullet={false}
            />
          ) : (
            state.context.strategy && (
              <MessageCard
                messages={[
                  isWarning
                    ? t('open-earn.aave.vault-form.configure-multiple.vault-message-warning', {
                        collateralToken,
                        priceMovement: formatPercent(priceMovementUntilLiquidation, {
                          precision: 2,
                        }),
                        debtToken,
                        liquidationPenalty,
                      })
                    : t('open-earn.aave.vault-form.configure-multiple.vault-message-ok', {
                        collateralToken,
                        priceMovement: formatPercent(priceMovementUntilLiquidation, {
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
          <StrategyInformationContainer state={state} />

          <SidebarResetButton
            clear={() => {
              send({ type: 'RESET_RISK_RATIO' })
            }}
            disabled={viewLocked}
          />
        </Grid>
      ),
      primaryButton: { ...primaryButton, disabled: viewLocked || primaryButton.disabled },
      textButton, // this is going back button, no need to block it
    }

    return <SidebarSection {...sidebarSectionProps} />
  }
}
