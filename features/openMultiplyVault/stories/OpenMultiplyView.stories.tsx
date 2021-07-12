import { openMultiplyVaultStory } from 'helpers/stories/OpenMultiplyVaultStory'

import { OpenMultiplyVaultView } from '../components/OpenMultiplyVaultView'

export const WaitingForIlksToBeFetched = openMultiplyVaultStory({
  title: 'Open multiply vault empty state',
})()

export default {
  title: 'OpenMultiplyVault/Non-Blocking',
  component: OpenMultiplyVaultView,
}
