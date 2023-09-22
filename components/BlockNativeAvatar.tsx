import { useConnectWallet } from '@web3-onboard/react'
import { svgStringToBase64 } from 'helpers/svgStringToBase64'
import React from 'react'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Image } from 'theme-ui'

type BlockNativeAvatarProps = {
  sx?: ThemeUIStyleObject
}

export function BlockNativeAvatar({ sx }: BlockNativeAvatarProps) {
  const [{ wallet }] = useConnectWallet()
  const sizes = {
    box: '32px',
    icon: '20px',
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
