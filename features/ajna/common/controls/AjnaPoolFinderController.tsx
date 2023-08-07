import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { WithConnection } from 'components/connectWallet'
import { AjnaHeader } from 'features/ajna/common/components/AjnaHeader'
import { searchAjnaPool } from 'features/ajna/positions/common/helpers/searchAjnaPool'
import { useDebouncedEffect } from 'helpers/useDebouncedEffect'
import React, { useState } from 'react'
import { Box, Button, Flex, Grid, Input, SxStyleProp } from 'theme-ui'

const inputStyles: SxStyleProp = {
  height: '50px',
  p: 3,
  fontSize: 2,
  border: '1px solid',
  borderColor: 'neutral20',
  borderRadius: 'medium',
}

export function AjnaPoolFinderController() {
  const [poolAddress, setPoolAddress] = useState<string>('')

  useDebouncedEffect(
    () => {
      console.log('new')
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
        <Button
          onClick={async () => {
            const data = await searchAjnaPool({
              collateralAddress: '',
              poolAddress: '',
              quoteAddress: '0x10aa0cf12aab305bd77ad8f76c037e048b12513b',
            })

            console.log(data)
          }}
        >
          Search
        </Button>
      </AnimatedWrapper>
    </WithConnection>
  )
}
