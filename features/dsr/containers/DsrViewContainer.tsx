import { BigNumber } from 'bignumber.js'
import { useMainContext } from 'components/context/MainContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import { getYearlyRate } from 'features/dsr/helpers/dsrPot'
import { RAY } from 'features/dsr/utils/constants'
import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import React, { useMemo } from 'react'
import { Container } from 'theme-ui'

import { DsrView } from './DsrView'

export function DsrViewContainer({ walletAddress }: { walletAddress: string }) {
  const { context$ } = useMainContext()
  const { dsrDeposit$, dsr$, potTotalValueLocked$, potDsr$ } = useProductContext()
  const [potDsr] = useObservable(potDsr$)
  const [potTotalValueLocked] = useObservable(potTotalValueLocked$)
  const resolvedDsrDeposit$ = dsrDeposit$(walletAddress)
  const resolvedDsr$ = dsr$(walletAddress)
  const [depositState, depositStateError] = useObservable(resolvedDsrDeposit$)
  const [context, contextError] = useObservable(context$)
  const [pots, potsError] = useObservable(resolvedDsr$)
  const { tokenPriceUSD$ } = useProductContext()

  const _tokenPriceUSD$ = useMemo(() => tokenPriceUSD$(['DAI', 'SDAI']), [])

  const [tokenPricesData, tokenPricesError] = useObservable(_tokenPriceUSD$)

  const apy = potDsr
    ? getYearlyRate(potDsr || zero)
        .decimalPlaces(5, BigNumber.ROUND_UP)
        .minus(1)
    : new BigNumber(0.01)
  const dsr = potDsr || RAY

  return (
    <Container variant="vaultPageContainer">
      <WithErrorHandler error={[depositStateError, potsError, contextError, tokenPricesError]}>
        <WithLoadingIndicator
          value={[depositState, pots, context, tokenPricesData]}
          customLoader={<VaultContainerSpinner />}
        >
          {([_depositState, _pots, _context, tickers]) => (
            <DsrView
              dsrOverview={_pots.pots.dsr}
              dsrDepositState={_depositState}
              walletAddress={walletAddress}
              context={_context}
              potTotalValueLocked={potTotalValueLocked}
              apy={apy.times(100)}
              dsr={dsr}
              sdaiPrice={tickers['SDAI']}
              daiPrice={tickers['DAI']}
            />
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </Container>
  )
}
