import { IRiskRatio, RiskRatio } from '@oasisdex/oasis-actions'
import { BigNumber } from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Grid, Link, Text } from 'theme-ui'

import { SliderValuePicker } from '../../../../../components/dumb/SliderValuePicker'
import { MessageCard } from '../../../../../components/MessageCard'
import {
  SidebarSection,
  SidebarSectionProps,
} from '../../../../../components/sidebar/SidebarSection'
import { SidebarSectionFooterButtonSettings } from '../../../../../components/sidebar/SidebarSectionFooter'
import { SidebarResetButton } from '../../../../../components/vault/sidebar/SidebarResetButton'
import { formatBigNumber, formatPercent } from '../../../../../helpers/formatters/format'
import { one, zero } from '../../../../../helpers/zero'
import { aaveStETHMinimumRiskRatio } from '../../constants'
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

  const transactionParametersSimulation = state.context.transactionParameters?.simulation

  const position = state.context.protocolData
    ? state.context.protocolData.position
    : transactionParametersSimulation?.position

  const maxRisk = position?.category.maxLoanToValue

  const minRisk =
    (transactionParametersSimulation?.minConfigurableRiskRatio &&
      BigNumber.max(
        transactionParametersSimulation?.minConfigurableRiskRatio.loanToValue,
        aaveStETHMinimumRiskRatio.loanToValue,
      )) ||
    aaveStETHMinimumRiskRatio.loanToValue

  const liquidationPrice =
    transactionParametersSimulation?.position.liquidationPrice || position?.liquidationPrice || zero

  const oracleAssetPrice = state.context.strategyInfo?.oracleAssetPrice || zero

  enum RiskLevel {
    OK = 'OK',
    AT_RISK = 'AT_RISK',
  }

  const healthFactor = position?.healthFactor

  const warningHealthFactor = new BigNumber('1.25')

  const riskTrafficLight = healthFactor?.gt(warningHealthFactor) ? RiskLevel.OK : RiskLevel.AT_RISK

  const collateralToken = state.context.strategyInfo?.collateralToken

  const debtToken = state.context.token

  const priceMovementUntilLiquidation = one.minus(one.div(healthFactor || zero)).times(100)

  const priceMovementWarningThreshold = new BigNumber(20)

  const priceMovementToDisplay = formatPercent(
    BigNumber.min(priceMovementUntilLiquidation, priceMovementWarningThreshold),
    { precision: 2 },
  )

  const isWarning = priceMovementUntilLiquidation.lte(priceMovementWarningThreshold)

  const liquidationPenalty = formatPercent(
    (state.context.strategyInfo?.liquidationBonus || zero).times(100),
    {
      precision: 2,
    },
  )

  const sliderValue =
    state.context.userInput.riskRatio?.loanToValue ||
    position?.riskRatio.loanToValue ||
    aaveStETHMinimumRiskRatio.loanToValue

  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <SliderValuePicker
          sliderPercentageFill={new BigNumber(0)}
          leftBoundry={liquidationPrice}
          leftBoundryFormatter={(value) => formatBigNumber(value, 2)}
          rightBoundry={oracleAssetPrice}
          rightBoundryFormatter={(value) => `Current: ${formatBigNumber(value, 2)}`}
          rightBoundryStyling={{
            color: riskTrafficLight === RiskLevel.OK ? 'success100' : 'warning100',
          }}
          onChange={(ltv) => {
            send({ type: 'SET_RISK_RATIO', riskRatio: new RiskRatio(ltv, RiskRatio.TYPE.LTV) })
          }}
          minBoundry={minRisk}
          maxBoundry={maxRisk || zero}
          lastValue={sliderValue}
          disabled={viewLocked}
          step={0.01}
          leftLabel={t('open-earn.aave.vault-form.configure-multiple.liquidation-price', {
            collateralToken,
            debtToken,
          })}
          rightLabel={
            <Link target="_blank" href="https://dune.com/dataalways/stETH-De-Peg">
              <Text variant="paragraph4" color="interactive100">
                {t('open-earn.aave.vault-form.configure-multiple.historical-ratio', {
                  collateralToken,
                  debtToken,
                })}{' '}
                &gt;
              </Text>
            </Link>
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
        <StrategyInformationContainer state={state} />
        {viewLocked ? (
          <MessageCard
            messages={[t('manage-earn-vault.has-asset-already')]}
            type="error"
            withBullet={false}
          />
        ) : (
          <MessageCard
            messages={[
              isWarning
                ? t('open-earn.aave.vault-form.configure-multiple.vault-message-warning', {
                    collateralToken,
                    priceMovement: priceMovementToDisplay,
                    debtToken,
                    liquidationPenalty,
                  })
                : t('open-earn.aave.vault-form.configure-multiple.vault-message-ok', {
                    collateralToken,
                    priceMovement: priceMovementToDisplay,
                    debtToken,
                    liquidationPenalty,
                  }),
            ]}
            type={isWarning ? 'warning' : 'ok'}
          />
        )}

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
