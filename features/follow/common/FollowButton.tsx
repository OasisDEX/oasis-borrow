import { Icon } from '@makerdao/dai-ui-icons'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import React from 'react'
import { Box, Button, Spinner } from 'theme-ui'

interface FollowButtonProps {
  isProcessing: boolean
  isFollowing: boolean
  buttonClickHandler: () => void
  isShort?: boolean
}

export function FollowButton(props: FollowButtonProps) {
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
      disabled={props.isProcessing}
      onClick={props.buttonClickHandler}
      sx={
        !props.isShort
          ? {
              position: 'relative',
              p: '0 12px 0 30px',
              border: '1px solid',
              borderColor: 'neutral20',
              borderRadius: 'large',
              marginLeft: '16px',
              backgroundColor: 'neutral10',
              '&:hover': {
                backgroundColor: 'neutral10',
                borderColor: 'primary100',
                color: 'primary60',
                '.star': { color: '#878BFC', fill: '#878BFC' },
                '.star_empty': { color: '#EAEAEA', fill: 'white', stroke: '#25273D' },
              },
              '&:disabled': {
                backgroundColor: 'neutral10',
                color: 'primary60',
              },
              fontSize: 1,
              lineHeight: '26px',
              color: 'primary100',
              boxShadow: 'surface',
              transition: 'border-color 200ms, background-color 200ms, color 200ms',
              '.star': { color: '#575CFE', fill: '#575CFE' },
              '.star_empty': { fill: 'white', stroke: '#EAEAEA' },
            }
          : {
              position: 'relative',
              p: '4px 12px 4px 12px',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              border: '1px solid #626472',
              // borderColor: 'neutral20',
              borderRadius: '18px',
              marginLeft: '16px',
              gap: '4px',
              width: '32px',
              height: '32px',
              backgroundColor: 'neutral10',
              '&:hover': {
                backgroundColor: 'neutral10',
                borderColor: 'primary100',
                color: 'primary60',
                '.star': { color: '#878BFC', fill: '#878BFC' },
                '.star_empty': { color: '#EAEAEA', fill: 'white', stroke: '#25273D' },
              },
              '&:disabled': {
                backgroundColor: 'neutral10',
                color: 'primary60',
              },
              fontSize: 1,
              lineHeight: '26px',
              color: 'primary100',
              transition: 'border-color 200ms, background-color 200ms, color 200ms',
              '.star': { color: '#575CFE', fill: '#575CFE' },
              '.star_empty': { fill: 'white', stroke: 'neutral80' },
            }
      }
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      <Box sx={{ position: 'absolute', top: '2px', left: '13px', margin: 'auto' }}>
        {props.isProcessing ? (
          <Spinner
            size={15}
            color="#878BFC"
            sx={
              !props.isShort
                ? { position: 'relative', top: '1px', left: '-3px' }
                : { position: 'relative', top: '3px', right: '5px' }
            }
          />
        ) : (
          <Box className={props.isFollowing ? 'star_empty' : 'star'}>
            <Icon
              name="star"
              size={!props.isShort ? 12 : 14}
              sx={!props.isShort ? {} : { position: 'relative', top: '3px', right: '5px' }}
            />
          </Box>
        )}
      </Box>

      {!props.isShort && (
        <>
          {props.isProcessing
            ? t('loading')
            : isHovering && props.isFollowing
            ? t('unfollow')
            : props.isFollowing
            ? t('following')
            : t('follow')}
        </>
      )}
    </Button>
  )
}
