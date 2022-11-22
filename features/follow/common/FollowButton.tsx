import { Icon } from '@makerdao/dai-ui-icons'
import { AppSpinner } from 'helpers/AppSpinner'
import { useTranslation } from 'next-i18next'
import { Box, Button } from 'theme-ui'

export type FollowButtonState = 'follow' | 'unfollow'

interface FollowButtonProps {
  isProcessing: boolean
  state: FollowButtonState
  followAction: (state: FollowButtonState) => void
  unfollowAction: (state: FollowButtonState) => void
}

export function FollowButton({
  isProcessing,
  state,
  followAction,
  unfollowAction,
}: FollowButtonProps) {
  const { t } = useTranslation()
  return (
    <Box>
      {isProcessing ? (
        <AppSpinner         sx={{
          position: 'relative',
          left: '14px',
          top: '25px',
          width: '14px',
          height: '14px',
          transition: '0.2s',
        }}/>
      ) : (
      <Icon
        name={state === 'follow' ? "star_empty" : "star"}
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
      <Button
        variant="menuButton"
        disabled={isProcessing}
        onClick={
          state === 'follow'
            ? () => {
                followAction(state)
              }
            : () => {
                unfollowAction(state)
              }
        }
      >
        {state === 'follow' ? t('follow') : t('unfollow')}
      </Button>
    </Box>
  )
}
