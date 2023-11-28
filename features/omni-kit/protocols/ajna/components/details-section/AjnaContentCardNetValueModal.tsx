import type { AjnaPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { OmniContentCardCommonProps } from 'features/omni-kit/components/details-section/types'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

interface AjnaContentCardNetValueProps extends OmniContentCardCommonProps {
  netValue: BigNumber
  pnl: AjnaPosition['pnl']
  collateralPrice: BigNumber
}

export function AjnaContentCardNetValueModal({
  netValue,
  pnl,
  collateralPrice,
}: AjnaContentCardNetValueProps) {
  const { t } = useTranslation()
  return (
    <Grid gap={2}>
      <Text variant="paragraph3">
        {`${t('ajna.position-page.common.headline.net-value-pnl-based-on-price')}`}
        &nbsp;
        <Text as="span" variant="boldParagraph2">{`$${formatAmount(collateralPrice, 'USD')}`}</Text>
      </Text>
      Collateral price: {collateralPrice.toString()}
      Net value: {netValue.toString()}
      <pre>{JSON.stringify(pnl, null, 2)}</pre>
    </Grid>
  )
}
