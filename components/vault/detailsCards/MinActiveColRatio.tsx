import type BigNumber from 'bignumber.js'
import type { AfterPillProps } from 'components/vault/VaultDetails'
import { VaultDetailsCard, VaultDetailsCardModal } from 'components/vault/VaultDetails'
import { formatAmount, formatDecimalAsPercent } from 'helpers/formatters/format'
import type { ModalProps } from 'helpers/modalHook'
import { useModal } from 'helpers/modalHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Heading, Text } from 'theme-ui'

function MinActiveColRatioModal({ close }: ModalProps<{}>) {
  const { t } = useTranslation()
  return (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">Minimum active collateralization ratio</Heading>
        <Text variant="paragraph3" sx={{ pb: 2 }}>
          {t('manage-insti-vault.card.min-active-coll-ratio.modal.para1')}
        </Text>
        <Text variant="paragraph3" sx={{ pb: 2 }}>
          {t('manage-insti-vault.card.min-active-coll-ratio.modal.para2')}
        </Text>
        <Text variant="paragraph3" sx={{ pb: 2 }}>
          {t('manage-insti-vault.card.min-active-coll-ratio.modal.para3')}
        </Text>
      </Grid>
    </VaultDetailsCardModal>
  )
}

type MinActiveColRatioProps = {
  activeCollRatioPriceUSD: BigNumber
  afterActiveCollRatioPriceUSD?: BigNumber
  activeCollRatio: BigNumber
  afterPill: AfterPillProps
}

export function MinActiveColRatioCard(props: MinActiveColRatioProps) {
  const { t } = useTranslation()
  const openModal = useModal()
  const { afterPill, activeCollRatioPriceUSD, afterActiveCollRatioPriceUSD, activeCollRatio } =
    props
  return (
    <VaultDetailsCard
      title={t('manage-insti-vault.card.min-active-coll-ratio.price')}
      value={`$${formatAmount(activeCollRatioPriceUSD, 'USD')}`}
      valueAfter={
        afterPill.showAfterPill &&
        afterActiveCollRatioPriceUSD &&
        `$${formatAmount(afterActiveCollRatioPriceUSD, 'USD')}`
      }
      valueBottom={t('manage-insti-vault.card.min-active-coll-ratio.ratio', {
        percentageRatio: formatDecimalAsPercent(activeCollRatio),
      })}
      {...afterPill}
      openModal={() => openModal(MinActiveColRatioModal, {})}
    />
  )
}
