import * as React from 'react'
import { Box } from 'theme-ui'

import { Muted } from '../text/Text'

export const LoggedOut = ({ view = 'the data', ...props }: { view?: string }) => {
  return (
    <Box {...props}>
      <div>
        {/* <SvgImage image={radioSvg} className={styles.icon} /> */}
        Radio Icon Placeholder
      </div>
      <Muted>Connect to view {view}</Muted>
    </Box>
  )
}
