import { Icon } from '@makerdao/dai-ui-icons'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { AppLink } from 'components/Links'
import { isAddress } from 'ethers/lib/utils'
import type { FC } from 'react'
import React from 'react'
import { Flex, Input, Label } from 'theme-ui'

interface PoolFinderAddressInputProps {
  label: string
  chainId?: NetworkIds
  placeholder: string
  type: 'address' | 'token'
  value: string
  onChange: (value: string) => void
}

export const PoolFinderAddressInput: FC<PoolFinderAddressInputProps> = ({
  label,
  chainId,
  placeholder,
  type,
  value,
  onChange,
}) => {
  const etherscanUrl = getNetworkContracts(NetworkIds.MAINNET, chainId).etherscan.url

  return (
    <Flex
      sx={{
        position: 'relative',
        flexDirection: 'column',
        alignItems: 'flex-start',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: '-24px',
          bottom: 0,
          width: '1px',
          backgroundColor: 'neutral20',
        },
        ':last-of-type': {
          '&::after': {
            content: 'none',
          },
        },
      }}
    >
      <Label htmlFor={label} variant="text.paragraph4" sx={{ position: 'relative', width: 'auto' }}>
        {label}
        <AppLink
          href={`${etherscanUrl}/${type}/${value}`}
          sx={{
            position: 'absolute',
            top: '-2px',
            left: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            ml: 2,
            border: '1px solid',
            borderColor: 'neutral20',
            borderRadius: 'ellipse',
            opacity: isAddress(value) ? 1 : 0,
            pointerEvents: isAddress(value) ? 'auto' : 'none',
            transition: 'opacity 100ms, border-color 200ms',
            '&:hover': {
              borderColor: 'primary100',
            },
          }}
        >
          <Icon name="link" size={16} color="primary100" sx={{ verticalAlign: 'bottom' }} />
        </AppLink>
      </Label>
      <Input
        id={label}
        type="text"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        sx={{
          mt: 1,
          p: 0,
          fontSize: 3,
          lineHeight: 'body',
          color: 'primary100',
          border: 'none',
          borderRadius: 0,
          '::placeholder': {
            color: 'primary30',
          },
        }}
        onChange={(e) => onChange(e.target.value)}
      />
    </Flex>
  )
}
