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
  chainId: NetworkIds
  onChange: (addresses: PoolFinderFormState) => void
}

export const PoolFinderFormController: FC<PoolFinderFormControllerProps> = ({
  chainId,
  onChange,
}) => {
  const { t } = useTranslation()
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
          type="address"
          chainId={chainId}
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
          type="token"
          chainId={chainId}
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
          label={t('pool-finder.form.quote-token')}
          placeholder={t('pool-finder.form.token-placeholder')}
          value={addresses.quoteAddress}
          type="token"
          chainId={chainId}
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
