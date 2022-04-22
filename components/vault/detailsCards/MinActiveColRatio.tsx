import BigNumber from 'bignumber.js'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Heading, Text } from 'theme-ui'

import { formatAmount, formatDecimalAsPercent } from '../../../helpers/formatters/format'
import { ModalProps, useModal } from '../../../helpers/modalHook'
import { AfterPillProps, VaultDetailsCard, VaultDetailsCardModal } from '../VaultDetails'

function MinActiveColRatioModal({ close }: ModalProps<{}>) {
  const { t } = useTranslation()
  return (
    <VaultDetailsCardModal close={close}>
      <Grid gap={2}>
        <Heading variant="header3">Minimum active collateralization ratio</Heading>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {t('manage-insti-vault.card.min-active-coll-ratio.modal.para1')}
        </Text>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
          {t('manage-insti-vault.card.min-active-coll-ratio.modal.para2')}
        </Text>
        <Text variant="subheader" sx={{ fontSize: 2, pb: 2 }}>
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
  const {
    afterPill,
    activeCollRatioPriceUSD,
    afterActiveCollRatioPriceUSD,
    activeCollRatio,
  } = props
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
