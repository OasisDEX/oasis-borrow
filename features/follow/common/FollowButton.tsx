import { Icon } from '@makerdao/dai-ui-icons'
import { useTranslation } from 'next-i18next'
import { Button, Flex, Spinner } from 'theme-ui'

interface FollowButtonProps {
  isProcessing: boolean
  // isRetry: boolean
  isFollowing: boolean
  buttonClickHandler: () => void
}

export function FollowButton(props: FollowButtonProps) {
  const { t } = useTranslation()

  return (
    <Button variant="menuButton" disabled={props.isProcessing} onClick={props.buttonClickHandler}>
      <Flex sx={{ justifyContent: 'space-between', gap: '8px', alignItems: 'center' }}>
        {props.isProcessing ? (
          <Spinner size="10px" />
        ) : (
          <Icon name={props.isFollowing ? 'star_empty' : 'star'} size="15px" />
        )}
        {props.isFollowing ? t('follow') : t('unfollow')}
      </Flex>
    </Button>
  )
}
