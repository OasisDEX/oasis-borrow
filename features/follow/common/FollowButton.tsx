import { Icon } from '@makerdao/dai-ui-icons'
import { useTranslation } from 'next-i18next'
import { Box, Button, Flex, Spinner } from 'theme-ui'

interface FollowButtonProps {
  isProcessing: boolean
  // isRetry: boolean
  isFollowing: boolean
  buttonClickHandler: () => void
}

export function FollowButton(props: FollowButtonProps) {
  const { t } = useTranslation()

  return (
    <Button
      variant="menuButton"
      disabled={props.isProcessing}
      onClick={props.buttonClickHandler}
      sx={{
        padding: '4px, 12px, 4px, 12px',
        border: '1px solid #EAEAEA',
        borderRadius: '16px',
        '&:hover': {
          border: '1px solid #25273D',
          color: '#25273D',
          background: 'white',
          '.star': { color: '#878BFC' },
        },
        color: '#626472',
        boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.2)',
        '.star': { color: '#575CFE' },
      }}
    >
      <Flex sx={{ justifyContent: 'space-between', gap: '8px', alignItems: 'center' }}>
        {props.isProcessing ? (
          <Spinner size="10px" />
        ) : (
          <Box className={props.isFollowing ? 'star_empty' : 'star'}>
            <Icon name={props.isFollowing ? 'star_empty' : 'star'} size="15px" />
          </Box>
        )}
        {props.isProcessing ? t('loading') : props.isFollowing ? t('follow') : t('unfollow')}
      </Flex>
    </Button>
  )
}
