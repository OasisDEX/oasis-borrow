import type BigNumber from 'bignumber.js'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { GasEstimation } from 'components/GasEstimation'
import { MessageCard } from 'components/MessageCard'
import {
  VaultChangesInformationArrow,
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import { sidebarAutomationFeatureCopyMap } from 'features/automation/common/consts'
import { AutomationValidationMessages } from 'features/automation/common/sidebars/AutomationValidationMessages'
import { AutomationFeatures } from 'features/automation/common/types'
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
  errors: string[]
  warnings: string[]
  stopLossLevel: BigNumber
}

export function SidebarCancelStopLossEditingStage({
  errors,
  warnings,
  stopLossLevel,
}: SidebarCancelStopLossEditingStageProps) {
  const { t } = useTranslation()
  const {
    positionData: { liquidationPrice },
    metadata: {
      stopLossMetadata: {
        translations: { ratioParamTranslationKey },
      },
    },
  } = useAutomationContext()

  return (
    <Grid>
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('automation.cancel-summary-description', {
          feature: t(sidebarAutomationFeatureCopyMap[AutomationFeatures.STOP_LOSS]),
        })}
      </Text>
      <AutomationValidationMessages messages={errors} type="error" />
      <AutomationValidationMessages messages={warnings} type="warning" />
      <CancelDownsideProtectionInformation
        liquidationPrice={liquidationPrice}
        stopLossLevel={stopLossLevel.times(100)}
      />
      <MessageCard
        messages={[
          <>
            <strong>{t(`notice`)}</strong>:{' '}
            {t('protection.cancel-notice', { ratioParam: t(ratioParamTranslationKey) })}
          </>,
        ]}
        type="warning"
        withBullet={false}
      />
    </Grid>
  )
}
