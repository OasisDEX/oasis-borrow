import BigNumber from 'bignumber.js'
import { ContentCardProps, DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Heading, Text } from 'theme-ui'

import { zero } from '../../../helpers/zero'

interface ContentCardNetAPYProps {
  netAPY?: BigNumber
  token: string
}

type ContentCardNetAPYModalProps = {
  token: string
}

function ContentCardNetAPYModal({ token }: ContentCardNetAPYModalProps) {
  const { t } = useTranslation()
  return (
    <Grid gap={2}>
      <Heading variant="header3">{t('manage-earn-vault.net-apy')}</Heading>
      <Text variant="paragraph2">{t('manage-earn-vault.net-apy-modal', { token })}</Text>
    </Grid>
  )
}

export function ContentCardNetAPY({ netAPY, token }: ContentCardNetAPYProps) {
  const { t } = useTranslation()

  const formatted = {
    netAPY: `${formatPercent((netAPY || zero).times(100), { precision: 1 })}`,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('manage-earn-vault.net-apy'),
    value: formatted.netAPY,
    modal: <ContentCardNetAPYModal token={token} />,
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
