import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { PoolFinderAddressInput, PoolFinderReplacer } from 'features/ajna/pool-finder/components'
import type { PoolFinderFormState } from 'features/ajna/pool-finder/types'
import { formatAddress } from 'helpers/formatters/format'
import { LendingProtocol } from 'lendingProtocols'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React, { useState } from 'react'
import { Box, Flex, Grid, Image } from 'theme-ui'

interface PoolFinderFormControllerProps {
  onChange: (addresses: PoolFinderFormState) => void
}

export const PoolFinderFormController: FC<PoolFinderFormControllerProps> = ({ onChange }) => {
  const { t } = useTranslation()
  const [addresses, setAddresses] = useState<PoolFinderFormState>({
    collateralToken: '',
    poolAddress: '',
    quoteToken: '',
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
        backgroundColor: 'neutral10',
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
          label={t('pool-finder.form.pool-address')}
          placeholder={formatAddress(
            getNetworkContracts(NetworkIds.MAINNET).ajnaPoolPairs['ETH-USDC'].address,
          )}
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
          label={t('pool-finder.form.collateral-token')}
          placeholder={t('pool-finder.form.token-placeholder')}
          value={addresses.collateralToken}
          onChange={(value) => {
            setAddresses({
              ...addresses,
              collateralToken: value,
            })
            onChange({
              ...addresses,
              collateralToken: value,
            })
          }}
        />
        <PoolFinderAddressInput
          label={t('pool-finder.form.quote-token')}
          placeholder={t('pool-finder.form.token-placeholder')}
          value={addresses.quoteToken}
          onChange={(value) => {
            setAddresses({
              ...addresses,
              quoteToken: value,
            })
            onChange({
              ...addresses,
              quoteToken: value,
            })
          }}
        />
        <PoolFinderReplacer
          isVisible={Boolean(addresses.collateralToken || addresses.quoteToken)}
          onClick={() => {
            setAddresses({
              ...addresses,
              collateralToken: addresses.quoteToken,
              quoteToken: addresses.collateralToken,
            })
            onChange({
              ...addresses,
              collateralToken: addresses.quoteToken,
              quoteToken: addresses.collateralToken,
            })
          }}
        />
      </Grid>
    </Flex>
  )
}
