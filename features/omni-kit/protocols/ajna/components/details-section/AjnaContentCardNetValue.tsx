import type { AjnaPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniContentCardCommonProps } from 'features/omni-kit/components/details-section/types'
import { AjnaContentCardNetValueModal } from 'features/omni-kit/protocols/ajna/components/details-section/AjnaContentCardNetValueModal'
import { formatFiatBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface AjnaContentCardNetValueProps extends OmniContentCardCommonProps {
  netValue: BigNumber
  afterNetValue?: BigNumber
  position: AjnaPosition
  collateralPrice: BigNumber
  collateralToken: string
  pnlNotAvailable?: boolean
  showPnl: boolean
}

export function AjnaContentCardNetValue({
  afterNetValue,
  changeVariant,
  isLoading,
  netValue,
  position,
  pnlNotAvailable = false,
  showPnl,
  modalTheme,
  collateralPrice,
  collateralToken,
}: AjnaContentCardNetValueProps) {
  const { t } = useTranslation()

  const formatted = {
    netValue: formatFiatBalance(netValue),
    afterNetValue: afterNetValue && `${formatFiatBalance(afterNetValue)} USD`,
    pnl: `${t('ajna.position-page.multiply.common.overview.pnl')}: ${
      pnlNotAvailable ? 'n/a' : `$${formatFiatBalance(position.pnl.withFees)}`
    }`,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.multiply.common.overview.net-value'),
    value: formatted.netValue,
    unit: 'USD',
    change: {
      isLoading,
      value: afterNetValue && `${formatted.afterNetValue} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
    modal: isLoading ? null : (
      <DetailsSectionContentSimpleModal
        theme={modalTheme}
        title={t('ajna.position-page.common.net-value-pnl-modal.headline')}
      >
        <AjnaContentCardNetValueModal
          {...{ netValue, position, collateralPrice, collateralToken }}
        />
      </DetailsSectionContentSimpleModal>
    ),
  }

  if (showPnl) {
    contentCardSettings.footnote = formatted.pnl
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
