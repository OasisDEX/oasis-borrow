import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet'
import { isAddress } from 'ethers/lib/utils'
import { AjnaHeader } from 'features/ajna/common/components/AjnaHeader'
import { searchAjnaPool } from 'features/ajna/positions/common/helpers/searchAjnaPool'
import { useObservable } from 'helpers/observableHook'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import React, { useMemo, useState } from 'react'
import { Box, Flex, Grid, Input, SxStyleProp, Text } from 'theme-ui'

const inputStyles: SxStyleProp = {
  height: '50px',
  p: 3,
  fontSize: 2,
  border: '1px solid',
  borderColor: 'neutral20',
  borderRadius: 'medium',
}

function validateParams(collateralAddress: string, poolAddress: string, quoteAddress: string) {
  const errors: string[] = []

  if (poolAddress) {
    if (!isAddress(poolAddress)) errors.push('Pool address is not valid contract address.')
  }

  return errors
}

export function AjnaPoolFinderController() {
  const { identifiedTokens$ } = useAppContext()

  const [poolAddress, setPoolAddress] = useState<string>('')
  const [collateralAddress, setCollateralAddress] = useState<string>('')
  const [quoteAddress, setQuoteAddress] = useState<string>('')
  const [errors, setErrors] = useState<string[]>([])

  const [identifiedTokensData] = useObservable(
    useMemo(() => identifiedTokens$(['0xa168ef12e32933485199983bef1fa6fe55a29bdf']), []),
  )

  console.log('identifiedTokensData')
  console.log(identifiedTokensData)

  useDebouncedEffect(
    async () => {
      if (poolAddress || collateralAddress || quoteAddress) {
        const validation = validateParams(collateralAddress, poolAddress, quoteAddress)

        setErrors(validation)
        if (validation.length === 0) {
          const data = await searchAjnaPool({
            collateralAddress,
            poolAddress,
            quoteAddress,
          })

          console.log(data)
        }
      } else setErrors([])
    },
    [poolAddress],
    250,
  )

  return (
    <WithConnection>
      <AnimatedWrapper>
        <AjnaHeader title="Ajna pool finder" intro="Lorem ipsum dolor sit amet" />
        <Grid
          sx={{
            gridTemplateColumns: 'minmax(20px, 460px) max-content minmax(20px, 460px)',
            columnGap: 3,
            justifyContent: 'center',
          }}
        >
          <Flex>
            <Input
              sx={inputStyles}
              placeholder="Pool address"
              value={poolAddress}
              onChange={(e) => setPoolAddress(e.target.value)}
            />
          </Flex>
          <Box sx={{ pt: '12px' }}>OR</Box>
          <Flex sx={{ flexDirection: 'column', rowGap: 3 }}>
            <Input sx={inputStyles} placeholder="Collateral token symbol or address" />
            <Input sx={inputStyles} placeholder="Quote token symbol or address" />
          </Flex>
        </Grid>
        {errors.length > 0 && <Text as="p">{errors.join('\n')}</Text>}
      </AnimatedWrapper>
    </WithConnection>
  )
}
