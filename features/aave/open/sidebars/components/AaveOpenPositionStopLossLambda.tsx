import { getAddresses } from 'actions/aave-like/get-addresses'
import type BigNumber from 'bignumber.js'
import type CancelablePromise from 'cancelable-promise'
import { cancelable } from 'cancelable-promise'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { AppLink } from 'components/Links'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ConnectedSidebarSection } from 'features/aave/components'
import { getAaveLikeOpenStopLossParams } from 'features/aave/open/helpers'
import type { OpenAaveStateProps } from 'features/aave/open/sidebars/sidebar.types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import type { SetupBasicStopLossResponse } from 'helpers/triggers/setup-triggers'
import { setupAaveStopLoss } from 'helpers/triggers/setup-triggers'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Grid, Text } from 'theme-ui'

const aaveLambdaStopLossConfig = {
  translationRatioParam: 'vault-changes.loan-to-value',
  sliderStep: 1,
  sliderDirection: 'ltr' as const,
}

export function AaveOpenPositionStopLossLambda({ state, isLoading, send }: OpenAaveStateProps) {
  const { t } = useTranslation()
  const { stopLossLevel, rightBoundry, sliderMin, sliderMax, sliderPercentageFill } =
    useMemo(() => {
      return getAaveLikeOpenStopLossParams({ state })
    }, [state])
  const [isGettingStopLossTx, setIsGettingStopLossTx] = useState(false)
  const [stopLossTxCancelablePromise, setStopLossTxCancelablePromise] =
    useState<CancelablePromise<SetupBasicStopLossResponse>>()
  const { strategyConfig } = state.context
  const { tokens } = getAddresses(strategyConfig.networkId, strategyConfig.protocol)
  const collateralAddress = tokens[state.context.tokens.collateral as keyof typeof tokens]
  const debtAddress = tokens[state.context.tokens.debt as keyof typeof tokens]
  useDebouncedEffect(
    () => {
      if (!state.context.userDpmAccount || !stopLossLevel || !collateralAddress || !debtAddress) {
        return
      }
      if (!isGettingStopLossTx) {
        setIsGettingStopLossTx(true)
      }
      const stopLossTxDataPromise = cancelable(
        setupAaveStopLoss({
          dpm: state.context.userDpmAccount.proxy,
          executionLTV: stopLossLevel,
          networkId: strategyConfig.networkId,
          executionToken: state.context.tokens.debt,
          protocol: strategyConfig.protocol,
          strategy: {
            collateralAddress,
            debtAddress,
          },
        }),
      )
      setStopLossTxCancelablePromise(stopLossTxDataPromise)
      stopLossTxDataPromise
        .then((res) => {
          console.log('res', res)
        })
        .catch((err) => {
          console.log('err', err)
        })
        .finally(() => {
          setIsGettingStopLossTx(false)
        })
    },
    [stopLossLevel],
    500,
  )

  const sidebarSectionProps: SidebarSectionProps = {
    title: t(strategyConfig.viewComponents.sidebarTitle),
    content: (
      <Grid gap={3}>
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
          {t('protection.set-downside-protection-desc', {
            ratioParam: t(aaveLambdaStopLossConfig.translationRatioParam),
          })}{' '}
          <AppLink href={EXTERNAL_LINKS.KB.STOP_LOSS} sx={{ fontSize: 2 }}>
            {t('here')}.
          </AppLink>
        </Text>
        <SliderValuePicker
          disabled={false}
          step={aaveLambdaStopLossConfig.sliderStep}
          leftBoundryFormatter={(x: BigNumber) => (x.isZero() ? '-' : formatPercent(x))}
          rightBoundryFormatter={(x: BigNumber) =>
            x.isZero() ? '-' : '$ ' + formatAmount(x, 'USD')
          }
          sliderPercentageFill={sliderPercentageFill}
          lastValue={stopLossLevel}
          maxBoundry={sliderMax}
          minBoundry={sliderMin}
          rightBoundry={rightBoundry}
          leftBoundry={stopLossLevel}
          onChange={(slLevel) => {
            send({
              type: 'SET_STOP_LOSS_LEVEL',
              stopLossLevel: slLevel,
            })
            stopLossTxCancelablePromise?.cancel()
          }}
          useRcSlider
          leftLabel={t('protection.stop-loss-something', {
            value: t(aaveLambdaStopLossConfig.translationRatioParam),
          })}
          rightLabel={t('slider.set-stoploss.right-label')}
          direction={aaveLambdaStopLossConfig.sliderDirection}
        />
      </Grid>
    ),
    primaryButton: {
      steps: [state.context.currentStep, state.context.totalSteps],
      isLoading: isLoading(),
      disabled: isLoading() || !state.can('NEXT_STEP') || isGettingStopLossTx,
      label: t('open-earn.aave.vault-form.confirm-btn'),
      action: () => send('NEXT_STEP'),
    },
    headerButton: {
      label: t('protection.continue-without-stop-loss'),
      action: () => send({ type: 'SET_STOP_LOSS_SKIPPED', stopLossSkipped: true }),
    },
  }

  return (
    <ConnectedSidebarSection
      {...sidebarSectionProps}
      textButton={{
        label: t('open-earn.aave.vault-form.back-to-editing'),
        action: () => send('BACK_TO_EDITING'),
      }}
      context={state.context}
    />
  )
}
