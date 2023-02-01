import { Icon } from '@makerdao/dai-ui-icons'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import React from 'react'
import { theme } from 'theme'
import { Box, Button, Spinner, SxStyleProp } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

interface FollowButtonProps {
  buttonClickHandler: () => void
  isFollowing: boolean
  isProcessing: boolean
  short?: boolean
  sx?: SxStyleProp
  isWalletConnected?: boolean
}

export function FollowButton({
  buttonClickHandler,
  isFollowing,
  isProcessing,
  short,
  sx,
  isWalletConnected,
}: FollowButtonProps) {
  const { t } = useTranslation()
  const [isHovering, setIsHovering] = useState(false)
  const isShort = useMediaQuery(`(max-width: ${theme.breakpoints[2]})`) || short

  const handleMouseOver = () => {
    setIsHovering(true)
  }

  const handleMouseOut = () => {
    setIsHovering(false)
  }

  return (
    <Button
      disabled={isProcessing || !isWalletConnected}
      onClick={buttonClickHandler}
      sx={{
        position: 'relative',
        py: 0,
        pr: isShort ? 0 : '12px',
        pl: isShort ? 0 : '30px',
        fontSize: 1,
        width: isShort ? ['32px', null, null, '36px'] : 'auto',
        height: isShort ? ['32px', null, null, '32px'] : 'auto',
        lineHeight: '26px',
        color: isFollowing ? 'primary100' : 'primary60',
        border: '1px solid',
        borderColor: 'neutral20',
        borderRadius: isShort ? 'ellipse' : 'large',
        backgroundColor: 'neutral10',
        boxShadow: isShort ? 'none' : 'surface',
        transition: 'border-color 200ms, background-color 200ms, color 200ms',
        '&:hover': {
          backgroundColor: 'neutral10',
          borderColor: 'primary100',
          color: isFollowing ? 'primary60' : 'primary100',
          '.star': {
            fill: isFollowing ? 'interactive50' : 'neutral10',
            stroke: isFollowing ? 'interactive50' : 'primary100',
            strokeWidth: isFollowing ? 0 : '1.5px',
          },
        },
        '&:disabled': {
          backgroundColor: 'neutral10',
          color: 'primary60',
        },
        '.star': {
          fill: isFollowing ? 'interactive100' : 'neutral10',
          stroke: isFollowing ? 'interactive100' : 'primary60',
          strokeWidth: isFollowing ? 0 : '1px',
          transition: 'stroke 200ms, stroke-width 200ms, fill 200ms',
        },
        ...(isShort && { display: 'flex', alignItems: 'center', justifyContent: 'center' }),
        ...sx,
      }}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      <Box
        sx={{
          position: 'absolute',
          top: isShort ? ['5px', null, null, '7px'] : '2px',
          left: isShort ? ['8px', null, null, '10px'] : '13px',
          margin: 'auto',
        }}
      >
        {isProcessing ? (
          <Spinner
            size={isShort ? 20 : 15}
            color="#878BFC"
            sx={{ position: 'relative', top: isShort ? 0 : '1px', left: '-3px' }}
          />
        ) : (
          <Box className="star">
            <Icon name="star" size={isShort ? 14 : 12} />
          </Box>
        )}
      </Box>
      {!isShort && (
        <>
          {isProcessing
            ? t('loading')
            : isHovering && isFollowing
            ? t('unfollow')
            : isFollowing
            ? t('following')
            : t('follow')}
        </>
      )}
    </Button>
  )
}
