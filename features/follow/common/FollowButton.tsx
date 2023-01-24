import { Icon } from '@makerdao/dai-ui-icons'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import React from 'react'
import { Box, Button, Spinner, SxStyleProp } from 'theme-ui'

interface FollowButtonProps {
  buttonClickHandler: () => void
  isFollowing: boolean
  isProcessing: boolean
  sx?: SxStyleProp
}

export function FollowButton({
  buttonClickHandler,
  isFollowing,
  isProcessing,
  sx,
}: FollowButtonProps) {
  const { t } = useTranslation()
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseOver = () => {
    setIsHovering(true)
  }

  const handleMouseOut = () => {
    setIsHovering(false)
  }

  return (
    <Button
      disabled={isProcessing}
      onClick={buttonClickHandler}
      sx={{
        position: 'relative',
        p: '0 12px 0 30px',
        fontSize: 1,
        lineHeight: '26px',
        color: isFollowing ? 'primary100' : 'primary60',
        border: '1px solid',
        borderColor: 'neutral20',
        borderRadius: 'large',
        backgroundColor: 'neutral10',
        boxShadow: 'surface',
        transition: 'border-color 200ms, background-color 200ms, color 200ms',
        '&:hover': {
          backgroundColor: 'neutral10',
          borderColor: 'primary100',
          color: isFollowing ? 'primary60' : 'primary100',
          '.star': {
            fill: isFollowing ? 'interactive50' : 'neutral10',
            stroke: isFollowing ? 'interactive50' : 'primary100',
            strokeWidth: isFollowing ? '1px' : '1.5px',
          },
        },
        '&:disabled': {
          backgroundColor: 'neutral10',
          color: 'primary60',
        },
        '.star': {
          fill: isFollowing ? 'interactive100' : 'neutral10',
          stroke: isFollowing ? 'interactive100' : 'primary60',
          strokeWidth: '1px',
          transition: 'stroke 200ms, stroke-width 200ms, fill 200ms',
        },
        ...sx,
      }}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      <Box sx={{ position: 'absolute', top: '2px', left: '13px', margin: 'auto' }}>
        {isProcessing ? (
          <Spinner
            size={15}
            color="#878BFC"
            sx={{ position: 'relative', top: '1px', left: '-3px' }}
          />
        ) : (
          <Box className="star">
            <Icon name="star" size={12} />
          </Box>
        )}
      </Box>

      {isProcessing
        ? t('loading')
        : isHovering && isFollowing
        ? t('unfollow')
        : isFollowing
        ? t('following')
        : t('follow')}
    </Button>
  )
}
