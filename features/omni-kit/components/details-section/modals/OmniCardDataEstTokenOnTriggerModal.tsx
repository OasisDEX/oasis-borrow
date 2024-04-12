import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

interface OmniCardDataEstTokenOnTriggerModalProps {
  token: string
  liquidationPenalty: BigNumber
}

export const OmniCardDataEstTokenOnTriggerModal: FC<OmniCardDataEstTokenOnTriggerModalProps> = ({
  token,
  liquidationPenalty,
}) => {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentSimpleModal
      title={t('omni-kit.content-card.estimated-token-on-trigger.title', { token })}
      description={t('omni-kit.content-card.estimated-token-on-trigger.modal-description', {
        token,
        liquidationPenalty: formatDecimalAsPercent(liquidationPenalty),
      })}
    />
  )
}
