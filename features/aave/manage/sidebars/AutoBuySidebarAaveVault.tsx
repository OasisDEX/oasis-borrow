import BigNumber from 'bignumber.js'
import { amountFromWei } from 'blockchain/utils'
import { AppLink } from 'components/Links'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import type { SidebarSectionFooterButtonSettings } from 'components/sidebar/SidebarSectionFooter'
import type { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { VaultChangesWithADelayCard } from 'components/vault/VaultChangesWithADelayCard'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import type { RemoveTriggerSectionProps } from 'features/aave/components'
import { RemoveTriggerInfoSection } from 'features/aave/components'
import type { BuyInfoSectionProps } from 'features/aave/components/AutoBuyInfoSection'
import { AutoBuyInfoSection } from 'features/aave/components/AutoBuyInfoSection'
import { mapErrorsToErrorVaults, mapWarningsToWarningVaults } from 'features/aave/helpers'
import { useAutomationPrimaryButton } from 'features/aave/manage/helpers/use-automation-primary-button'
import { getTriggerExecutionPrice } from 'features/aave/manage/services/calculations'
import type {
  AutoBuyTriggerAaveContext,
  AutoBuyTriggerAaveEvent,
  BasicAutomationAaveState,
} from 'features/aave/manage/state'
import type { PositionLike } from 'features/aave/manage/state/triggersCommon'
import type { IStrategyConfig } from 'features/aave/types'
import {
  sidebarAutomationFeatureCopyMap,
  sidebarAutomationLinkMap,
} from 'features/automation/common/consts'
import { MaxGasPriceSection } from 'features/automation/common/sidebars/MaxGasPriceSection'
import { AutomationFeatures } from 'features/automation/common/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { TriggerAction } from 'helpers/lambda/triggers/setup-triggers'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { AddingStopLossAnimation } from 'theme/animations'
import { Box, Flex, Grid, Image, Text } from 'theme-ui'

type AutoBuyTriggerAaveContextWithPosition = AutoBuyTriggerAaveContext & {
  position: PositionLike
}

export interface AutoBuySidebarAaveVaultProps {
  strategy: IStrategyConfig
  state: AutoBuyTriggerAaveContextWithPosition
  isStateMatch: (state: BasicAutomationAaveState) => boolean
  canTransitWith: (event: AutoBuyTriggerAaveEvent) => boolean
  updateState: (event: AutoBuyTriggerAaveEvent) => void
  isEditing: boolean
  dropdown: SidebarSectionHeaderDropdown
}

function useDescriptionForAutoBuy({ state }: Pick<AutoBuySidebarAaveVaultProps, 'state'>) {
  const { t } = useTranslation()

  if (!state.executionTriggerLTV || !state.targetTriggerLTV) {
    return ''
  }
  const executionPrice = getTriggerExecutionPrice(state)

  if (!executionPrice) {
    return ''
  }

  if (state.price) {
    return t('auto-buy.set-trigger-description-ltv', {
      executionLTV: state.executionTriggerLTV,
      targetLTV: state.targetTriggerLTV,
      denomination: executionPrice.denomination,
      executionPrice: formatCryptoBalance(executionPrice.price),
      maxBuyPrice: formatCryptoBalance(state.price),
    })
  }

  if (state.usePriceInput) {
    return t('auto-buy.set-trigger-description-ltv-no-threshold', {
      executionLTV: state.executionTriggerLTV,
      targetLTV: state.targetTriggerLTV,
      denomination: executionPrice.denomination,
      executionPrice: formatCryptoBalance(executionPrice.price),
    })
  }

  return t('auto-buy.set-trigger-description-ltv-without-threshold', {
    executionLTV: state.executionTriggerLTV,
    targetLTV: state.targetTriggerLTV,
    denomination: executionPrice.denomination,
    executionPrice: formatCryptoBalance(executionPrice.price),
  })
}

function getAutoBuyInfoSectionProps({
  state,
}: Pick<AutoBuySidebarAaveVaultProps, 'state'>): BuyInfoSectionProps | undefined {
  if (!state.setupTriggerResponse?.simulation) {
    return undefined
  }

  const collateralAfterExecution = amountFromWei(
    new BigNumber(state.setupTriggerResponse?.simulation.collateralAmountAfterExecution),
    state.position.collateral.token.decimals,
  )

  return {
    transactionCost: state.gasEstimation ?? { gasEstimationStatus: 'unset' },
    isLoading: state.isLoading,
    collateralToBuy: collateralAfterExecution.minus(state.position.collateral.amount),
    positionAfterBuy: {
      debt: {
        amount: amountFromWei(
          new BigNumber(state.setupTriggerResponse?.simulation.debtAmountAfterExecution),
          state.position.debt.token.decimals,
        ),
        symbol: state.position.debt.token.symbol,
      },
      collateral: {
        amount: collateralAfterExecution,
        symbol: state.position.collateral.token.symbol,
      },
    },
    currentPosition: {
      debt: {
        amount: state.position.debt.amount,
        symbol: state.position.debt.token.symbol,
      },
      collateral: {
        amount: state.position.collateral.amount,
        symbol: state.position.collateral.token.symbol,
      },
    },
    executionLtv: parseInt(state.setupTriggerResponse.simulation.executionLTV) / 100,
    targetLtv: parseInt(state.setupTriggerResponse.simulation.targetLTV) / 100,
    targetLtvWithDeviation: state.setupTriggerResponse.simulation.targetLTVWithDeviation.map(
      (value) => parseInt(value) / 100,
    ) as [number, number],
    targetMultiple: parseInt(state.setupTriggerResponse.simulation.targetMultiple) / 100,
  }
}

function getRemoveTriggerSectionProps({
  state,
}: Pick<AutoBuySidebarAaveVaultProps, 'state'>): RemoveTriggerSectionProps | undefined {
  if (!state.setupTriggerResponse?.simulation) {
    return undefined
  }

  return {
    transactionCost: state.gasEstimation ?? { gasEstimationStatus: 'unset' },
    isLoading: state.isLoading,
  }
}

function AutoBuySidebarAaveVaultEditingState({
  state,
  isEditing,
  updateState,
}: AutoBuySidebarAaveVaultProps) {
  const { t } = useTranslation()
  const description = useDescriptionForAutoBuy({ state })

  const autoBuyInfoProps = getAutoBuyInfoSectionProps({ state })
  return (
    <>
      <>
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
          {description}{' '}
          <AppLink href={EXTERNAL_LINKS.KB.SETTING_AUTO_BUY} sx={{ fontSize: 2 }}>
            {t('here')}.
          </AppLink>
        </Text>{' '}
        <MultipleRangeSlider
          min={state.defaults.minSliderValue}
          max={state.defaults.maxSliderValue}
          onChange={(change) => {
            updateState({
              type: 'SET_EXECUTION_TRIGGER_LTV',
              executionTriggerLTV: change.value0,
            })
            updateState({
              type: 'SET_TARGET_TRIGGER_LTV',
              targetTriggerLTV: change.value1,
            })
          }}
          value={{
            value0: state.executionTriggerLTV ?? state.defaults.executionTriggerLTV,
            value1: state.targetTriggerLTV ?? state.defaults.targetTriggerLTV,
          }}
          valueColors={{
            value0: 'primary100',
            value1: 'success100',
          }}
          step={0.01}
          leftDescription={t('auto-buy.trigger-ltv')}
          rightDescription={t('auto-buy.target-ltv')}
          leftThumbColor="primary100"
          rightThumbColor="success100"
        />
        {state.usePriceInput && (
          <VaultActionInput
            action={t('auto-buy.set-max-buy-price')}
            amount={state.price}
            hasAuxiliary={false}
            hasError={false}
            currencyCode={
              state.position.pricesDenomination === 'collateral'
                ? state.position.debt.token.symbol
                : state.position.collateral.token.symbol
            }
            onChange={handleNumericInput((price) => {
              updateState({ type: 'SET_PRICE', price: price })
            })}
            onToggle={(toggle) => {
              updateState({ type: 'SET_USE_PRICE', enabled: toggle })
            }}
            showToggle={true}
            toggleOnLabel={t('protection.set-no-threshold')}
            toggleOffLabel={t('protection.set-threshold')}
            toggleOffPlaceholder={t('protection.no-threshold')}
            defaultToggle={state.usePrice}
          />
        )}
      </>
      {isEditing && (
        <>
          <VaultErrors
            errorMessages={mapErrorsToErrorVaults(state.setupTriggerResponse?.errors)}
            autoType="Auto-Buy"
            infoBag={{
              maxLTV: `${state.defaults.maxSliderValue}%`,
            }}
          />
          <VaultWarnings
            warningMessages={mapWarningsToWarningVaults(state.setupTriggerResponse?.warnings)}
          />
        </>
      )}
      <MaxGasPriceSection
        onChange={(gasFee) => {
          updateState({ type: 'SET_MAX_GAS_FEE', maxGasFee: gasFee })
        }}
        value={state.maxGasFee ?? 300}
      />
      {isEditing && (
        <>
          <SidebarResetButton
            clear={() => {
              updateState({ type: 'RESET' })
            }}
          />
          {autoBuyInfoProps && <AutoBuyInfoSection {...autoBuyInfoProps} />}
        </>
      )}
    </>
  )
}

function AutoBuySidebarAaveVaultReviewState({ state }: AutoBuySidebarAaveVaultProps) {
  const autoBuyInfoProps = getAutoBuyInfoSectionProps({ state })
  return <>{autoBuyInfoProps && <AutoBuyInfoSection {...autoBuyInfoProps} />}</>
}

function AutoBuySidebarAaveVaultRemoveState({ state }: AutoBuySidebarAaveVaultProps) {
  const { t } = useTranslation()
  const autoBuyInfoProps = getRemoveTriggerSectionProps({ state })
  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('automation.cancel-summary-description', {
          feature: t(sidebarAutomationFeatureCopyMap[AutomationFeatures.AUTO_BUY]),
        })}
      </Text>
      {autoBuyInfoProps && <RemoveTriggerInfoSection {...autoBuyInfoProps} />}
    </>
  )
}

