import { TxStatus } from '@oasisdex/transactions'
import { Box, Grid } from '@theme-ui/components'
import BigNumber from 'bignumber.js'
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
import { VaultChangesWithADelayCard } from '../../../components/vault/VaultChangesWithADelayCard'
import { formatAmount, formatFiatBalance, formatPercent } from '../../../helpers/formatters/format'
import { staticFilesRuntimeUrl } from '../../../helpers/staticPaths'
import { one } from '../../../helpers/zero'
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
  txState?: TxStatus
  txCost: BigNumber
}

function ProtectionCompleteInformation({
  stopLossLevel,
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
        value={<Flex>${formatAmount(txCost, 'USD')}</Flex>}
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
  ethPrice: BigNumber
  isCollateralActive: boolean
}

function SetDownsideProtectionInformation({
  vault,
  ilkData,
  token,
  gasEstimation,
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
      <VaultChangesInformationItem label={`${t('protection.max-cost')}`} value={gasEstimation} />
      <Box sx={{ fontSize: 2 }}>
        <Text sx={{ mt: 3, fontWeight: 'semiBold' }}>{t('protection.not-guaranteed')}</Text>
        <Text sx={{ mb: 3 }}>
          {t('protection.guarantee-factors')}{' '}
          <AppLink href="https://kb.oasis.app/help" sx={{ fontWeight: 'body' }}>
            {t('protection.learn-more-about-automation')}
          </AppLink>
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
  txState?: TxStatus
  txHash?: string
  txCost?: BigNumber
  stopLossLevel: BigNumber
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
}

export function AdjustSlFormLayout({
  token,
  txProgressing,
  txState,
  txHash,
  txCost,
  slValuePickerConfig,
  closePickerConfig,
  accountIsController,
  addTriggerConfig,
  stopLossLevel,
  tokenPrice,
  ethPrice,
  vault,
  ilkData,
  gasEstimation,
  etherscan,
  toggleForms,
  selectedSLValue,
  firstStopLossSetup,
  isEditing,
}: AdjustSlFormLayoutProps) {
  const { t } = useTranslation()

  return (
    <Grid columns={[1]}>
      <AutomationFormHeader
        txProgressing={txProgressing}
        txSuccess={txState === TxStatus.Success}
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
      {!txProgressing && txState !== TxStatus.Success && (
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
                  ethPrice={ethPrice}
                  isCollateralActive={closePickerConfig.isCollateralActive}
                />
              </Box>
            </>
          )}
        </>
      )}

      {txState === TxStatus.Success && (
        <>
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
              txCost={txCost!}
            />
          </Box>
          <Box>
            <VaultChangesWithADelayCard />
          </Box>
        </>
      )}
      <Box>
        <TxStatusSection txStatus={txState} txHash={txHash} etherscan={etherscan} />
      </Box>
      {accountIsController && !txProgressing && (
        <AutomationFormButtons
          triggerConfig={addTriggerConfig}
          toggleForms={toggleForms}
          toggleKey="protection.navigate-cancel"
          txSuccess={txState === TxStatus.Success}
        />
      )}
    </Grid>
  )
}
