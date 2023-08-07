import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { WithConnection } from 'components/connectWallet'
import { searchAjnaPool } from 'features/ajna/positions/common/helpers/searchAjnaPool'
import React from 'react'
import { Button } from 'theme-ui'

export function AjnaPoolFinderController() {
  return (
    <WithConnection>
      <AnimatedWrapper sx={{ mb: 5 }}>
        Seach
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
