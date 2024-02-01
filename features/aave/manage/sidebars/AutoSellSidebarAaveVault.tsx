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
import { RemoveTriggerInfoSection, type RemoveTriggerSectionProps } from 'features/aave/components'
import type { AutoSellInfoSectionProps } from 'features/aave/components/AutoSellInfoSection'
import { AutoSellInfoSection } from 'features/aave/components/AutoSellInfoSection'
import { mapErrorsToErrorVaults, mapWarningsToWarningVaults } from 'features/aave/helpers'
import { getTriggerExecutionCollateralPriceDenominatedInDebt } from 'features/aave/manage/services/calculations'
import type {
  AutoSellTriggerAaveContext,
  AutoSellTriggerAaveEvent,
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
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { TriggerAction } from 'helpers/triggers/setup-triggers'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { AddingStopLossAnimation } from 'theme/animations'
import { Box, Flex, Grid, Image, Text } from 'theme-ui'

type AutoSellTriggerAaveContextWithPosition = AutoSellTriggerAaveContext & {
  position: PositionLike
}

interface AutoSellSidebarAaveVaultProps {
  strategy: IStrategyConfig
  state: AutoSellTriggerAaveContextWithPosition
  isStateMatch: (state: BasicAutomationAaveState) => boolean
  canTransitWith: (event: AutoSellTriggerAaveEvent) => boolean
  updateState: (event: AutoSellTriggerAaveEvent) => void
  isEditing: boolean
  dropdown: SidebarSectionHeaderDropdown
}

function useDescriptionForAutoSell({ state }: Pick<AutoSellSidebarAaveVaultProps, 'state'>) {
  const { t } = useTranslation()

  if (!state.executionTriggerLTV || !state.targetTriggerLTV) {
    return ''
  }
  const executionPrice = getTriggerExecutionCollateralPriceDenominatedInDebt(state)

  if (!executionPrice) {
    return ''
  }

  if (state.price) {
    return t('auto-sell.set-trigger-description-ltv', {
      executionLTV: state.executionTriggerLTV,
      targetLTV: state.targetTriggerLTV,
      denomination: `USD`,
      executionPrice: formatCryptoBalance(executionPrice),
      minSellPrice: formatCryptoBalance(state.price),
    })
  }
  return t('auto-sell.set-trigger-description-ltv-no-threshold', {
    executionLTV: state.executionTriggerLTV,
    targetLTV: state.targetTriggerLTV,
    denomination: `USD`,
    executionPrice: formatCryptoBalance(executionPrice),
  })
}

function getAutoSellInfoSectionProps({
  state,
}: Pick<AutoSellSidebarAaveVaultProps, 'state'>): AutoSellInfoSectionProps | undefined {
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
    collateralToSell: state.position.collateral.amount.minus(collateralAfterExecution),
    positionAfterSell: {
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
}: Pick<AutoSellSidebarAaveVaultProps, 'state'>): RemoveTriggerSectionProps | undefined {
  if (!state.setupTriggerResponse?.simulation) {
    return undefined
  }

  return {
    transactionCost: state.gasEstimation ?? { gasEstimationStatus: 'unset' },
    isLoading: state.isLoading,
  }
}

function AutoSellSidebarAaveVaultEditingState({
  state,
  isEditing,
  updateState,
}: AutoSellSidebarAaveVaultProps) {
  const { t } = useTranslation()
  const description = useDescriptionForAutoSell({ state })

  const autoSellInfoProps = getAutoSellInfoSectionProps({ state })
  return (
    <>
      <>
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
          {description}{' '}
          <AppLink href={EXTERNAL_LINKS.KB.SETTING_AUTO_SELL} sx={{ fontSize: 2 }}>
            {t('here')}.
          </AppLink>
        </Text>{' '}
        <MultipleRangeSlider
          min={state.defaults.minSliderValue}
          max={state.defaults.maxSliderValue}
          onChange={(change) => {
            updateState({
              type: 'SET_EXECUTION_TRIGGER_LTV',
              executionTriggerLTV: change.value1,
            })
            updateState({
              type: 'SET_TARGET_TRIGGER_LTV',
              targetTriggerLTV: change.value0,
            })
          }}
          value={{
            value0: state.targetTriggerLTV ?? state.defaults.targetTriggerLTV,
            value1: state.executionTriggerLTV ?? state.defaults.executionTriggerLTV,
          }}
          valueColors={{
            value0: 'success100',
            value1: 'primary100',
          }}
          step={0.01}
          leftDescription={t('auto-sell.target-ltv')}
          rightDescription={t('auto-sell.trigger-ltv')}
          leftThumbColor="success100"
          rightThumbColor="primary100"
        />
        <VaultActionInput
          action={t('auto-sell.set-min-sell-price')}
          amount={state.price}
          hasAuxiliary={false}
          hasError={false}
          currencyCode={'USD'}
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
      </>
      {isEditing && (
        <>
          <VaultErrors
            errorMessages={mapErrorsToErrorVaults(state.setupTriggerResponse?.errors)}
            autoType="Auto-Sell"
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
          {autoSellInfoProps && <AutoSellInfoSection {...autoSellInfoProps} />}
        </>
      )}
    </>
  )
}

function AutoBuySidebarAaveVaultReviewState({ state }: AutoSellSidebarAaveVaultProps) {
  const autoSellInfoProps = getAutoSellInfoSectionProps({ state })
  return <>{autoSellInfoProps && <AutoSellInfoSection {...autoSellInfoProps} />}</>
}

function AutoSellSidebarAaveVaultRemoveState({ state }: AutoSellSidebarAaveVaultProps) {
  const { t } = useTranslation()
  const autoBuyInfoProps = getRemoveTriggerSectionProps({ state })
  return (
    <>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('automation.cancel-summary-description', {
          feature: t(sidebarAutomationFeatureCopyMap[AutomationFeatures.AUTO_SELL]),
        })}
      </Text>
      {autoBuyInfoProps && <RemoveTriggerInfoSection {...autoBuyInfoProps} />}
    </>
  )
}

