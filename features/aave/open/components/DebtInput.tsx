import React from 'react'
import { Grid } from 'theme-ui'

import { SecondaryInputProps } from '../../common/StrategyConfigTypes'

export function DebtInput(_props: SecondaryInputProps) {
  return (
    <Grid gap={3}>
      debt stuff
      {/*<VaultActionInput*/}
      {/*  action={'Generate'}*/}
      {/*  amount={props.state.context.userInput?.amount}*/}
      {/*  hasAuxiliary={true}*/}
      {/*  auxiliaryAmount={state.context.auxiliaryAmount}*/}
      {/*  hasError={false}*/}
      {/*  maxAmount={state.context.tokenBalance}*/}
      {/*  showMax={true}*/}
      {/*  maxAmountLabel={t('balance')}*/}
      {/*  onSetMax={() => {*/}
      {/*    send({ type: 'SET_AMOUNT', amount: state.context.tokenBalance! })*/}
      {/*  }}*/}
      {/*  onChange={handleNumericInput((amount) => {*/}
      {/*    send({ type: 'SET_AMOUNT', amount })*/}
      {/*  })}*/}
      {/*  currencyCode={state.context.tokens.deposit}*/}
      {/*  disabled={false}*/}
      {/*  tokenUsdPrice={state.context.collateralPrice}*/}
      {/*/>*/}
    </Grid>
  )
}
