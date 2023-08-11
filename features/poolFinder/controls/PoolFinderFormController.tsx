import { PoolFinderAddressInput } from 'features/poolFinder/components/PoolFinderAddressInput'
import { PoolFinderReplacer } from 'features/poolFinder/components/PoolFinderReplacer'
import { PoolFinderFormState } from 'features/poolFinder/types'
import { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import React, { FC, useState } from 'react'
import { Box, Flex, Grid, Image } from 'theme-ui'

interface PoolFinderFormControllerProps {
  onChange: (addresses: PoolFinderFormState) => void
}

export const PoolFinderFormController: FC<PoolFinderFormControllerProps> = ({ onChange }) => {
  const [addresses, setAddresses] = useState<PoolFinderFormState>({
    collateralAddress: '',
    poolAddress: '',
    quoteAddress: '',
  })

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
          value={addresses.poolAddress}
          onChange={(value) => {
            setAddresses({
              ...addresses,
              poolAddress: value,
            })
            onChange({
              ...addresses,
              poolAddress: value,
            })
          }}
        />
        <PoolFinderAddressInput
          label="Collateral Token"
          placeholder="Symbol or addres"
          value={addresses.collateralAddress}
          onChange={(value) => {
            setAddresses({
              ...addresses,
              collateralAddress: value,
            })
            onChange({
              ...addresses,
              collateralAddress: value,
            })
          }}
        />
        <PoolFinderAddressInput
          label="Quote token"
          placeholder="Symbol or addres"
          value={addresses.quoteAddress}
          onChange={(value) => {
            setAddresses({
              ...addresses,
              quoteAddress: value,
            })
            onChange({
              ...addresses,
              quoteAddress: value,
            })
          }}
        />
        <PoolFinderReplacer
          isVisible={Boolean(addresses.collateralAddress || addresses.quoteAddress)}
          onClick={() => {
            setAddresses({
              ...addresses,
              collateralAddress: addresses.quoteAddress,
              quoteAddress: addresses.collateralAddress,
            })
            onChange({
              ...addresses,
              collateralAddress: addresses.quoteAddress,
              quoteAddress: addresses.collateralAddress,
            })
          }}
        />
      </Grid>
    </Flex>
  )
}
