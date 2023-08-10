import { PoolFinderAddressInput } from 'features/poolFinder/components/PoolFinderAddressInput'
import { PoolFinderReplacer } from 'features/poolFinder/components/PoolFinderReplacer'
import { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import React, { FC, useState } from 'react'
import { Box, Flex, Grid, Image } from 'theme-ui'

interface PoolFinderFormControllerProps {
  onChange: (poolAddress: string, collateralAddress: string, quoteAddress: string) => void
}

export const PoolFinderFormController: FC<PoolFinderFormControllerProps> = ({ onChange }) => {
  const [poolAddress, setPoolAddress] = useState<string>('')
  const [collateralAddress, setCollateralAddress] = useState<string>('')
  const [quoteAddress, setQuoteAddress] = useState<string>('')

  return (
    <Flex
      sx={{
        columnGap: '24px',
        p: '24px',
        border: '1px solid',
        borderColor: 'neutral20',
        borderRadius: 'circle',
        boxShadow: 'buttonMenu',
      }}
    >
      <Box sx={{ width: '48px', flexShrink: 0 }}>
        <Image
          src={lendingProtocolsByName[LendingProtocol.Ajna].icon}
          sx={{ width: '48px', verticalAlign: 'bottom' }}
        />
      </Box>
      <Grid
        sx={{
          position: 'relative',
          width: '100%',
          gridTemplateColumns: '1fr 1fr 1fr',
          columnGap: '48px',
        }}
      >
        <PoolFinderAddressInput
          label="Pool Address"
          placeholder="0×232b…x8482"
          value={poolAddress}
          onChange={(value) => {
            setPoolAddress(value)
            onChange(value, collateralAddress, quoteAddress)
          }}
        />
        <PoolFinderAddressInput
          label="Collateral Token"
          placeholder="Symbol or addres"
          value={collateralAddress}
          onChange={(value) => {
            setCollateralAddress(value)
            onChange(poolAddress, value, quoteAddress)
          }}
        />
        <PoolFinderAddressInput
          label="Quote token"
          placeholder="Symbol or addres"
          value={quoteAddress}
          onChange={(value) => {
            setQuoteAddress(value)
            onChange(poolAddress, collateralAddress, value)
          }}
        />
        <PoolFinderReplacer
          isVisible={Boolean(collateralAddress || quoteAddress)}
          onClick={() => {
            const storedCollateralAddress = collateralAddress
            const storedQuoteAddress = quoteAddress

            setCollateralAddress(storedQuoteAddress)
            setQuoteAddress(storedCollateralAddress)
            onChange(poolAddress, storedQuoteAddress, storedCollateralAddress)
          }}
        />
      </Grid>
    </Flex>
  )
}
