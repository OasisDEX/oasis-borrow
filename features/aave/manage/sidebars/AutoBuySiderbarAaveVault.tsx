import { AppLink } from 'components/Links'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import type { SidebarSectionHeaderDropdown } from 'components/sidebar/SidebarSectionHeader'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { getTriggerExecutionCollateralPriceDenominatedInDebt } from 'features/aave/manage/services/calculations'
import type {
  AutoBuyTriggerAaveContext,
  AutoBuyTriggerAaveEvent,
  PositionLike,
} from 'features/aave/manage/state'
import type { IStrategyConfig } from 'features/aave/types'
import { MaxGasPriceSection } from 'features/automation/common/sidebars/MaxGasPriceSection'
import { AutomationFeatures } from 'features/automation/common/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { circle_exchange } from 'theme/icons'
import { Text } from 'theme-ui'

type AutoBuyTriggerAaveContextWithPosition = AutoBuyTriggerAaveContext & {
  position: PositionLike
}

interface AutoBuySiderbarAaveVaultProps {
  strategy: IStrategyConfig
  state: AutoBuyTriggerAaveContextWithPosition
  updateState: (event: AutoBuyTriggerAaveEvent) => void
  isEditing: boolean
}

function useDropdown(): SidebarSectionHeaderDropdown {
  const { t } = useTranslation()
  const hasAutomBuyEnabled = false
  return {
    items: [
      {
        label: `${hasAutomBuyEnabled ? 'Manage' : 'Setup'} ${t('system.basic-buy')}`,
        shortLabel: t('system.basic-buy'),
        iconShrink: 2,
        icon: circle_exchange,
        panel: AutomationFeatures.AUTO_BUY,
      },
    ],
  }
}

function useDescriptionForAutoBuy({ state }: Pick<AutoBuySiderbarAaveVaultProps, 'state'>) {
  const { t } = useTranslation()

  if (!state.executionTriggerLTV || !state.targetTriggerLTV) {
    return ''
  }
  const executionPrice = getTriggerExecutionCollateralPriceDenominatedInDebt(state)

  if (!executionPrice) {
    return ''
  }

  if (state.maxBuyPrice) {
    return t('auto-buy.set-trigger-description-ltv', {
      executionLTV: state.executionTriggerLTV,
      targetLTV: state.targetTriggerLTV,
      denomination: `${state.position.collateral.symbol}/${state.position.debt.symbol}`,
      executionPrice: formatCryptoBalance(executionPrice),
      maxBuyPrice: formatCryptoBalance(state.maxBuyPrice),
    })
  }
  return t('auto-buy.set-trigger-description-ltv-no-threshold', {
    executionLTV: state.executionTriggerLTV,
    targetLTV: state.targetTriggerLTV,
    denomination: `${state.position.collateral.symbol}/${state.position.debt.symbol}`,
    executionPrice: formatCryptoBalance(executionPrice),
  })
}

export function AutoBuySiderbarAaveVault({
  strategy,
  state,
  updateState,
  isEditing,
}: AutoBuySiderbarAaveVaultProps) {
  const { t } = useTranslation()
  const dropdown = useDropdown()

  const description = useDescriptionForAutoBuy({ state })

  return (
    <SidebarSection
      dropdown={dropdown}
      title={t('auto-buy.title')}
      primaryButton={{
        action: () => {},
        disabled: !isEditing,
        label: 'Add',
      }}
      content={
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
              step={1}
              leftDescription={t('auto-buy.trigger-ltv')}
              rightDescription={t('auto-buy.target-ltv')}
              leftThumbColor="primary100"
              rightThumbColor="success100"
            />
            <VaultActionInput
              action={t('auto-buy.set-max-buy-price')}
              amount={state.maxBuyPrice}
              hasAuxiliary={false}
              hasError={false}
              currencyCode={state.position.debt.symbol}
              onChange={handleNumericInput((price) => {
                updateState({ type: 'SET_MAX_BUY_PRICE', price: price })
              })}
              onToggle={(toggle) => {
                updateState({ type: 'SET_USE_MAX_BUY_PRICE', enabled: !toggle })
              }}
              showToggle={true}
              toggleOnLabel={t('protection.set-no-threshold')}
              toggleOffLabel={t('protection.set-threshold')}
              toggleOffPlaceholder={t('protection.no-threshold')}
              defaultToggle={!state.useMaxBuyPrice}
            />
          </>
          {/*{false && (*/}
          {/*  <>*/}
          {/*    <VaultErrors errorMessages={[]} ilkData={{ debtFloor, token }} autoType="Auto-Buy" />*/}
          {/*    <VaultWarnings warningMessages={[]} ilkData={{ debtFloor }} />*/}
          {/*  </>*/}
          {/*)}*/}
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
              {/*<AutoBuyInfoSectionControl*/}
              {/*  executionPrice={executionPrice}*/}
              {/*  autoBuyState={autoBuyState}*/}
              {/*  debtDelta={debtDelta}*/}
              {/*  collateralDelta={collateralDelta}*/}
              {/*/>*/}
            </>
          )}
        </>
      }
      requireConnection={true}
      requiredChainHexId={strategy.networkHexId}
    />
  )
}
