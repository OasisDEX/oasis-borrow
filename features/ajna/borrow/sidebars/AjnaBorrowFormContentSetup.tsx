import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { AjnaBorrowFormOrder } from 'features/ajna/borrow/sidebars/AjnaBorrowFormOrder'
import { useAjnaBorrowContext } from 'features/ajna/contexts/AjnaProductContext'
import { handleNumericInput } from 'helpers/input'
import { useTranslation } from 'next-i18next'
import { useEffect, useRef } from 'react'
import React from 'react'
import { Grid } from 'theme-ui'

export function AjnaBorrowFormContentSetup() {
  const { t } = useTranslation()
  const {
    form: {
      dispatch,
      state: { depositAmount, depositAmountUSD, generateAmount, generateAmountUSD },
      updateState,
    },
    environment: { collateralBalance, collateralPrice, collateralToken, quotePrice, quoteToken },
  } = useAjnaBorrowContext()
  const didMountRef = useRef(false)

  useEffect(() => {
    updateState('action', 'open')
  }, [])

  useEffect(() => {
    if (didMountRef.current) {
      if (!depositAmount) dispatch({ type: 'reset' })
    } else didMountRef.current = true
  }, [depositAmount])

  return (
    <Grid gap={3}>
      <VaultActionInput
        action="Deposit"
        currencyCode={collateralToken}
        tokenUsdPrice={collateralPrice}
        amount={depositAmount}
        auxiliaryAmount={depositAmountUSD}
        hasAuxiliary={true}
        hasError={false}
        disabled={false}
        showMax={true}
        maxAmount={collateralBalance}
        maxAuxiliaryAmount={collateralBalance.times(collateralPrice)}
        maxAmountLabel={t('balance')}
        onChange={handleNumericInput((n) => {
          dispatch({
            type: 'update-deposit',
            depositAmount: n,
            depositAmountUSD: n ? n.times(collateralPrice) : undefined,
          })
          if (!n) dispatch({ type: 'reset' })
        })}
        onAuxiliaryChange={handleNumericInput((n) => {
          dispatch({
            type: 'update-deposit',
            depositAmount: n ? n.dividedBy(collateralPrice) : undefined,
            depositAmountUSD: n,
          })
        })}
        onSetMax={() => {
          dispatch({
            type: 'update-deposit',
            depositAmount: collateralBalance,
            depositAmountUSD: collateralBalance.times(collateralPrice),
          })
        }}
      />
      <VaultActionInput
        action="Generate"
        currencyCode={quoteToken}
        tokenUsdPrice={quotePrice}
        amount={generateAmount}
        auxiliaryAmount={generateAmountUSD}
        hasAuxiliary={true}
        hasError={false}
        disabled={!depositAmount}
        onChange={handleNumericInput((n) => {
          dispatch({
            type: 'update-generate',
            generateAmount: n,
            generateAmountUSD: n ? n.times(quotePrice) : undefined,
          })
        })}
        onAuxiliaryChange={handleNumericInput((n) => {
          dispatch({
            type: 'update-generate',
            generateAmount: n ? n.dividedBy(quotePrice) : undefined,
            generateAmountUSD: n,
          })
        })}
      />
      {depositAmount?.gt(0) && (
        <>
          <SidebarResetButton clear={() => dispatch({ type: 'reset' })} />
          <AjnaBorrowFormOrder />
        </>
      )}
    </Grid>
  )
}
