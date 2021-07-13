import { openMultiplyVaultStory } from 'helpers/stories/OpenMultiplyVaultStory'

import { OpenMultiplyVaultView } from '../components/OpenMultiplyVaultView'

export const WaitingForIlksToBeFetched = openMultiplyVaultStory({
  title: 'Open multiply vault empty state',
})()

// eslint-disable-next-line import/no-default-export
export default {
  title: 'OpenMultiplyVault/Non-Blocking',
  component: OpenMultiplyVaultView,
}