function AutoBuySidebarAaveVaultTxState({ state }: AutoBuySidebarAaveVaultProps) {
  const autoBuyInfoProps = getAutoBuyInfoSectionProps({ state })
  return (
    <Grid gap={3}>
      <AddingStopLossAnimation />
      {autoBuyInfoProps && <AutoBuyInfoSection {...autoBuyInfoProps} />}
    </Grid>
  )
}

function AutoBuySidebarAaveVaultTxDoneState({ state }: AutoBuySidebarAaveVaultProps) {
  const { t } = useTranslation()
  return (
    <>
      <Box>
        <Flex sx={{ justifyContent: 'center', mb: 4 }}>
          <Image src={staticFilesRuntimeUrl('/static/img/protection_complete_v2.svg')} />
        </Flex>
      </Box>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {state.action === TriggerAction.Add && (
          <>
            {t('automation-creation.add-complete-content', {
              featureName: t(sidebarAutomationFeatureCopyMap[state.feature]),
            })}{' '}
            <AppLink
              href={`https://docs.summer.fi/products/${sidebarAutomationLinkMap[state.feature]}`}
              sx={{ fontSize: 2 }}
            >
              {t('here')}.
            </AppLink>
          </>
        )}
        {state.action === TriggerAction.Remove &&
          t('automation-creation.remove-complete-content', {
            featureName: t(sidebarAutomationFeatureCopyMap[state.feature]),
          })}
      </Text>
      <Box>
        <VaultChangesWithADelayCard />
      </Box>
    </>
  )
}

