import {
  AavePositionHeader,
  AavePositionHeaderWithDetails,
} from '../earn/aave/components/AavePositionHeader'
import { ManageSectionComponent } from '../earn/aave/components/ManageSectionComponent'
import { SimulateSectionComponent } from '../earn/aave/components/SimulateSectionComponent'
import { AaveMultiplyHeader } from '../multiply/aave/components/AaveMultiplyHeader'
import { AaveMultiplyManageComponent } from '../multiply/aave/components/AaveMultiplyManageComponent'
import { AaveMultiplySimulate } from '../multiply/aave/components/AaveMultiplySimulate'

export const strategies = {
  'aave-earn': {
    urlSlug: 'stETHeth',
    name: 'stETHeth',
    viewComponents: {
      headerOpen: AavePositionHeaderWithDetails,
      headerManage: AavePositionHeader,
      simulateSection: SimulateSectionComponent,
      vaultDetails: ManageSectionComponent,
    },
  },
  'aave-multiply': {
    name: 'stETHusdc',
    urlSlug: 'stETHusdc',
    viewComponents: {
      headerOpen: AaveMultiplyHeader,
      headerManage: AaveMultiplyHeader,
      simulateSection: AaveMultiplySimulate,
      vaultDetails: AaveMultiplyManageComponent,
    },
  },
}
