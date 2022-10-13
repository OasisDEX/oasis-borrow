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
import { formatPercent } from '../../../../../helpers/formatters/format'
import { one, zero } from '../../../../../helpers/zero'
import { BaseViewProps } from '../BaseAaveContext'
import { OpenAaveInformationContainer } from './OpenAaveInformationContainer'

type RaisedEvents = { type: 'SET_RISK_RATIO'; riskRatio: IRiskRatio }

type AdjustRiskViewProps = BaseViewProps<RaisedEvents> & {
  primaryButton: SidebarSectionFooterButtonSettings
  textButton: SidebarSectionFooterButtonSettings
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

  const maxRisk = state.context.transactionParameters?.simulation.position.category.maxLoanToValue

  const minRisk =
    state.context.transactionParameters?.simulation.minConfigurableRiskRatio ||
    new RiskRatio(zero, RiskRatio.TYPE.LTV)

  const liquidationPrice =
    state.context.transactionParameters?.simulation.position.liquidationPrice || zero

  const oracleAssetPrice = state.context.strategyInfo?.oracleAssetPrice || zero

  enum RiskLevel {
    OK = 'OK',
    AT_RISK = 'AT_RISK',
  }

  const healthFactor = state.context.transactionParameters?.simulation.position.healthFactor

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
  console.log(`minRisk: ${minRisk.loanToValue}`)
  console.log(`maxRisk: ${maxRisk}`)
  const sidebarSectionProps: SidebarSectionProps = {
    title: t('open-earn.aave.vault-form.title'),
    content: (
      <Grid gap={3}>
        <SliderValuePicker
          sliderPercentageFill={new BigNumber(0)}
          leftBoundry={liquidationPrice}
          leftBoundryFormatter={(value) => value.toFixed(2)}
          rightBoundry={oracleAssetPrice}
          rightBoundryFormatter={(value) => `Current: ${value.toFixed(2)}`}
          rightBoundryStyling={{
            color: riskTrafficLight === RiskLevel.OK ? 'success100' : 'warning100',
          }}
          onChange={(ltv) => {
            send({ type: 'SET_RISK_RATIO', riskRatio: new RiskRatio(ltv, RiskRatio.TYPE.LTV) })
          }}
          minBoundry={minRisk.loanToValue || zero}
          maxBoundry={maxRisk || zero}
          lastValue={state.context.riskRatio.loanToValue}
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
          <Text as="span">{t('open-earn.aave.vault-form.configure-multiple.increase-risk')}</Text>
          <Text as="span">{t('open-earn.aave.vault-form.configure-multiple.decrease-risk')}</Text>
        </Flex>
        <OpenAaveInformationContainer state={state} />
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
            send({ type: 'SET_RISK_RATIO', riskRatio: minRisk })
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
