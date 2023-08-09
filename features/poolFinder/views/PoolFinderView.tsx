import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { TokensGroup } from 'components/TokensGroup'
import { AjnaHeader } from 'features/ajna/common/components/AjnaHeader'
import { searchAjnaPool } from 'features/ajna/positions/common/helpers/searchAjnaPool'
import { getOraclessProductUrl, validateOraclessPayload } from 'features/poolFinder/helpers'
import { OraclessPoolResult } from 'features/poolFinder/types'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { useObservable } from 'helpers/observableHook'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import { uniq } from 'lodash'
import React, { FC, useState } from 'react'
import { Box, Button, Flex, Input, Spinner, SxStyleProp, Text } from 'theme-ui'

const inputStyles: SxStyleProp = {
  height: '50px',
  maxWidth: '460px',
  p: 3,
  fontSize: 2,
  border: '1px solid',
  borderColor: 'neutral20',
  borderRadius: 'medium',
}

export const PoolFinderView: FC = () => {
  const { context$, identifiedTokens$ } = useAppContext()

  const [context] = useObservable(context$)
  const [results, setResults] = useState<{ [key: string]: OraclessPoolResult[] }>({})
  const [poolAddress, setPoolAddress] = useState<string>('')
  const [collateralAddress, setCollateralAddress] = useState<string>('')
  const [quoteAddress, setQuoteAddress] = useState<string>('')
  const [errors, setErrors] = useState<string[]>([])

  useDebouncedEffect(
    async () => {
      const validation = validateOraclessPayload({
        collateralAddress,
        poolAddress,
        quoteAddress,
      })

      setErrors(validation)
      if (
        !results[`${poolAddress}-${collateralAddress}-${quoteAddress}`] &&
        validation.length === 0
      ) {
        const { pools, size } = await searchAjnaPool({
          collateralAddress,
          poolAddress,
          quoteAddress,
        })
        if (size > 0) {
          const identifiedTokensSubscription = identifiedTokens$(
            uniq(
              pools.flatMap(({ collateralAddress, quoteTokenAddress }) => [
                collateralAddress,
                quoteTokenAddress,
              ]),
            ),
          ).subscribe(
            (identifiedTokens) => {
              setResults({
                ...results,
                [`${poolAddress}-${collateralAddress}-${quoteAddress}`]: pools
                  .filter(
                    (pool) =>
                      Object.keys(identifiedTokens).includes(pool.collateralAddress) &&
                      Object.keys(identifiedTokens).includes(pool.quoteTokenAddress),
                  )
                  .map((pool) => ({
                    collateralAddress: pool.collateralAddress,
                    collateralToken: identifiedTokens[pool.collateralAddress].symbol,
                    quoteAddress: pool.quoteTokenAddress,
                    quoteToken: identifiedTokens[pool.quoteTokenAddress].symbol,
                  })),
              })
              try {
                identifiedTokensSubscription.unsubscribe()
              } catch (e) {}
            },
            undefined,
            () => {
              console.log('complete?')
            },
          )
        } else {
          setResults({
            ...results,
            [`${poolAddress}-${collateralAddress}-${quoteAddress}`]: [],
          })
        }
      }
    },
    [collateralAddress, poolAddress, quoteAddress],
    250,
  )

  return (
    <>
      <AjnaHeader title="Ajna pool finder" intro="Lorem ipsum dolor sit amet" />
      <WithLoadingIndicator value={[context]}>
        {([{ chainId }]) => (
          <>
            <Flex
              sx={{
                flexDirection: 'column',
                rowGap: 2,
                justifyItems: 'center',
                alignItems: 'center',
                mb: '48px',
              }}
            >
              <Input
                sx={inputStyles}
                placeholder="Pool address"
                value={poolAddress}
                onChange={(e) => setPoolAddress(e.target.value.toLowerCase())}
              />
              <Box>OR</Box>
              <Input
                sx={inputStyles}
                placeholder="Collateral token address"
                value={collateralAddress}
                onChange={(e) => setCollateralAddress(e.target.value.toLowerCase())}
              />
              <Input
                sx={inputStyles}
                placeholder="Quote token address"
                value={quoteAddress}
                onChange={(e) => setQuoteAddress(e.target.value.toLowerCase())}
              />
            </Flex>
            {results[`${poolAddress}-${collateralAddress}-${quoteAddress}`] ? (
              <>
                {results[`${poolAddress}-${collateralAddress}-${quoteAddress}`].length > 0 ? (
                  <Flex sx={{ flexDirection: 'column', rowGap: 2 }}>
                    {results[`${poolAddress}-${collateralAddress}-${quoteAddress}`].map((pool) => (
                      <Flex sx={{ alignItems: 'center', columnGap: 2 }}>
                        <TokensGroup tokens={[pool.collateralToken, pool.quoteToken]} />
                        <Text as="p" sx={{ fontWeight: 'semiBold' }}>
                          {pool.collateralToken}/{pool.quoteToken}
                        </Text>
                        <AppLink
                          href={getOraclessProductUrl({ chainId, product: 'borrow', ...pool })}
                        >
                          <Button variant="tertiary">Borrow</Button>
                        </AppLink>
                        or
                        <AppLink
                          href={getOraclessProductUrl({ chainId, product: 'earn', ...pool })}
                        >
                          <Button variant="tertiary">Earn</Button>
                        </AppLink>
                      </Flex>
                    ))}
                  </Flex>
                ) : (
                  <Text as="p">No results for provided input.</Text>
                )}
              </>
            ) : (
              <>
                {errors.length > 0 ? (
                  errors.map((error) => <Text as="p">{error}</Text>)
                ) : (
                  <Spinner />
                )}
              </>
            )}
          </>
        )}
      </WithLoadingIndicator>
    </>
  )
}
