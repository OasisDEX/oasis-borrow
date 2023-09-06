import React from 'react'
import { HighlightedOrderInformation } from 'components/HighlightedOrderInformation'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { getOriginationFee } from 'features/ajna/positions/common/helpers/getOriginationFee'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'

export const AjnaBorrowOriginationFee = () => {
  const { t } = useTranslation()
  const {
    environment: { isOracless, quoteToken, quotePrice },
  } = useAjnaGeneralContext()
  const {
    position: {
      currentPosition: { position, simulation },
    },
  } = useAjnaProductContext('borrow')
  const originationFee = getOriginationFee(position, simulation)
  const originationFeeFormatted = `${formatCryptoBalance(originationFee)} ${quoteToken}`
  const originationFeeFormattedUSD = `($${formatAmount(originationFee.times(quotePrice), 'USD')})`

  return (
    <HighlightedOrderInformation
      label={t('ajna.position-page.borrow.common.form.origination-fee', { quoteToken })}
      symbol={quoteToken}
      value={`${originationFeeFormatted} ${!isOracless ? originationFeeFormattedUSD : ''}`}
    />
  )
}
