import { getToken } from 'blockchain/tokensMetadata'
import { getAjnaBorrowCollateralMax } from 'features/ajna/positions/borrow/helpers/getAjnaBorrowCollateralMax'
import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { AjnaFormContentSummary } from 'features/ajna/positions/common/sidebars/AjnaFormContentSummary'
import { AjnaFormFieldWithdraw } from 'features/ajna/positions/common/sidebars/AjnaFormFields'
import { AjnaMultiplyFormOrder } from 'features/ajna/positions/multiply/sidebars/AjnaMultiplyFormOrder'
import React from 'react'

export function AjnaMultiplyFormContentWithdrawCollateral() {
  // const { t } = useTranslation()
  const {
    environment: { collateralPrice, collateralToken },
  } = useProtocolGeneralContext()
  const {
    form: {
      dispatch,
      state: { withdrawAmount },
    },
    position: {
      currentPosition: { position, simulation },
    },
  } = useGenericProductContext('multiply')

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
