import type { BaseContract, ethers } from 'ethers'
import type { ContractDesc } from 'features/web3Context'
import type { TypedEvent, TypedEventFilter } from 'types/ethers-contracts/common'

type GetLogsDelegate = <TEvent extends TypedEvent<any, any>>(
  topic: TypedEventFilter<TEvent>,
) => Promise<TEvent[]>

interface FilterableContract extends BaseContract {
  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TEvent>>
}

export async function extendContract<TContract extends FilterableContract>(
  contractDesc: ContractDesc & { genesisBlock: number },
  factory: {
    connect: (address: string, provider: ethers.providers.Provider) => TContract
  },
  mainProvider: ethers.providers.Provider,
  forkProvider?: ethers.providers.Provider,
): Promise<TContract & { getLogs: GetLogsDelegate }> {
  const contract = factory.connect(contractDesc.address, mainProvider)

  if (!forkProvider) {
    return {
      ...contract,
      getLogs: (topic) => contract.queryFilter(topic, contractDesc.genesisBlock, 'latest'),
    }
  }

  const forkContract = factory.connect(contractDesc.address, forkProvider)
  const forkBlockNumber = await forkProvider.getBlockNumber()

  const mainRpcBlocks = {
    from: contractDesc.genesisBlock,
    to: forkBlockNumber - 1000,
  }
  const forkRpcBlocks = {
    from: forkBlockNumber - 1000 + 1,
    to: forkBlockNumber,
  }

  return {
    ...contract,
    getLogs: (topic) =>
      Promise.all([
        contract.queryFilter(topic, mainRpcBlocks.from, mainRpcBlocks.to),
        forkContract.queryFilter(topic, forkRpcBlocks.from, forkRpcBlocks.to),
      ]).then(([mainLogs, forkLogs]) => [...mainLogs, ...forkLogs]),
  }
}
