import { Icon } from '@makerdao/dai-ui-icons'
import { AppSpinner } from 'helpers/AppSpinner'
import { useTranslation } from 'next-i18next'
import { Box, Button } from 'theme-ui'

export type FollowButtonState = 'follow' | 'unfollow'

interface FollowButtonProps {
  isProcessing: boolean
  // isRetry: boolean
  state: FollowButtonState
  buttonClickHandler: () => void
}

export function FollowButton(props: FollowButtonProps) {
  const { t } = useTranslation()

  return (
    <Box>
      {props.isProcessing ? (
        <AppSpinner
          sx={{
            position: 'relative',
            left: '14px',
            top: '25px',
            width: '14px',
            height: '14px',
            transition: '0.2s',
          }}
        />
      ) : (
        <Icon
          name={props.state === 'follow' ? 'star_empty' : 'star'}
          size="15px"
          sx={{
            position: 'relative',
            left: '28px',
            top: '1px',
            width: '14px',
            height: '14px',
            transition: '0.2s',
            color: '#878BFC',
          }}
        />
      )}
      <Button variant="menuButton" disabled={props.isProcessing} onClick={props.buttonClickHandler}>
        {props.state === 'follow' ? t('follow') : t('unfollow')}
      </Button>
    </Box>
  )
}
