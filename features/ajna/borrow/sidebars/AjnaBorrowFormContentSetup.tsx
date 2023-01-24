import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { AjnaBorrowFormOrder } from 'features/ajna/borrow/sidebars/AjnaBorrowFormOrder'
import { useAjnaProductContext } from 'features/ajna/contexts/AjnaProductContext'
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
    },
    environment: { collateralBalance, collateralPrice, collateralToken, quotePrice, quoteToken },
  } = useAjnaProductContext()
  const didMountRef = useRef(false)

  const isEditing = depositAmount?.gt(0)

  useEffect(() => {
    if (didMountRef.current) {
      if (!depositAmount) {
        dispatch({
          type: 'update-generate',
          generateAmount: undefined,
          generateAmountUSD: undefined,
        })
      }
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
      {isEditing && (
        <>
          <SidebarResetButton
            clear={() => {
              dispatch({
                type: 'update-deposit',
                depositAmount: undefined,
                depositAmountUSD: undefined,
              })
            }}
          />
          <AjnaBorrowFormOrder />
        </>
      )}
    </Grid>
  )
}