export function SideBarContent(props: AutoBuySidebarAaveVaultProps) {
  const { isStateMatch } = props
  switch (true) {
    case isStateMatch('editing'):
    case isStateMatch('idle'):
      return <AutoBuySidebarAaveVaultEditingState {...props} />
    case isStateMatch('review'):
      return <AutoBuySidebarAaveVaultReviewState {...props} />
    case isStateMatch('remove'):
      return <AutoBuySidebarAaveVaultRemoveState {...props} />
    case isStateMatch('tx'):
      return <AutoBuySidebarAaveVaultTxState {...props} />
    case isStateMatch('txDone'):
      return <AutoBuySidebarAaveVaultTxDoneState {...props} />
  }
  return <></>
}

export function useTextButton(
  props: AutoBuySidebarAaveVaultProps,
): SidebarSectionFooterButtonSettings | undefined {
  const { isStateMatch } = props
  const { t } = useTranslation()

  if (isStateMatch('review') || isStateMatch('remove')) {
    return {
      isLoading: props.state.isLoading,
      action: () => {
        props.updateState({ type: 'GO_TO_EDITING' })
      },
      label: t('back-to-editing'),
    }
  }

  if (
    (isStateMatch('editing') || isStateMatch('idle')) &&
    props.canTransitWith({ type: 'REMOVE_TRIGGER' })
  ) {
    return {
      isLoading: props.state.isLoading,
      action: () => {
        props.updateState({ type: 'REMOVE_TRIGGER' })
      },
      label: t('system.remove-trigger'),
    }
  }

  return undefined
}

export function AutoBuySidebarAaveVault(props: AutoBuySidebarAaveVaultProps) {
  const { t } = useTranslation()

  const { strategy } = props

  const primaryButton = useAutomationPrimaryButton(props)
  const textButton = useTextButton(props)

  return (
    <SidebarSection
      dropdown={props.dropdown}
      title={t('auto-buy.title')}
      primaryButton={primaryButton}
      content={
        <Grid gap={3}>
          <SideBarContent {...props} />
        </Grid>
      }
      requireConnection={true}
      requiredChainHexId={strategy.networkHexId}
      textButton={textButton}
    />
  )
}
