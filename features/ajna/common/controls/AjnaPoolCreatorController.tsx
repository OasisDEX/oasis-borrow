import { deployAjnaPool } from 'blockchain/calls/ajnaErc20PoolFactory'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { amountToWad } from 'blockchain/utils'
import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet'
import { DetailsSection } from 'components/DetailsSection'
import { MessageCard } from 'components/MessageCard'
import { TokensGroup } from 'components/TokensGroup'
import { AjnaHeader } from 'features/ajna/common/components/AjnaHeader'
import { takeUntilTxState } from 'features/automation/api/automationTxHandlers'
import { DEFAULT_POOL_INTEREST_RATE } from 'features/poolCreator/consts'
import { PoolCreatorFormController } from 'features/poolCreator/controls/PoolCreatorFormController'
import { usePoolCreatorData } from 'features/poolCreator/hooks/usePoolCreatorData'
import { usePoolCreatorFormReducto } from 'features/poolCreator/state/poolCreatorFormReducto'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { handleTransaction, TxDetails } from 'helpers/handleTransaction'
import { useObservable } from 'helpers/observableHook'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'
import { Box, Button, Flex, Grid, Spinner, Text } from 'theme-ui'

export function AjnaPoolCreatorController() {
  const { t } = useTranslation()

  const { context$, txHelpers$ } = useAppContext()
  const [context] = useObservable(context$)
  const [txHelpersData] = useObservable(txHelpers$)

  const [, setTxDetails] = useState<TxDetails>()

  const form = usePoolCreatorFormReducto({
    collateralAddress: '0xeb089cfb6d839c0d6fa9dc55fc6826e69a4c22b1',
    interestRate: DEFAULT_POOL_INTEREST_RATE,
    quoteAddress: '0x10aa0cf12aab305bd77ad8f76c037e048b12513b',
  })
  const {
    state: { collateralAddress, interestRate, quoteAddress },
  } = form

  const { boundries, collateralToken, errors, isError, isLoading, isReady, quoteToken } =
    usePoolCreatorData({
      chainId: context?.chainId,
      collateralAddress,
      quoteAddress,
    })

  return (
    <WithConnection>
      <AnimatedWrapper sx={{ mb: 5 }}>
        <AjnaHeader title={t('pool-creator.header.title')} intro={t('pool-creator.header.intro')} />
        <Box sx={{ maxWidth: '584px', mx: 'auto' }}>
          <WithLoadingIndicator
            value={[context, txHelpersData, boundries]}
            customLoader={<>Loading</>}
          >
            {([, txHelpers, { min, max }]) => (
              <DetailsSection
                title={t('pool-creator.form.title')}
                loose
                content={
                  <Grid gap={4}>
                    <PoolCreatorFormController
                      form={form}
                      minInterestRate={min}
                      maxInterestRate={max}
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
