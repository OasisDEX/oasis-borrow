import { TxStatus } from '@oasisdex/transactions'
import { Box } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { PickCloseStateProps } from 'components/dumb/PickCloseState'
import { RetryableLoadingButtonProps } from 'components/dumb/RetryableLoadingButton'
import { SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import { GasEstimation } from 'components/GasEstimation'
import {
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { formatAmount, formatFiatBalance, formatPercent } from 'helpers/formatters/format'
import { TxError } from 'helpers/types'
import { one } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex } from 'theme-ui'

interface AdjustSlFormInformationProps {
  tokenPrice: BigNumber
  afterStopLossRatio: BigNumber
  vault: Vault
  ilkData: IlkData
  token: string
  isCollateralActive: boolean
  txState?: TxStatus
  txCost: BigNumber
}

export function ProtectionCompleteInformation({
  afterStopLossRatio,
  vault,
  ilkData,
  token,
  isCollateralActive,
  txCost,
  tokenPrice,
}: AdjustSlFormInformationProps) {
  const { t } = useTranslation()

  const dynamicStopLossPrice = vault.liquidationPrice
    .div(ilkData.liquidationRatio)
    .times(afterStopLossRatio.div(100))

  const maxToken = vault.lockedCollateral
    .times(dynamicStopLossPrice)
    .minus(vault.debt)
    .div(dynamicStopLossPrice)

  const maxTokenOrDai = isCollateralActive
    ? `${formatAmount(maxToken, token)} ${token}`
    : `${formatAmount(maxToken.multipliedBy(tokenPrice), 'USD')} DAI`

  return (
    <VaultChangesInformationContainer title={t('protection.summary-of-protection')}>
      <VaultChangesInformationItem
        label={`${t('protection.stop-loss-coll-ratio')}`}
        value={
          <Flex>
            {formatPercent(afterStopLossRatio, {
              precision: 2,
              roundMode: BigNumber.ROUND_DOWN,
            })}
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`${t('protection.dynamic-stop-loss')}`}
        value={<Flex>${formatAmount(dynamicStopLossPrice, 'USD')}</Flex>}
      />
      <VaultChangesInformationItem
        label={`${t('protection.token-on-stop-loss-trigger', {
          token: isCollateralActive ? token : 'DAI',
        })}`}
        value={<Flex>{maxTokenOrDai}</Flex>}
      />
      <VaultChangesInformationItem
        label={`${t('protection.total-cost')}`}
        value={<Flex>${formatAmount(txCost, 'USD')}</Flex>}
      />
    </VaultChangesInformationContainer>
  )
}

interface SetDownsideProtectionInformationProps {
  vault: Vault
  ilkData: IlkData
  token: string
  afterStopLossRatio: BigNumber
  tokenPrice: BigNumber
  ethPrice: BigNumber
  isCollateralActive: boolean
  collateralizationRatioAtNextPrice: BigNumber
  selectedSLValue: BigNumber
  ethBalance: BigNumber
  txError?: TxError
  currentCollateralRatio: BigNumber
}

export function SetDownsideProtectionInformation({
  vault,
  ilkData,
  token,
  afterStopLossRatio,
  tokenPrice,
  ethPrice,
  isCollateralActive,
}: SetDownsideProtectionInformationProps) {
  const { t } = useTranslation()

  const afterDynamicStopLossPrice = vault.liquidationPrice
    .div(ilkData.liquidationRatio)
    .times(afterStopLossRatio.div(100))

  const afterMaxToken = vault.lockedCollateral
    .times(afterDynamicStopLossPrice)
    .minus(vault.debt)
    .div(afterDynamicStopLossPrice)

  const ethDuringLiquidation = vault.lockedCollateral
    .times(vault.liquidationPrice)
    .minus(vault.debt.multipliedBy(one.plus(ilkData.liquidationPenalty)))
    .div(vault.liquidationPrice)

  const savingCompareToLiquidation = afterMaxToken.minus(ethDuringLiquidation)

  const maxTokenOrDai = isCollateralActive
    ? `${formatAmount(afterMaxToken, token)} ${token}`
    : `${formatAmount(afterMaxToken.multipliedBy(tokenPrice), 'USD')} DAI`

  const savingTokenOrDai = isCollateralActive
    ? `${formatAmount(savingCompareToLiquidation, token)} ${token}`
    : `${formatAmount(savingCompareToLiquidation.multipliedBy(tokenPrice), 'USD')} DAI`

  const closeVaultGasEstimation = new BigNumber(1300000) // average based on historical data from blockchain
  const closeVaultGasPrice = new BigNumber(200) // gwei
  const estimatedFeesWhenSlTriggered = formatFiatBalance(
    closeVaultGasEstimation
      .multipliedBy(closeVaultGasPrice)
      .multipliedBy(ethPrice)
      .dividedBy(new BigNumber(10).pow(9)),
  )

  return (
    <VaultChangesInformationContainer title={t('protection.on-stop-loss-trigger')}>
      <VaultChangesInformationItem
        label={`${t('protection.estimated-to-receive')}`}
        value={
          <Flex>
            {t('protection.up-to')} {maxTokenOrDai}
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`${t('protection.saving-comp-to-liquidation')}`}
        value={
          <Flex>
            {t('protection.up-to')} {savingTokenOrDai}
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`${t('protection.estimated-fees-on-trigger', { token })}`}
        value={<Flex>${estimatedFeesWhenSlTriggered}</Flex>}
        tooltip={<Box>{t('protection.sl-triggered-gas-estimation')}</Box>}
      />
      <VaultChangesInformationItem
        label={`${t('protection.max-cost')}`}
        value={<GasEstimation />}
      />
    </VaultChangesInformationContainer>
  )
}

export interface AdjustSlFormLayoutProps {
  token: string
  closePickerConfig: PickCloseStateProps
  slValuePickerConfig: SliderValuePickerProps
  addTriggerConfig: RetryableLoadingButtonProps
  accountIsController: boolean
  txProgressing: boolean
  txState?: TxStatus
  txHash?: string
  txError?: TxError
  txCost?: BigNumber
  dynamicStopLossPrice: BigNumber
  amountOnStopLossTrigger: BigNumber
  tokenPrice: BigNumber
  ethPrice: BigNumber
  vault: Vault
  ilkData: IlkData
  etherscan: string
  toggleForms: () => void
  selectedSLValue: BigNumber
  firstStopLossSetup: boolean
  isEditing: boolean
  collateralizationRatioAtNextPrice: BigNumber
  ethBalance: BigNumber
  currentCollateralRatio: BigNumber
  stage: 'stopLossEditing' | 'txInProgress' | 'txSuccess' | 'txFailure'
  isProgressDisabled: boolean
  redirectToCloseVault: () => void
  isStopLossEnabled: boolean
  isAutoSellEnabled: boolean
  isConstantMultipleEnabled: boolean
  autoBuyTriggerData: BasicBSTriggerData
}
