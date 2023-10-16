import { HighlightedOrderInformation } from 'components/HighlightedOrderInformation'
import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { getOriginationFee } from 'features/ajna/positions/common/helpers/getOriginationFee'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const AjnaBorrowOriginationFee = () => {
  const { t } = useTranslation()
  const {
    environment: { isOracless, quoteToken, quotePrice },
  } = useProtocolGeneralContext()
  const {
    position: {
      currentPosition: { position, simulation },
    },
  } = useGenericProductContext('borrow')
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
