import BigNumber from 'bignumber.js'
import {
  deployAjnaPool,
  getAjnaPoolInterestRateBoundaries,
} from 'blockchain/calls/ajnaErc20PoolFactory'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { amountToWad } from 'blockchain/utils'
import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { AjnaHeader } from 'features/ajna/common/components/AjnaHeader'
import { takeUntilTxState } from 'features/automation/api/automationTxHandlers'
import { PoolCreatorBoundries } from 'features/poolCreator/types'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { handleTransaction, TxDetails } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import React, { useEffect, useState } from 'react'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'
import { Button, Input } from 'theme-ui'

export function AjnaPoolCreatorController() {
  const { context$, txHelpers$ } = useAppContext()
  const [context] = useObservable(context$)
  const [txHelpersData] = useObservable(txHelpers$)

  const [boundries, setBoundries] = useState<PoolCreatorBoundries>()
  const [txDetails, setTxDetails] = useState<TxDetails>()
  const [collateralAddress, setCollateralAddress] = useState<string>(
    '0xeb089cfb6d839c0d6fa9dc55fc6826e69a4c22b1',
  )
  const [quoteAddress, setQuoteAddress] = useState<string>(
    '0x10aa0cf12aab305bd77ad8f76c037e048b12513b',
  )
  const [interestRate, setInterestRate] = useState<BigNumber>(new BigNumber(2.5))

  useEffect(() => {
    console.log(`collateralAddress: ${collateralAddress}`)
    console.log(`quoteAddress: ${quoteAddress}`)
    console.log(`interestRate: ${interestRate}`)
    console.log(amountToWad(interestRate.div(100)).toString())
  }, [collateralAddress, quoteAddress, interestRate])
  useEffect(() => {
    console.log(txDetails)
  }, [txDetails])

  useEffect(() => {
    console.log(`collateralAddress: ${collateralAddress}`)
    console.log(`quoteAddress: ${quoteAddress}`)
    console.log(`interestRate: ${interestRate}`)
    console.log(amountToWad(interestRate.div(100)).toString())
  }, [collateralAddress, quoteAddress, interestRate])

  useEffect(() => {
    if (context?.chainId)
      void getAjnaPoolInterestRateBoundaries(context.chainId).then((response) =>
        setBoundries(response),
      )
  }, [context?.chainId])

  return (
    <WithConnection>
      <AnimatedWrapper sx={{ mb: 5 }}>
        <AjnaHeader title="Ajna Pool Creator" intro="Lorem ipsum dolor sit amet" />
        <Input value={collateralAddress} onChange={(e) => setCollateralAddress(e.target.value)} />
        <Input value={quoteAddress} onChange={(e) => setQuoteAddress(e.target.value)} />
        <WithLoadingIndicator
          value={[context, txHelpersData, boundries]}
          customLoader={<>Loading</>}
        >
          {([, txHelpers, { min, max }]) => (
            <>
              <SliderValuePicker
                disabled={false}
                lastValue={interestRate}
                minBoundry={min}
                leftBoundry={min}
                leftBoundryFormatter={(value) => `${value.toString()}%`}
                maxBoundry={max}
                rightBoundry={max}
                rightBoundryFormatter={(value) => `${value.toString()}%`}
                onChange={(value) => setInterestRate(value)}
                step={0.1}
              />
              <Button
                onClick={() => {
                  txHelpers
                    .sendWithGasEstimation(deployAjnaPool, {
                      kind: TxMetaKind.deployAjnaPool,
                      collateralAddress,
                      quoteAddress,
                      interestRate: amountToWad(interestRate.div(100)).toString(),
                    })
                    .pipe(
                      takeWhileInclusive((txState) => !takeUntilTxState.includes(txState.status)),
                    )
                    .subscribe((txState) => {
                      handleTransaction({
                        txState,
                        ethPrice: zero,
                        setTxDetails,
                      })
                    })
                }}
              >
                Send
              </Button>
            </>
          )}
        </WithLoadingIndicator>
      </AnimatedWrapper>
    </WithConnection>
  )
}
