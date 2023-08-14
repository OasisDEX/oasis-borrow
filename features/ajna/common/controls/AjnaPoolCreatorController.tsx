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
import { DetailsSection } from 'components/DetailsSection'
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
import { TextInput } from 'helpers/TextInput'
import { zero } from 'helpers/zero'
import { inRange } from 'lodash'
import React, { useEffect, useState } from 'react'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'
import { Box, Button, Flex, Grid, Spinner, Text } from 'theme-ui'

export function AjnaPoolCreatorController() {
  const { context$, txHelpers$ } = useAppContext()
  const [context] = useObservable(context$)
  const [txHelpersData] = useObservable(txHelpers$)

  const [boundries, setBoundries] = useState<PoolCreatorBoundries>()
  const [, setTxDetails] = useState<TxDetails>()
  const [collateralAddress, setCollateralAddress] = useState<string>(
    '0xeb089cfb6d839c0d6fa9dc55fc6826e69a4c22b1',
  )
  const [quoteAddress, setQuoteAddress] = useState<string>(
    '0x10aa0cf12aab305bd77ad8f76c037e048b12513b',
  )
  const [interestRate, setInterestRate] = useState<BigNumber>(
    new BigNumber(DEFAULT_POOL_INTEREST_RATE),
  )

  const { collateralToken, errors, isError, isLoading, isReady, quoteToken } = usePoolCreatorData({
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
        <AjnaHeader
          title="Ajna Pool Creator"
          intro="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maybe some explanation what is going on here? Link to knowledge base?"
        />
        <Box sx={{ maxWidth: '804px', mx: 'auto' }}>
          <WithLoadingIndicator
            value={[context, txHelpersData, boundries]}
            customLoader={<>Loading</>}
          >
            {([, txHelpers, { min, max }]) => (
              <DetailsSection
                title="Configure new Ajna pool"
                content={
                  <Grid gap={3}>
                    <TextInput
                      label="Collateral token address"
                      placeholder="0×232b…x8482"
                      value={collateralAddress}
                      onChange={(value) => setCollateralAddress(value)}
                    />
                    <TextInput
                      label="Quote token address"
                      placeholder="0×232b…x8482"
                      value={quoteAddress}
                      onChange={(value) => setQuoteAddress(value)}
                    />
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
                    {isError && (
                      <Box sx={{ mt: 2 }}>
                        <MessageCard
                          messages={errors}
                          type="error"
                          withBullet={errors.length > 1}
                        />
                      </Box>
                    )}
                    {isReady && collateralToken && quoteToken && (
                      <Flex
                        sx={{
                          p: 3,
                          backgroundColor: 'neutral30',
                          borderRadius: 'medium',
                        }}
                      >
                        <Text
                          variant="paragraph3"
                          sx={{ display: 'flex', alignItems: 'center', fontWeight: 'semiBold' }}
                        >
                          You're about to create a
                          <Flex sx={{ alignItems: 'center', mx: 1 }}>
                            <TokensGroup tokens={[collateralToken, quoteToken]} sx={{ mr: 1 }} />
                            <Text as="strong">
                              {collateralToken}/{quoteToken}
                            </Text>
                          </Flex>
                          pool
                        </Text>
                      </Flex>
                    )}
                  </Grid>
                }
                footer={
                  <Flex sx={{ justifyContent: 'flex-end' }}>
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
                            takeWhileInclusive(
                              (txState) => !takeUntilTxState.includes(txState.status),
                            ),
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
                      {isLoading && (
                        <Spinner size={24} color="neutral10" sx={{ mr: 2, mb: '2px' }} />
                      )}
                      Create
                    </Button>
                  </Flex>
                }
              />
            )}
          </WithLoadingIndicator>
        </Box>
      </AnimatedWrapper>
    </WithConnection>
  )
}
