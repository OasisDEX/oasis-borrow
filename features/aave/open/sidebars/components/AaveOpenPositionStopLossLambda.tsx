import type BigNumber from 'bignumber.js'
import { ActionPills } from 'components/ActionPills'
import { useProductContext } from 'components/context/ProductContextProvider'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { AppLink } from 'components/Links'
import type { SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { ConnectedSidebarSection } from 'features/aave/components'
import { OpenAaveStopLossInformationLambda } from 'features/aave/components/order-information/OpenAaveStopLossInformationLambda'
import { getAaveLikeOpenStopLossParams } from 'features/aave/open/helpers'
import { useLambdaDebouncedStopLoss } from 'features/aave/open/helpers/use-lambda-debounced-stop-loss'
import type { OpenAaveStateProps } from 'features/aave/open/sidebars/sidebar.types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
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
  const [stopLossToken, setStopLossToken] = useState<'debt' | 'collateral'>('debt')
  const { strategyConfig } = state.context
  const {
    stopLossLevel,
    rightBoundry,
    sliderMin,
    sliderMax,
    sliderPercentageFill,
    liquidationPrice,
    liquidationRatio,
  } = useMemo(() => {
    return getAaveLikeOpenStopLossParams({ state })
  }, [state])
  const { tokenPriceUSD$ } = useProductContext()
  const _tokenPriceUSD$ = useMemo(
    () =>
      tokenPriceUSD$([
        'ETH',
        stopLossToken === 'debt' ? strategyConfig.tokens.debt : strategyConfig.tokens.collateral,
      ]),
    [stopLossToken, strategyConfig.tokens.collateral, strategyConfig.tokens.debt, tokenPriceUSD$],
  )
  const [tokensPriceData, tokensPriceDataError] = useObservable(_tokenPriceUSD$)
  const { stopLossTxCancelablePromise, isGettingStopLossTx } = useLambdaDebouncedStopLoss({
    state,
    stopLossLevel,
    stopLossToken,
    send,
    isLoading,
  })

  const sidebarSectionProps: SidebarSectionProps = {
    title: t(strategyConfig.viewComponents.sidebarTitle),
    content: (
      <Grid gap={3}>
        <ActionPills
          items={[
            {
              id: 'debt',
              label: t('close-to', { token: strategyConfig.tokens.debt }),
              action: () => setStopLossToken('debt'),
            },
            {
              id: 'collateral',
              label: t('close-to', { token: strategyConfig.tokens.collateral }),
              action: () => setStopLossToken('collateral'),
            },
          ]}
          active={stopLossToken}
        />
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
        <OpenAaveStopLossInformationLambda
          tokensPriceData={tokensPriceData}
          strategyInfo={state.context.strategyInfo}
          liquidationPrice={liquidationPrice}
          liquidationRatio={liquidationRatio}
          stopLossLevel={stopLossLevel}
          collateralActive={stopLossToken === 'collateral'}
        />
      </Grid>
    ),
    primaryButton: {
      steps: [state.context.currentStep, state.context.totalSteps],
      isLoading: isLoading() || isGettingStopLossTx,
      disabled: isLoading() || isGettingStopLossTx || !state.can('NEXT_STEP'),
      label: t('open-earn.aave.vault-form.confirm-btn'),
      action: () => send('NEXT_STEP'),
    },
    headerButton: {
      label: t('protection.continue-without-stop-loss'),
      action: () => send({ type: 'SET_STOP_LOSS_SKIPPED', stopLossSkipped: true }),
    },
  }

  return (
    <WithErrorHandler error={[tokensPriceDataError]}>
      <ConnectedSidebarSection
        {...sidebarSectionProps}
        textButton={{
          label: t('open-earn.aave.vault-form.back-to-editing'),
          action: () => send('BACK_TO_EDITING'),
        }}
        context={state.context}
      />
    </WithErrorHandler>
  )
}