function AutoBuySidebarAaveVaultTxState({ state }: AutoSellSidebarAaveVaultProps) {
  const autoSellInfoProps = getAutoSellInfoSectionProps({ state })
  return (
    <Grid gap={3}>
      <AddingStopLossAnimation />
      {autoSellInfoProps && <AutoSellInfoSection {...autoSellInfoProps} />}
    </Grid>
  )
}

function AutoBuySidebarAaveVaultTxDoneState({ state }: AutoSellSidebarAaveVaultProps) {
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

export function SideBarContent(props: AutoSellSidebarAaveVaultProps) {
  const { isStateMatch } = props
  switch (true) {
    case isStateMatch('editing'):
    case isStateMatch('idle'):
      return <AutoSellSidebarAaveVaultEditingState {...props} />
    case isStateMatch('review'):
      return <AutoBuySidebarAaveVaultReviewState {...props} />
    case isStateMatch('remove'):
      return <AutoSellSidebarAaveVaultRemoveState {...props} />
    case isStateMatch('tx'):
      return <AutoBuySidebarAaveVaultTxState {...props} />
    case isStateMatch('txDone'):
      return <AutoBuySidebarAaveVaultTxDoneState {...props} />
  }
  return <></>
}

export function usePrimaryButton(
  props: AutoSellSidebarAaveVaultProps,
): SidebarSectionFooterButtonSettings {
  const { isStateMatch, canTransitWith } = props
  const { t } = useTranslation()
  const editingLabel =
    props.state.action === TriggerAction.Add
      ? t('automation.add-trigger', {
          feature: t(sidebarAutomationFeatureCopyMap[props.state.feature]),
        })
      : t('automation.update-trigger', {
          feature: t(sidebarAutomationFeatureCopyMap[props.state.feature]),
        })

  switch (true) {
    case isStateMatch('idle'):
      return {
        isLoading: props.state.isLoading,
        action: () => {},
        disabled: true,
        label: editingLabel,
        steps: [1, 3],
      }
    case isStateMatch('editing'):
      return {
        isLoading: props.state.isLoading,
        action: () => {
          props.updateState({ type: 'REVIEW_TRANSACTION' })
        },
        disabled: !canTransitWith({ type: 'REVIEW_TRANSACTION' }),
        label: editingLabel,
        steps: [1, 3],
      }
    case isStateMatch('review'):
      return {
        isLoading: props.state.isLoading,
        action: () => {
          props.updateState({ type: 'START_TRANSACTION' })
        },
        disabled: !canTransitWith({ type: 'START_TRANSACTION' }),
        label: props.state.retryCount > 0 ? t('retry') : t('protection.confirm'),
        steps: [2, 3],
      }
    case isStateMatch('remove'):
      return {
        isLoading: props.state.isLoading,
        action: () => {
          props.updateState({ type: 'START_TRANSACTION' })
        },
        disabled: !canTransitWith({ type: 'START_TRANSACTION' }),
        label:
          props.state.retryCount > 0
            ? t('retry')
            : t('automation.cancel-trigger', {
                feature: t(sidebarAutomationFeatureCopyMap[props.state.feature]),
              }),
      }
    case isStateMatch('tx'):
      return {
        isLoading: props.state.isLoading,
        action: () => {},
        disabled: true,
        label: t('automation.setting', {
          feature: t(sidebarAutomationFeatureCopyMap[props.state.feature]),
        }),
        steps: [3, 3],
      }
    case isStateMatch('txDone'):
      return {
        isLoading: props.state.isLoading,
        action: () => {
          props.updateState({ type: 'RESET' })
        },
        disabled: false,
        label: t('finished'),
      }
  }
  return {
    isLoading: props.state.isLoading,
    action: () => {},
    disabled: true,
    label: '',
  }
}

export function useTextButton(
  props: AutoSellSidebarAaveVaultProps,
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
      steps: [2, 3],
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

export function AutoSellSidebarAaveVault(props: AutoSellSidebarAaveVaultProps) {
  const { t } = useTranslation()

  const { strategy } = props

  const primaryButton = usePrimaryButton(props)
  const textButton = useTextButton(props)

  return (
    <SidebarSection
      dropdown={props.dropdown}
      title={t('auto-sell.title')}
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
