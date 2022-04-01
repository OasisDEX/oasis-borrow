import { WithChildren } from 'helpers/types'
import React from 'react'
import { Box } from 'theme-ui'

import { UniswapWidget } from './UniswapWidget'

function StoryLayout({ children }: WithChildren) {
  return <Box sx={{ p: 5, bg: 'pink' }}>{children}</Box>
}

// function useWeb3Provider() {
//   const [provider, setProvider]: any = useState()

//   useEffect(() => {
//     detectEthereumProvider()
//       .then(setProvider)
//       .catch(() => {
//         console.error('Error detecting provider')
//       })
//   }, [])

//   return provider
// }

export const Widget = () => {
  return (
    <StoryLayout>
      <UniswapWidget />
    </StoryLayout>
  )
}

// eslint-disable-next-line import/no-default-export
export default {
  title: 'UniswapWidget',
}
