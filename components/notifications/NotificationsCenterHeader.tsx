import { Icon } from "@makerdao/dai-ui-icons";
import { Text, Flex, Button } from "theme-ui";

interface NotificationsCenterHeaderProps {
  onButtonClick: () => void;
  showPrefrencesTab: boolean;
}

export function NotificationsCenterHeader({
  onButtonClick,
  showPrefrencesTab
}: NotificationsCenterHeaderProps) {
  return (
    <Flex
      sx={{
        borderBottom: '1px solid #EAEAEA',
        pb: '16px',
        alignItems: 'center'
      }}
    >
      <Text
        sx={{
          flexGrow: 1,
          fontWeight: 600,
          fontSize: '18px'
        }}
      >
        Notifications
      </Text>

      <Button
        sx={{
          width: '40px',
          height: '40px',
          padding: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexShrink: 0,
          background: 'white',
          borderRadius: '18px',
          // height: '28px',
          // width: '28px',
          ':hover': {
            background: '#F3F7F9'
          },
          // display: 'flex',
          // alignItems: 'center',
          // justifyContent: 'center'
        }}
        onClick={onButtonClick}
      >
        <Icon
          name={showPrefrencesTab ? 'close' : 'settings'}
          size="auto"
          width="16"
          color={'lavender'}
        />
      </Button>
    </Flex>
  )
}