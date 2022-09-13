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
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Grid, Text } from 'theme-ui'

interface CancelDownsideProtectionInformationProps {
  liquidationPrice: BigNumber
  stopLossLevel: BigNumber
}

export function CancelDownsideProtectionInformation({
  liquidationPrice,
  stopLossLevel,
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
            {formatPercent(stopLossLevel)}
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
  stopLossLevel: BigNumber
}

export function SidebarCancelStopLossEditingStage({
  vault,
  ilkData,
  errors,
  warnings,
  stopLossLevel,
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
        stopLossLevel={stopLossLevel.times(100)}
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
