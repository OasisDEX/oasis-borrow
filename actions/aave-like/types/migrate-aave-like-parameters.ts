import type { AaveLikePosition } from "@oasisdex/dma-library-migration";
import type { NetworkIds } from "blockchain/networks";
import type { ReserveData } from "features/aave/types";
import type { AaveLikeLendingProtocol } from "lendingProtocols";

export interface MigrateAaveLikeParameters {
  position: AaveLikePosition,
  networkId: NetworkIds,
  proxyAddress: string,
  userAddress: string,
  reserveData: ReserveData,
  protocol: AaveLikeLendingProtocol,

}
