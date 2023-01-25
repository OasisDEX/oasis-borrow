import { Icon } from '@makerdao/dai-ui-icons'
import { AppLink } from 'components/Links'
import React from 'react'
import { Button } from 'theme-ui'

interface ShareButtonPropsWithLink {
  hashtags?: never
  link: string
  text?: never
  url: never
  via?: never
}

interface ShareButtonPropsWithParts {
  hashtags?: string
  link?: never
  text?: string
  url: string
  via?: string
}

type ShareButtonProps = ShareButtonPropsWithLink | ShareButtonPropsWithParts

export const twitterSharePositionText = 'Check out this position'
export const twitterSharePositionVia = 'oasisdotapp'

export function getTwitterShareUrl({
  hashtags,
  text,
  url,
  via,
}: ShareButtonPropsWithParts): string {
  return `https://twitter.com/intent/tweet?${new URLSearchParams({
    url,
    ...(hashtags && { hashtags }),
    ...(text && { text }),
    ...(via && { via }),
  }).toString()}`
}

export function ShareButton({ link, ...rest }: ShareButtonProps) {
  return (
    <AppLink href={link || getTwitterShareUrl(rest)}>
      <Button
        className="discover-action"
        variant="tertiary"
        sx={{ height: '36px', px: 2, pt: '5px', pb: 0 }}
      >
        <Icon name="share" size={20} />
      </Button>
    </AppLink>
    // <Button
    //   disabled={isProcessing}
    //   onClick={buttonClickHandler}
    //   sx={{
    //     position: 'relative',
    //     py: 0,
    //     pr: isShort ? 0 : '12px',
    //     pl: isShort ? 0 : '30px',
    //     fontSize: 1,
    //     width: isShort ? ['32px', null, null, '36px'] : 'auto',
    //     height: isShort ? ['32px', null, null, '36px'] : 'auto',
    //     lineHeight: '26px',
    //     color: isFollowing ? 'primary100' : 'primary60',
    //     border: '1px solid',
    //     borderColor: 'neutral20',
    //     borderRadius: isShort ? 'ellipse' : 'large',
    //     backgroundColor: 'neutral10',
    //     boxShadow: isShort ? 'none' : 'surface',
    //     transition: 'border-color 200ms, background-color 200ms, color 200ms',
    //     '&:hover': {
    //       backgroundColor: 'neutral10',
    //       borderColor: 'primary100',
    //       color: isFollowing ? 'primary60' : 'primary100',
    //       '.star': {
    //         fill: isFollowing ? 'interactive50' : 'neutral10',
    //         stroke: isFollowing ? 'interactive50' : 'primary100',
    //         strokeWidth: isFollowing ? 0 : '1.5px',
    //       },
    //     },
    //     '&:disabled': {
    //       backgroundColor: 'neutral10',
    //       color: 'primary60',
    //     },
    //     '.star': {
    //       fill: isFollowing ? 'interactive100' : 'neutral10',
    //       stroke: isFollowing ? 'interactive100' : 'primary60',
    //       strokeWidth: isFollowing ? 0 : '1px',
    //       transition: 'stroke 200ms, stroke-width 200ms, fill 200ms',
    //     },
    //     ...sx,
    //   }}
    //   onMouseOver={handleMouseOver}
    //   onMouseOut={handleMouseOut}
    // >
    //   <Box
    //     sx={{
    //       position: 'absolute',
    //       top: isShort ? ['5px', null, null, '7px'] : '2px',
    //       left: isShort ? ['8px', null, null, '10px'] : '13px',
    //       margin: 'auto',
    //     }}
    //   >
    //     {isProcessing ? (
    //       <Spinner
    //         size={isShort ? 20 : 15}
    //         color="#878BFC"
    //         sx={{ position: 'relative', top: isShort ? 0 : '1px', left: '-3px' }}
    //       />
    //     ) : (
    //       <Box className="star">
    //         <Icon name="star" size={isShort ? 14 : 12} />
    //       </Box>
    //     )}
    //   </Box>
    //   {!isShort && (
    //     <>
    //       {isProcessing
    //         ? t('loading')
    //         : isHovering && isFollowing
    //         ? t('unfollow')
    //         : isFollowing
    //         ? t('following')
    //         : t('follow')}
    //     </>
    //   )}
    // </Button>
  )
}
