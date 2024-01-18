import type BigNumber from 'bignumber.js'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'
import { Card } from 'theme-ui'

interface AjnaCardDataTotalAjnaRewardsModalProps {
  bonus: BigNumber
  claimable: BigNumber
  isLoading: boolean
  total: BigNumber
}

export function AjnaCardDataTotalAjnaRewardsModal({
  bonus,
  claimable,
  total,
}: AjnaCardDataTotalAjnaRewardsModalProps) {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentSimpleModal
      title={t('ajna.content-card.total-ajna-rewards.title')}
      description={t('ajna.content-card.total-ajna-rewards.modal-description')}
      theme={ajnaExtensionTheme}
    >
      <Card variant="vaultDetailsCardModal">
        {formatCryptoBalance(claimable)} {t('ajna.content-card.total-ajna-rewards.modal-value-1')}
      </Card>
      <Card variant="vaultDetailsCardModal">
        {formatCryptoBalance(total)} {t('ajna.content-card.total-ajna-rewards.modal-value-2')}
      </Card>
      <Card variant="vaultDetailsCardModal">
        {formatCryptoBalance(bonus)} {t('ajna.content-card.total-ajna-rewards.modal-value-3')}
      </Card>
    </DetailsSectionContentSimpleModal>
  )
}
