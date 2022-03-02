import { TxState, TxStatus } from '@oasisdex/transactions'
import { amountFromWei } from '@oasisdex/utils'
import { Box, Grid } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import { PickCloseState, PickCloseStateProps } from 'components/dumb/PickCloseState'
import { SliderValuePicker, SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'
import { Divider, Flex, Image, Text } from 'theme-ui'

import { IlkData } from '../../../blockchain/ilks'
import { Vault } from '../../../blockchain/vaults'
import { RetryableLoadingButtonProps } from '../../../components/dumb/RetryableLoadingButton'
import { TxStatusSection } from '../../../components/dumb/TxStatusSection'
import { AppLink } from '../../../components/Links'
import {
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from '../../../components/vault/VaultChangesInformation'
import { formatAmount, formatPercent } from '../../../helpers/formatters/format'
import { staticFilesRuntimeUrl } from '../../../helpers/staticPaths'
import { zero } from '../../../helpers/zero'
import { OpenVaultAnimation } from '../../../theme/animations'
import { AutomationFormButtons } from '../common/components/AutomationFormButtons'
import { AutomationFormHeader } from '../common/components/AutomationFormHeader'

interface AdjustSlFormInformationProps {
  tokenPrice: BigNumber
  stopLossLevel: BigNumber
  vault: Vault
  ilkData: IlkData
  token: string
  isCollateralActive: boolean
  txState?: TxState<AutomationBotAddTriggerData>
}

function ProtectionCompleteInformation({
  tokenPrice,
  stopLossLevel,
  vault,
  ilkData,
  token,
  isCollateralActive,
  txState,
}: AdjustSlFormInformationProps) {
  const { t } = useTranslation()

  const successTx = txState?.status === TxStatus.Success
  const gasUsed = successTx ? new BigNumber(txState.receipt.gasUsed) : zero
  const effectiveGasPrice = successTx ? new BigNumber(txState.receipt.effectiveGasPrice) : zero
  const totalCost =
    !gasUsed.eq(0) && !effectiveGasPrice.eq(0)
      ? amountFromWei(gasUsed.multipliedBy(effectiveGasPrice)).multipliedBy(tokenPrice)
      : zero

  const dynamicStopLossPrice = vault.liquidationPrice
    .div(ilkData.liquidationRatio)
    .times(stopLossLevel)

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
        label={`${t('protection.token-on-stop-loss-trigger', {
          token: isCollateralActive ? token : 'DAI',
        })}`}
        value={<Flex>{maxTokenOrDai}</Flex>}
      />
      <VaultChangesInformationItem
        label={`${t('protection.total-cost')}`}
        value={<Flex>${formatAmount(totalCost, 'USD')}</Flex>}
      />
    </VaultChangesInformationContainer>
  )
}

interface SetDownsideProtectionInformationProps {
  vault: Vault
  ilkData: IlkData
  token: string
  gasEstimation: ReactNode
  afterStopLossRatio: BigNumber
  tokenPrice: BigNumber
  isCollateralActive: boolean
}

function SetDownsideProtectionInformation({
  vault,
  ilkData,
  token,
  gasEstimation,
  afterStopLossRatio,
  tokenPrice,
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

  const ethDuringLiquidation = vault.debt
    .times(ilkData.liquidationRatio)
    .div(vault.liquidationPrice)

  const savingCompareToLiquidation = ethDuringLiquidation.minus(afterMaxToken)

  const maxTokenOrDai = isCollateralActive
    ? `${formatAmount(afterMaxToken, token)} ${token}`
    : `${formatAmount(afterMaxToken.multipliedBy(tokenPrice), 'USD')} DAI`

  const savingTokenOrDai = isCollateralActive
    ? `${formatAmount(savingCompareToLiquidation, token)} ${token}`
    : `${formatAmount(savingCompareToLiquidation.multipliedBy(tokenPrice), 'USD')} DAI`

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
        // TODO replace with correct estimation
        value={<Flex>${formatAmount(new BigNumber(30), 'USD')}</Flex>}
      />
      <VaultChangesInformationItem label={`${t('protection.max-cost')}`} value={gasEstimation} />
      <Box sx={{ fontSize: 2 }}>
        <Text sx={{ mt: 3, fontWeight: 'semiBold' }}>{t('protection.not-guaranteed')}</Text>
        <Text sx={{ mb: 3 }}>
          {t('protection.guarantee-factors')}{' '}
          <AppLink href="https://kb.oasis.app/help" sx={{ fontWeight: 'body' }}>
            {t('protection.learn-more-about-automation')}
          </AppLink>
        </Text>
        <Text>
          <strong>{t('fact')}: </strong>
          {/* TODO values mocked for now, we will need data source for those */}
          {t('protection.automation-fact', { success: 12, total: 12 })}
        </Text>
      </Box>
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
  tokenPrice: BigNumber
  vault: Vault
  ilkData: IlkData
  isEditing: boolean
  etherscan: string
  toggleForms: () => void
  selectedSLValue: BigNumber
  firstStopLossSetup: boolean
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
  tokenPrice,
  vault,
  ilkData,
  isEditing,
  gasEstimation,
  etherscan,
  toggleForms,
  selectedSLValue,
  firstStopLossSetup,
}: AdjustSlFormLayoutProps) {
  const { t } = useTranslation()

  return (
    <Grid columns={[1]}>
      <AutomationFormHeader
        txProgressing={txProgressing}
        txSuccess={txSuccess}
        translations={{
          editing: {
            header: t('protection.set-downside-protection'),
            description: t('protection.set-downside-protection-desc'),
          },
          progressing: {
            header: t('protection.setting-downside-protection'),
            description: t('protection.setting-downside-protection-desc'),
          },
          success: {
            header: t(
              firstStopLossSetup
                ? 'protection.downside-protection-complete'
                : 'protection.downside-protection-updated',
            ),
            description: t('protection.downside-protection-complete-desc'),
          },
        }}
      />
      {txProgressing && <OpenVaultAnimation />}
      {!txProgressing && !txSuccess && (
        <>
          <Box mt={3}>
            <SliderValuePicker {...slValuePickerConfig} />
          </Box>
          <Box>
            <PickCloseState {...closePickerConfig} />
          </Box>
          {isEditing && (
            <>
              <Box>
                <Divider variant="styles.hrVaultFormBottom" mb={3} />
              </Box>
              <Box>
                <SetDownsideProtectionInformation
                  token={token}
                  vault={vault}
                  ilkData={ilkData}
                  gasEstimation={gasEstimation}
                  afterStopLossRatio={selectedSLValue}
                  tokenPrice={tokenPrice}
                  isCollateralActive={closePickerConfig.isCollateralActive}
                />
              </Box>
            </>
          )}
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
            tokenPrice={tokenPrice}
            vault={vault}
            ilkData={ilkData}
            isCollateralActive={closePickerConfig.isCollateralActive}
          />
        </Box>
      )}
      <Box>
        <TxStatusSection txState={txState} etherscan={etherscan} />
      </Box>
      {accountIsController && !txProgressing && (
        <AutomationFormButtons
          triggerConfig={addTriggerConfig}
          toggleForms={toggleForms}
          toggleKey="protection.navigate-cancel"
          txSuccess={txState?.status === TxStatus.Success}
        />
      )}
    </Grid>
  )
}
