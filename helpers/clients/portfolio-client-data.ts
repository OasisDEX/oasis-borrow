import type { PortfolioPositionsResponse } from 'handlers/portfolio/types'
import { usePortfolioClient } from 'helpers/clients/portfolio-client'
import type { BlogPostsReply } from 'helpers/types/blog-posts.types'
import { useEffect, useState } from 'react'
import { useFetch } from 'usehooks-ts'

import type {
  PortfolioAssetsResponse,
  PortfolioOverviewResponse,
} from 'lambdas/src/shared/domain-types'

export const usePortfolioClientData = ({
  awsInfraUrl,
  awsInfraHeader,
  address,
  walletAddress,
}: {
  awsInfraUrl: string
  awsInfraHeader: HeadersInit
  address: string
  walletAddress?: string
}) => {
  const isOwner = address === walletAddress
  const portfolioClient = usePortfolioClient(awsInfraUrl, awsInfraHeader)
  const { data: blogPosts } = useFetch<BlogPostsReply>(`/api/blog-posts`)
  const [overviewData, setOverviewData] = useState<PortfolioOverviewResponse>()
  const [portfolioPositionsData, setPortfolioPositionsData] = useState<PortfolioPositionsResponse>()
  const [portfolioWalletData, setPortfolioWalletData] = useState<PortfolioAssetsResponse>()
  const [portfolioConnectedWalletWalletData, setPortfolioConnectedWalletWalletData] =
    useState<PortfolioAssetsResponse>()
  useEffect(() => {
    // clean data
    setOverviewData(undefined)
    setPortfolioPositionsData(undefined)
    setPortfolioWalletData(undefined)
    setPortfolioConnectedWalletWalletData(undefined)
  }, [address])
  useEffect(() => {
    void portfolioClient.fetchPortfolioOverview(address).then((data) => {
      setOverviewData(data)
    })
    void portfolioClient.fetchPortfolioAssets(address).then((data) => {
      setPortfolioWalletData(data)
    })
    void portfolioClient.fetchPortfolioPositions(address).then((data) => {
      setPortfolioPositionsData(data)
    })
  }, [address, portfolioClient])
  useEffect(() => {
    // separate cause connecting wallet made additional calls
    !isOwner &&
      walletAddress &&
      void portfolioClient.fetchPortfolioAssets(walletAddress).then((data) => {
        setPortfolioConnectedWalletWalletData(data)
      })
  }, [isOwner, portfolioClient, walletAddress])
  return {
    overviewData,
    portfolioPositionsData,
    portfolioWalletData,
    portfolioConnectedWalletWalletData,
    blogPosts,
  }
}
