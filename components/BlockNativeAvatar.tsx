import { useConnectWallet } from '@web3-onboard/react'
import { svgStringToBase64 } from 'helpers/svgStringToBase64'
import React from 'react'
import { Box, Image, SxStyleProp } from 'theme-ui'

type BlockNativeAvatarProps = {
  small?: boolean
  sx?: SxStyleProp
}

export function BlockNativeAvatar({ small = false, sx }: BlockNativeAvatarProps) {
  const [{ wallet }] = useConnectWallet()
  const sizes = {
    box: small ? '32px' : '42px',
    icon: small ? '18px' : '24px',
  }
  return (
    <Box
      sx={{
        width: sizes.box,
        height: sizes.box,
        minWidth: sizes.box,
        minHeight: sizes.box,
        borderRadius: 'round',
        backgroundColor: 'neutral20',
        display: 'flex',
        justifyContent: 'center',
        ...sx,
      }}
    >
      <Image
        src={`data:image/svg+xml;base64,${svgStringToBase64(wallet?.icon)}`}
        width={sizes.icon}
      />
    </Box>
  )
}
