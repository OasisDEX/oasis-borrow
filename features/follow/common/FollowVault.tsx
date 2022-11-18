import { Icon } from "@makerdao/dai-ui-icons";
import { Box, Button } from "theme-ui";

export function FollowVault() {
  return (
    <Box>
         <Icon
                name="star"
                size="15px"
                sx={{ position: 'relative', left: '6px', transition: '0.2s' }}
              />
        <Button variant="menuButton">Follow</Button>
    </Box>
  );
}