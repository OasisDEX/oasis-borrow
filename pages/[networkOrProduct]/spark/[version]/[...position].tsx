import type { NetworkNames } from 'blockchain/networks'
import { getNetworkByName } from 'blockchain/networks'
import { settings } from 'features/omni-kit/protocols/spark/settings'
import { getOmniServerSideProps } from 'features/omni-kit/server'
import type { SparkLendingProtocol } from 'lendingProtocols'
import { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import SparkPositionPage from 'pages/[networkOrProduct]/spark/[...position]'

export default SparkPositionPage

export async function getServerSideProps({ locale, query }: GetServerSidePropsContext) {
  // this is copied and reexported logic from
  // pages/[networkOrProduct]/spark/[...position].tsx
  // it needs to be here because in the past we've added 'v3' to the spark url
  // and I want them to be handled as well (at least for some time)
  // its currently April 2024, if it has been more than 6 months since this comment was written
  // you can remove this code, cheers
  if (
    query.position &&
    'version' in query &&
    typeof query.version === 'string' &&
    query.position?.length === 1 &&
    !Number.isNaN(Number(query.position[0]))
  ) {
    const deprecatedPositionId = Number(query.position[0])
    const networkId = getNetworkByName(query.networkOrProduct as unknown as NetworkNames).id
    return {
      props: {
        deprecatedPositionId,
        networkId,
        isDeprecatedUrl: true,
        protocol: {
          v3: LendingProtocol.SparkV3,
        }[query.version] as SparkLendingProtocol | undefined,
      },
    }
  }
  return getOmniServerSideProps({ locale, protocol: LendingProtocol.SparkV3, query, settings })
}
