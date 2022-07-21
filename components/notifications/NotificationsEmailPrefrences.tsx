import { Box, Text } from "theme-ui";
import { NotificationPrefrenceCard } from "./NotificationPrefrenceCard";

export function NotificationsEmailPrefrences() {
  return (
    <Box>
      <NotificationPrefrenceCard
        heading="Enable email notifications"
        description="You are able to receive the email updates on Oasis.app"
        checked={false}
      />

      <Box>
        <Text
          sx={{
            fontSize: '12px',
            fontWeight: 600
          }}
        >
          Set up your email
        </Text>
      </Box>
    </Box>
  )
}