import { IRiskRatio, RiskRatio } from '@oasisdex/oasis-actions'
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
import { formatBigNumber, formatPercent } from '../../../../helpers/formatters/format'
import { one, zero } from '../../../../helpers/zero'
import { aaveStETHDefaultRiskRatio, aaveStETHMinimumRiskRatio } from '../../constants'
import { BaseViewProps } from '../BaseAaveContext'
import { StrategyInformationContainer } from './informationContainer'

type RaisedEvents = { type: 'SET_RISK_RATIO'; riskRatio: IRiskRatio } | { type: 'RESET_RISK_RATIO' }

type AdjustRiskViewProps = BaseViewProps<RaisedEvents> & {
  primaryButton: SidebarSectionFooterButtonSettings
  textButton: SidebarSectionFooterButtonSettings
  resetRiskValue: IRiskRatio
  viewLocked?: boolean // locks whole view + displays warning
}

export function AdjustRiskView({
  state,
  send,
  primaryButton,
  textButton,
  viewLocked = false,
}: AdjustRiskViewProps) {
  const { t } = useTranslation()

  const onChainPosition = state.context.protocolData?.position
  const simulation = state.context.transactionParameters?.simulation
  const targetPosition = simulation?.position

  const maxRisk = targetPosition
    ? targetPosition?.category.maxLoanToValue
    : onChainPosition?.category.maxLoanToValue

  const minRisk =
    (simulation?.minConfigurableRiskRatio &&
      BigNumber.max(
        simulation?.minConfigurableRiskRatio.loanToValue,
        aaveStETHMinimumRiskRatio.loanToValue,
      )) ||
    aaveStETHMinimumRiskRatio.loanToValue

  const liquidationPrice =
    targetPosition?.liquidationPrice || onChainPosition?.liquidationPrice || zero

  const oracleAssetPrice = state.context.strategyInfo?.oracleAssetPrice || zero

  enum RiskLevel {
    OK = 'OK',
    AT_RISK = 'AT_RISK',
  }

  const healthFactor = targetPosition ? targetPosition?.healthFactor : onChainPosition?.healthFactor

  const warningHealthFactor = new BigNumber('1.25')

  const riskTrafficLight = healthFactor?.gt(warningHealthFactor) ? RiskLevel.OK : RiskLevel.AT_RISK

  const collateralToken = state.context.strategyInfo?.collateralToken

  const debtToken = state.context.token

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
    aaveStETHDefaultRiskRatio.loanToValue

  const tokensRatioText = (
    <Text as="span" variant="paragraph4" color="neutral80">
      {collateralToken}/{debtToken}
    </Text>
  )

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <SliderValuePicker
          leftBoundry={liquidationPrice}
          leftBoundryFormatter={(value) => {
            if (state.context.loading) {
              return '...'
            } else {
              return (
                <>
                  {formatBigNumber(value, 2)} {tokensRatioText}
                </>
              )
            }
          }}
          rightBoundry={oracleAssetPrice}
          rightBoundryFormatter={(value) => (
            <>
              {formatBigNumber(value, 2)} {tokensRatioText}
            </>
          )}
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
          leftLabel={t('open-earn.aave.vault-form.configure-multiple.liquidation-price')}
          rightLabel={t('open-earn.aave.vault-form.configure-multiple.current-price')}
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
        {collateralToken && debtToken && (
          <Link target="_blank" href="https://dune.com/dataalways/stETH-De-Peg">
            <WithArrow variant="paragraph4" sx={{ color: 'interactive100' }}>
              {t('open-earn.aave.vault-form.configure-multiple.historical-ratio', {
                collateralToken,
                debtToken,
              })}
            </WithArrow>
          </Link>
        )}
        {viewLocked ? (
          <MessageCard
            messages={[t('manage-earn-vault.has-asset-already')]}
            type="error"
            withBullet={false}
          />
        ) : (
          state.context.transactionParameters && (
            <MessageCard
              messages={[
                isWarning
                  ? t('open-earn.aave.vault-form.configure-multiple.vault-message-warning', {
                      collateralToken,
                      priceMovement: formatPercent(priceMovementUntilLiquidation, { precision: 2 }),
                      debtToken,
                      liquidationPenalty,
                    })
                  : t('open-earn.aave.vault-form.configure-multiple.vault-message-ok', {
                      collateralToken,
                      priceMovement: formatPercent(priceMovementUntilLiquidation, { precision: 2 }),
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
