
import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet'
import { isAddress } from 'ethers/lib/utils'
import { AjnaHeader } from 'features/ajna/common/components/AjnaHeader'
import { searchAjnaPool } from 'features/ajna/positions/common/helpers/searchAjnaPool'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import React, {   useState } from 'react'
import { Box, Flex, Grid, Input, SxStyleProp, Text } from 'theme-ui'

const inputStyles: SxStyleProp = {
  height: '50px',
  p: 3,
  fontSize: 2,
  border: '1px solid',
  borderColor: 'neutral20',
  borderRadius: 'medium',
}

function validateParams({
  collateralAddress,
  poolAddress,
  quoteAddress,
}: {
  collateralAddress: string
  poolAddress: string
  quoteAddress: string
}) {
  const errors: string[] = []

  if (!poolAddress && !collateralAddress && !quoteAddress)
    errors.push('Specify at least one of the addresses')
  if (poolAddress && !isAddress(poolAddress))
    errors.push('Pool address is not valid contract address.')
  if (collateralAddress && !isAddress(collateralAddress))
    errors.push('Collateral address is not valid contract address.')
  if (quoteAddress && !isAddress(quoteAddress))
    errors.push('Quote address is not valid contract address.')

  return errors
}

export function AjnaPoolFinderController() {
  const { identifiedTokens$ } = useAppContext()

  const [poolAddress, setPoolAddress] = useState<string>('')
  const [collateralAddress, setCollateralAddress] = useState<string>('')
  const [quoteAddress, setQuoteAddress] = useState<string>('')
  const [errors, setErrors] = useState<string[]>([])

  useDebouncedEffect(
    async () => {
      const validation = validateParams({
        collateralAddress,
        poolAddress,
        quoteAddress,
      })

      setErrors(validation)
      if (validation.length === 0) {
        const data = await searchAjnaPool({
          collateralAddress,
          poolAddress,
          quoteAddress,
        })
        // const identifiedTokens = identifiedTokens$.sub

        console.log(data)
      }
    },
    [collateralAddress, poolAddress, quoteAddress],
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
            <Input
              sx={inputStyles}
              placeholder="Collateral token address"
              value={collateralAddress}
              onChange={(e) => setCollateralAddress(e.target.value)}
            />
            <Input
              sx={inputStyles}
              placeholder="Quote token address"
              value={quoteAddress}
              onChange={(e) => setQuoteAddress(e.target.value)}
            />
          </Flex>
        </Grid>
        {errors.length > 0 && errors.map((error) => <Text as="p">{error}</Text>)}
      </AnimatedWrapper>
    </WithConnection>
  )
}
