import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { GasEstimation } from 'components/GasEstimation'
import { MessageCard } from 'components/MessageCard'
import {
  VaultChangesInformationArrow,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { StopLossFormChange } from 'features/automation/protection/common/UITypes/StopLossFormChange'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Grid, Text } from 'theme-ui'

interface CancelDownsideProtectionInformationProps {
  liquidationPrice: BigNumber

  selectedSLValue: BigNumber
}

export function CancelDownsideProtectionInformation({
  liquidationPrice,

  selectedSLValue,
}: CancelDownsideProtectionInformationProps) {
  const { t } = useTranslation()

  return (
    <VaultChangesInformationContainer title={t('cancel-stoploss.summary-header')}>
      {!liquidationPrice.isZero() && (
        <VaultChangesInformationItem
          label={`${t('cancel-stoploss.liquidation')}`}
          value={<Flex>${formatAmount(liquidationPrice, 'USD')}</Flex>}
        />
      )}
      <VaultChangesInformationItem
        label={`${t('cancel-stoploss.stop-loss-coll-ratio')}`}
        value={
          <Flex>
            {formatPercent(selectedSLValue)}
            <VaultChangesInformationArrow />
            n/a
          </Flex>
        }
      />
      <VaultChangesInformationItem
        label={`${t('protection.max-cost')}`}
        value={<GasEstimation />}
      />
    </VaultChangesInformationContainer>
  )
}

interface SidebarCancelStopLossEditingStageProps {
  vault: Vault
  ilkData: IlkData
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
  stopLossState: StopLossFormChange
}

export function SidebarCancelStopLossEditingStage({
  vault,
  ilkData,
  errors,
  warnings,
  stopLossState,
}: SidebarCancelStopLossEditingStageProps) {
  const { t } = useTranslation()

  return (
    <Grid>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('protection.cancel-downside-protection-desc')}
      </Text>
      <VaultErrors errorMessages={errors} ilkData={ilkData} />
      <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
      <CancelDownsideProtectionInformation
        liquidationPrice={vault.liquidationPrice}
        selectedSLValue={stopLossState.selectedSLValue}
      />
      <MessageCard
        messages={[
          <>
            <strong>{t(`notice`)}</strong>: {t('protection.cancel-notice')}
          </>,
        ]}
        type="warning"
        withBullet={false}
      />
    </Grid>
  )
}
