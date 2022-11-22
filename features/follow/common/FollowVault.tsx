import { Icon } from "@makerdao/dai-ui-icons";
import { Box, Button } from "theme-ui";

export function FollowVault() {
  return (
    <Box>
         <Icon
                name="star_empty"
                size="15px"
                sx={{ position: 'relative', left: '12px', top: '7px', width:'14px', height: '14px', transition: '0.2s' }}
              />
        <Button variant="menuButton">Follow</Button>
    </Box>
  );
}