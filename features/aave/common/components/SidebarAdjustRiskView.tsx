import { IPosition, IRiskRatio, RiskRatio } from '@oasisdex/oasis-actions'
import { BigNumber } from 'bignumber.js'
import { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import { WithArrow } from 'components/WithArrow'
import { hasUserInteracted } from 'features/aave/helpers/hasUserInteracted'
import { StopLossAaveErrorMessage } from 'features/aave/manage/components/StopLossAaveErrorMessage'
import { ManageAaveAutomation } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import { ManageAaveEvent } from 'features/aave/manage/state'
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

type RaisedEvents =
  | { type: 'SET_RISK_RATIO'; riskRatio: IRiskRatio }
  | ({
      type: 'RESET_RISK_RATIO'
    } & ManageAaveEvent)

export type AdjustRiskViewProps = BaseViewProps<RaisedEvents> & {
  primaryButton: SidebarSectionFooterButtonSettings
  textButton: SidebarSectionFooterButtonSettings
  viewLocked?: boolean // locks whole view
  showWarring?: boolean // displays warning
  onChainPosition?: IPosition
  dropdownConfig?: SidebarSectionHeaderDropdown
  title: string
  automation?: ManageAaveAutomation
  noSidebar?: boolean
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
    default: IRiskRatio | 'slightlyLessThanMaxRisk'
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
    dropdownConfig,
    title,
    noSidebar,
    automation,
  }: AdjustRiskViewProps) {
    const { t } = useTranslation()

    const simulation = state.context.transition?.simulation
    const targetPosition = simulation?.position

    const maxRisk =
      targetPosition?.category.maxLoanToValue || onChainPosition?.category.maxLoanToValue || zero

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

    const priceMovementUntilLiquidationPercent = (
      (targetPosition
        ? targetPosition?.relativeCollateralPriceMovementUntilLiquidation
        : onChainPosition?.relativeCollateralPriceMovementUntilLiquidation) || zero
    ).times(100)

    const warningPriceMovementPercentThreshold = new BigNumber('20')

    const isWarning =
      targetPosition &&
      priceMovementUntilLiquidationPercent.lte(warningPriceMovementPercentThreshold)

    const collateralToken = state.context.strategyInfo?.collateralToken

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

    const stopLossError =
      automation?.stopLoss.isStopLossEnabled &&
      automation?.stopLoss.stopLossLevel &&
      sliderValue?.gte(automation?.stopLoss.stopLossLevel)

    const sidebarContent = (
      <Grid gap={3}>
        <SliderValuePicker
          leftLabel={t('open-earn.aave.vault-form.configure-multiple.liquidation-price')}
          leftBoundry={liquidationPrice}
          leftBoundryFormatter={(value) => {
            if (isLoading()) {
              return '...'
            } else {
              return onChainPosition
                ? viewConfig.liquidationPriceFormatter(value)
                : hasUserInteracted(state)
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
                  oracleAssetPrice,
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
            send({ type: 'SET_RISK_RATIO', riskRatio: new RiskRatio(ltv, RiskRatio.TYPE.LTV) })
          }}
          minBoundry={minRisk}
          maxBoundry={maxRisk}
          lastValue={sliderValue || zero}
          disabled={viewLocked || !maxRisk}
          disabledVisually={viewLocked || !maxRisk}
          step={0.01}
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
        {hasUserInteracted(state) && <StrategyInformationContainer state={state} />}
      </Grid>
    )
    if (noSidebar) {
      return sidebarContent
    }

    const sidebarSectionProps: SidebarSectionProps = {
      title,
      content: sidebarContent,
      primaryButton: {
        ...primaryButton,
        disabled: viewLocked || primaryButton.disabled || !state.context.transition || stopLossError,
      },
      textButton, // this is going back button, no need to block it
      dropdown: dropdownConfig,
    }

    return <SidebarSection {...sidebarSectionProps} />
  }
}
