import { Icon } from '@makerdao/dai-ui-icons'
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
        }}
      />
      <Button
        variant="menuButton"
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
