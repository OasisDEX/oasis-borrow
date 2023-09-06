import React from 'react'
import { getToken } from 'blockchain/tokensMetadata'
import { getAjnaBorrowCollateralMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowCollateralMax'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaFormFieldWithdraw } from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import { AjnaMultiplyFormOrder } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormOrder'

export function AjnaMultiplyFormContentWithdrawCollateral() {
  // const { t } = useTranslation()
  const {
    environment: { collateralPrice, collateralToken },
  } = useAjnaGeneralContext()
  const {
    form: {
      dispatch,
      state: { withdrawAmount },
    },
    position: {
      currentPosition: { position, simulation },
    },
  } = useAjnaProductContext('multiply')

  const collateralMax = getAjnaBorrowCollateralMax({
    digits: getToken(collateralToken).digits,
    position,
    simulation,
  })

  return (
    <>
      <AjnaFormFieldWithdraw
        dispatchAmount={dispatch}
        maxAmount={collateralMax}
        resetOnClear
        token={collateralToken}
        tokenPrice={collateralPrice}
      />
      {/* DISABLED: We're currently unable to support this operation
       * in the library based on existing operation if the LTV increases
       * added to product continuous improvements backlog
       * https://app.shortcut.com/oazo-apps/story/10552/multiply-withdrawal-ltv-increases-are-not-supported-in-operation
       */}
      {/*<PillAccordion title={t('adjust-your-position-additional')}>*/}
      {/*  <AjnaMultiplySlider disabled={!withdrawAmount} />*/}
      {/*</PillAccordion>*/}
      {withdrawAmount && (
        <AjnaFormContentSummary>
          <AjnaMultiplyFormOrder />
        </AjnaFormContentSummary>
      )}
    </>
  )
}
