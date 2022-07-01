import BigNumber from 'bignumber.js'
import { appContext } from 'components/AppContextProvider'
import React from 'react'
import { of } from 'rxjs'
import { Box, Container, Text } from 'theme-ui'

import {
  VaultLiquidatedNotice,
  VaultLiquidatingNextPriceNotice,
  VaultLiquidatingNotice,
  VaultOwnershipBanner,
} from '../VaultsNoticesView'

const mockedReclaimCollateral = () => of({})
export const VaultLiquidated = () => (
  <appContext.Provider value={{ reclaimCollateral$: mockedReclaimCollateral } as any}>
    <Container>
      <Box sx={{ mb: 3 }}>
        <Text>Owner viewing vault</Text>
        <VaultLiquidatedNotice
          token="ETH"
          unlockedCollateral={new BigNumber(100)}
          controller="0x00"
          id={new BigNumber(1)}
          isVaultController={true}
        />
      </Box>
      <Text>Other user viewing vault</Text>
      <Box sx={{ mb: 3 }}>
        <VaultLiquidatedNotice
          token="ETH"
          unlockedCollateral={new BigNumber(100)}
          controller="0x00"
          id={new BigNumber(1)}
          isVaultController={false}
        />
      </Box>
    </Container>
  </appContext.Provider>
)

export const VaultOwnership = () => (
  <appContext.Provider value={{ reclaimCollateral$: mockedReclaimCollateral } as any}>
    <Container>
      <VaultOwnershipBanner controller="0x0000000000000000000000000000000000000000" />
    </Container>
  </appContext.Provider>
)

const THIRTY_MINUTES_IN_MILLIS = 30 * 60 * 1000
export const VaultLiquidatingNextPrice = () => (
  <appContext.Provider value={{ reclaimCollateral$: mockedReclaimCollateral } as any}>
    <Container>
      <Box sx={{ mb: 3 }}>
        <Text>Owner viewing vault</Text>
        <VaultLiquidatingNextPriceNotice
          token="ETH"
          controller="0x00"
          id={new BigNumber(1)}
          isVaultController={true}
          dateNextCollateralPrice={new Date(Date.now() + THIRTY_MINUTES_IN_MILLIS)}
        />
      </Box>
      <Box sx={{ mb: 3 }}>
        <Text>Other user viewing vault</Text>
        <VaultLiquidatingNextPriceNotice
          token="ETH"
          controller="0x00"
          id={new BigNumber(1)}
          isVaultController={false}
          dateNextCollateralPrice={new Date(Date.now())}
        />
      </Box>
    </Container>
  </appContext.Provider>
)

export const VaultLiquidating = () => (
  <appContext.Provider value={{ reclaimCollateral$: mockedReclaimCollateral } as any}>
    <Container>
      <Box sx={{ mb: 3 }}>
        <Text>Owner viewing vault</Text>
        <VaultLiquidatingNotice
          token="ETH"
          controller="0x00"
          id={new BigNumber(1)}
          isVaultController={true}
        />
      </Box>
      <Text>Other user viewing vault</Text>
      <Box sx={{ mb: 3 }}>
        <VaultLiquidatingNotice
          token="ETH"
          controller="0x00"
          id={new BigNumber(1)}
          isVaultController={false}
        />
      </Box>
    </Container>
  </appContext.Provider>
)

// eslint-disable-next-line import/no-default-export
export default {
  title: 'Banners',
}
