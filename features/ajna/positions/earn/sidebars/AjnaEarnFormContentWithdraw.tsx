import { calculateAjnaMaxLiquidityWithdraw, getPoolLiquidity } from '@oasisdex/dma-library'
import { PillAccordion } from 'components/PillAccordion'
import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaFormFieldWithdraw } from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import { AjnaEarnSlider } from 'features/ajna/positions/earn/components/AjnaEarnSlider'
import { getAjnaEarnWithdrawMax } from 'features/ajna/positions/earn/helpers/getAjnaEarnWithdrawMax'
import { AjnaEarnFormOrder } from 'features/ajna/positions/earn/sidebars/AjnaEarnFormOrder'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaEarnFormContentWithdraw() {
  const { t } = useTranslation()
  const {
    environment: { quotePrice, quoteToken, isOracless, quoteDigits, quotePrecision },
  } = useProtocolGeneralContext()
  const {
    form: {
      dispatch,
      state: { withdrawAmount },
    },
    validation: { isFormValid },
    position: {
      currentPosition: { position, simulation },
    },
  } = useGenericProductContext('earn')

  const withdrawMax = getAjnaEarnWithdrawMax({
    quoteTokenAmount: calculateAjnaMaxLiquidityWithdraw({
      pool: position.pool,
      poolCurrentLiquidity: getPoolLiquidity(position.pool),
      position,
      simulation,
    }),
    digits: quotePrecision,
  })

  return (
    <>
      <AjnaFormFieldWithdraw
        dispatchAmount={dispatch}
        resetOnClear
        token={quoteToken}
        tokenPrice={quotePrice}
        maxAmount={withdrawMax}
        tokenDigits={quoteDigits}
      />
      <PillAccordion title={t('ajna.position-page.earn.common.form.adjust-lending-price-bucket')}>
        <AjnaEarnSlider
          isDisabled={!withdrawAmount}
          nestedManualInput={!(isOracless && position.pool.lowestUtilizedPriceIndex.isZero())}
        />
      </PillAccordion>
      {isFormValid && (
        <AjnaFormContentSummary>
          <AjnaEarnFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
