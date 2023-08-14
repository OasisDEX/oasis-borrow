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
import { MessageCard } from 'components/MessageCard'
import { TokensGroup } from 'components/TokensGroup'
import { AjnaHeader } from 'features/ajna/common/components/AjnaHeader'
import { takeUntilTxState } from 'features/automation/api/automationTxHandlers'
import { DEFAULT_POOL_INTEREST_RATE } from 'features/poolCreator/consts'
import { usePoolCreatorData } from 'features/poolCreator/hooks/usePoolCreatorData'
import { PoolCreatorBoundries } from 'features/poolCreator/types'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { handleTransaction, TxDetails } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import { inRange } from 'lodash'
import React, { useEffect, useState } from 'react'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'
import { Button, Flex, Input, Spinner } from 'theme-ui'

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
  const [interestRate, setInterestRate] = useState<BigNumber>(
    new BigNumber(DEFAULT_POOL_INTEREST_RATE),
  )

  const { collateralToken, errors, isLoading, isReady, quoteToken } = usePoolCreatorData({
    collateralAddress,
    quoteAddress,
  })

  useEffect(() => {
    if (context?.chainId)
      void getAjnaPoolInterestRateBoundaries(context.chainId).then(({ min, max }) => {
        setBoundries({ min, max })
        if (!inRange(DEFAULT_POOL_INTEREST_RATE, min.toNumber(), max.toNumber()))
          setInterestRate(max.minus(min).div(3).decimalPlaces(1, BigNumber.ROUND_HALF_DOWN))
      })
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
                leftLabel="Pool's Interest rate"
                leftBoundry={interestRate}
                leftBoundryFormatter={(value) => `${value.toFixed(1)}%`}
                leftBottomLabel={`Minimum ${min}%`}
                rightBottomLabel={`Up to ${max}%`}
                maxBoundry={max}
                onChange={(value) => setInterestRate(value)}
                step={0.1}
              />
              <MessageCard messages={errors} type="error" withBullet={errors.length > 1} />
              {isReady && collateralToken && quoteToken && (
                <Flex>
                  You're about to create a
                  <TokensGroup tokens={[collateralToken, quoteToken]} />
                  <strong>
                    {collateralToken}/{quoteToken}
                  </strong>{' '}
                  pool
                </Flex>
              )}
              <Button
                disabled={!isReady}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '240px',
                }}
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
                {isLoading && <Spinner size={24} color="neutral10" sx={{ mr: 2, mb: '2px' }} />}
                Create
              </Button>
            </>
          )}
        </WithLoadingIndicator>
      </AnimatedWrapper>
    </WithConnection>
  )
}
