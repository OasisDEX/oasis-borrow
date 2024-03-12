import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { AutomationFeatures } from 'features/automation/common/types'
import type { OmniCardLtvAutomationData } from 'features/omni-kit/components/details-section'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Heading, Text } from 'theme-ui'

interface OmniCardDataLtvModalProps {
  ltv: BigNumber
  maxLtv?: BigNumber
  automation?: OmniCardLtvAutomationData
  customCopies?: {
    title: string
    description: string
  }
}

export function OmniCardDataLtvModal({
  ltv,
  maxLtv,
  automation,
  customCopies,
}: OmniCardDataLtvModalProps) {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentSimpleModal
      title={t('omni-kit.content-card.ltv.title')}
      description={t('omni-kit.content-card.ltv.modal-description')}
      value={formatDecimalAsPercent(ltv)}
    >
      <>
        {maxLtv && (
          <>
            <Heading variant="header5" sx={{ fontWeight: 'semiBold' }}>
              {t(customCopies?.title || 'omni-kit.content-card.ltv.modal-max-ltv-title')}
            </Heading>
            <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
              {t(
                customCopies?.description || 'omni-kit.content-card.ltv.modal-max-ltv-description',
              )}
            </Text>
            <Card variant="vaultDetailsCardModal">{formatDecimalAsPercent(maxLtv)}</Card>
          </>
        )}
        {automation && automation.stopLossLikeTriggerLevel && (
          <>
            <Heading variant="header5" sx={{ fontWeight: 'semiBold' }}>
              {t(
                `omni-kit.content-card.ltv.${
                  {
                    [AutomationFeatures.STOP_LOSS]: 'modal-sl-title',
                    [AutomationFeatures.TRAILING_STOP_LOSS]: 'modal-trailing-sl-title',
                  }[automation.stopLossType]
                }`,
              )}
            </Heading>
            <Text variant="paragraph3" as="p" sx={{ color: 'neutral80' }}>
              {t(
                `omni-kit.content-card.ltv.${
                  {
                    [AutomationFeatures.STOP_LOSS]: 'modal-sl-description',
                    [AutomationFeatures.TRAILING_STOP_LOSS]: 'modal-trailing-sl-description',
                  }[automation.stopLossType]
                }`,
              )}
            </Text>
            <Card variant="vaultDetailsCardModal">
              {formatDecimalAsPercent(automation.stopLossLikeTriggerLevel)}
            </Card>
          </>
        )}
      </>
    </DetailsSectionContentSimpleModal>
  )
}
