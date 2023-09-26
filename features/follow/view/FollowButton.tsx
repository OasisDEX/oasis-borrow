import { Icon } from 'components/Icon'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import { theme } from 'theme'
import type { ThemeUIStyleObject } from 'theme-ui'
import { Box, Button, Card, Spinner, Text } from 'theme-ui'
import { star } from 'theme/icons'
import { useMediaQuery } from 'usehooks-ts'

interface FollowButtonProps {
  isLimitReached: boolean
  buttonClickHandler: () => void
  isFollowing: boolean
  isProcessing: boolean
  short?: boolean
  sx?: ThemeUIStyleObject
  isWalletConnected?: boolean
}

export function FollowButton({
  buttonClickHandler,
  isFollowing,
  isProcessing,
  isLimitReached,
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
      disabled={isProcessing || (isLimitReached && !isFollowing) || !isWalletConnected}
      onClick={buttonClickHandler}
      sx={{
        position: 'relative',
        py: 0,
        pr: isShort ? 0 : '12px',
        pl: isShort ? 0 : '30px',
        fontSize: 1,
        width: isShort ? ['32px', null, null, '36px'] : 'auto',
        height: isShort ? ['32px', null, null, '36px'] : 'auto',
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
          '.tooltip': {
            display: 'flex',
          },
        },
        '&:disabled': {
          backgroundColor: 'neutral30',
          color: 'primary60',
          pointerEvents: 'auto',
          border: '1px solid #EAEAEA',
          '&:hover .star': {
            fill: 'neutral10',
            stroke: 'primary60',
            strokeWidth: '1px',
          },
        },
        '.star': {
          fill: isFollowing ? 'interactive100' : 'neutral10',
          stroke: isFollowing ? 'interactive100' : 'primary60',
          strokeWidth: isFollowing ? 0 : '1px',
          transition: 'stroke 200ms, stroke-width 200ms, fill 200ms',
        },
        ...(isShort && {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }),
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
            <Icon
              icon={star}
              size={isShort ? 14 : 12}
              sx={{
                ...(isShort && {
                  position: 'absolute',
                  marginTop: '2px',
                }),
              }}
            />
          </Box>
        )}
      </Box>

      {!isShort && (
        <>
          {!isLimitReached &&
            (isProcessing
              ? t('loading')
              : isHovering && isFollowing
              ? t('unfollow')
              : isFollowing
              ? t('following')
              : t('follow'))}

          {t(
            isLimitReached && !isFollowing
              ? 'followed-vaults-limit'
              : isLimitReached && isFollowing && !isHovering
              ? 'following'
              : isLimitReached && isFollowing && isHovering
              ? 'unfollow'
              : '',
          )}
        </>
      )}
      {isShort && isLimitReached && !isFollowing && (
        <Card
          className="tooltip"
          variant="cards.tooltip"
          sx={{
            position: 'absolute',
            alignItems: 'center',
            top: '-100%',
            display: 'none',
            width: 'auto',
            px: 2,
            py: 1,
            lineHeight: '28px',
          }}
        >
          <Text as="p" variant="paragraph4">
            {t('followed-vaults-limit')}
          </Text>
        </Card>
      )}
    </Button>
  )
}
