import { TxState, TxStatus } from '@oasisdex/transactions'
import { amountFromWei } from '@oasisdex/utils'
import { Box, Grid } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import { PickCloseState, PickCloseStateProps } from 'components/dumb/PickCloseState'
import { SliderValuePicker, SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Divider, Flex, Image } from 'theme-ui'

import { IlkData } from '../../../blockchain/ilks'
import { Vault } from '../../../blockchain/vaults'
import { FormHeader } from '../../../components/dumb/FormHeader'
import {
  RetryableLoadingButton,
  RetryableLoadingButtonProps,
} from '../../../components/dumb/RetryableLoadingButton'
import { TxStatusSection } from '../../../components/dumb/TxStatusSection'
import {
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from '../../../components/vault/VaultChangesInformation'
import { formatAmount, formatPercent } from '../../../helpers/formatters/format'
import { staticFilesRuntimeUrl } from '../../../helpers/staticPaths'
import { zero } from '../../../helpers/zero'
import { OpenVaultAnimation } from '../../../theme/animations'

interface AdjustSlFormHeaderProps {
  txProgressing: boolean
  txSuccess: boolean
}

// TODO potential to be a config-based component per specific state, to be verified with close step
function AdjustSlFormHeader({ txProgressing, txSuccess }: AdjustSlFormHeaderProps) {
  const { t } = useTranslation()
  const txStates = txProgressing || txSuccess

  return (
    <>
      {!txStates && (
        <FormHeader
          header={t('slider.set-stoploss.introduction-header')}
          description={t('slider.set-stoploss.introduction-content')}
        />
      )}
      {txProgressing && (
        <FormHeader
          header={t('protection.setting-downside-protection')}
          description={t('protection.setting-downside-protection-desc')}
          withDivider
        />
      )}
      {txSuccess && (
        <FormHeader
          header={t('protection.downside-protection-complete')}
          description={t('protection.downside-protection-complete-desc')}
        />
      )}
    </>
  )
}

interface AdjustSlFormInformationProps {
  ethPrice: BigNumber
  stopLossLevel: BigNumber
  vault: Vault
  ilkData: IlkData
  token: string
  txState?: TxState<AutomationBotAddTriggerData>
}

// TODO close to DAI case is currently not handled on the UI, it will be covered in separate task
function ProtectionCompleteInformation({
  ethPrice,
  stopLossLevel,
  vault,
  ilkData,
  token,
  txState,
}: AdjustSlFormInformationProps) {
  const { t } = useTranslation()

  const successTx = txState?.status === TxStatus.Success
  const gasUsed = successTx ? new BigNumber(txState.receipt.gasUsed) : zero
  const effectiveGasPrice = successTx ? new BigNumber(txState.receipt.effectiveGasPrice) : zero
  const totalCost =
    !gasUsed.eq(0) && !effectiveGasPrice.eq(0)
      ? amountFromWei(gasUsed.multipliedBy(effectiveGasPrice)).multipliedBy(ethPrice)
      : zero

  const dynamicStopLossPrice = vault.liquidationPrice
    .div(ilkData.liquidationRatio)
    .times(stopLossLevel)

  const amountOnStopLossTrigger = vault.lockedCollateral
    .times(dynamicStopLossPrice)
    .minus(vault.debt)
    .div(dynamicStopLossPrice)

  return (
    <VaultChangesInformationContainer title="Summary of protection">
      <VaultChangesInformationItem
        label={`${t('protection.stop-loss-coll-ratio')}`}
        value={
          <Flex>
            {formatPercent(stopLossLevel.times(100), {
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
        label={`${t('protection.token-on-stop-loss-trigger', { token })}`}
        value={
          <Flex>
            {formatAmount(amountOnStopLossTrigger, token)} {token}
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`${t('protection.total-cost')}`}
        value={<Flex>${formatAmount(totalCost, 'USD')}</Flex>}
      />
    </VaultChangesInformationContainer>
  )
}

export interface AdjustSlFormLayoutProps {
  token: string
  closePickerConfig: PickCloseStateProps
  slValuePickerConfig: SliderValuePickerProps
  addTriggerConfig: RetryableLoadingButtonProps
  gasEstimation: ReactNode
  accountIsController: boolean
  txProgressing: boolean
  txSuccess: boolean
  txState?: TxState<AutomationBotAddTriggerData>
  stopLossLevel: BigNumber
  dynamicStopLossPrice: BigNumber
  amountOnStopLossTrigger: BigNumber
  ethPrice: BigNumber
  vault: Vault
  ilkData: IlkData
  isEditing: boolean
  etherscan: string
}

export function AdjustSlFormLayout({
  token,
  txProgressing,
  txSuccess,
  txState,
  slValuePickerConfig,
  closePickerConfig,
  accountIsController,
  addTriggerConfig,
  stopLossLevel,
  ethPrice,
  vault,
  ilkData,
  isEditing,
  gasEstimation,
  etherscan,
}: AdjustSlFormLayoutProps) {
  return (
    <Grid columns={[1]}>
      <AdjustSlFormHeader txProgressing={txProgressing} txSuccess={txSuccess} />
      {txProgressing && <OpenVaultAnimation />}
      {!txProgressing && !txSuccess && (
        <>
          <Box>
            <SliderValuePicker {...slValuePickerConfig} />
          </Box>
          <Box>
            <PickCloseState {...closePickerConfig} />
          </Box>
        </>
      )}

      {txSuccess && (
        <Box>
          <Flex sx={{ justifyContent: 'center', transform: 'translateX(5%)', mb: 4 }}>
            <Image src={staticFilesRuntimeUrl('/static/img/protection_complete.svg')} />
          </Flex>
          <Divider variant="styles.hrVaultFormBottom" mb={4} />
          <ProtectionCompleteInformation
            token={token}
            txState={txState}
            stopLossLevel={stopLossLevel}
            ethPrice={ethPrice}
            vault={vault}
            ilkData={ilkData}
          />
        </Box>
      )}
      <Box>
        <TxStatusSection txState={txState} etherscan={etherscan} />
      </Box>
      {accountIsController && !txProgressing && (
        <Box>
          <RetryableLoadingButton {...addTriggerConfig} />
        </Box>
      )}
      {/* TODO for now added as new line of text, this should be eventually included within changes information */}
      {isEditing && !txProgressing && !txSuccess && <Flex>Gas estimation: {gasEstimation}</Flex>}
    </Grid>
  )
}
