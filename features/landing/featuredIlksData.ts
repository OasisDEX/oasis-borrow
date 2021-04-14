import { IlkData, IlkDataList } from 'blockchain/ilks'
import { getToken } from 'blockchain/tokensMetadata'
import maxBy from 'lodash/maxBy'
import minBy from 'lodash/minBy'
import { Observable } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'

export interface FeaturedIlk extends IlkData {
  title: string
}
function createFeaturedIlk(
  ilkDataList: IlkDataList,
  selector: (ilks: IlkDataList) => IlkData | undefined,
  title: string,
): FeaturedIlk | undefined {
  const featured = selector(ilkDataList.filter(hasAllMetaInfo))
  if (featured === undefined) {
    return undefined
  }

  return {
    ...featured,
    title,
  }
}
function hasAllMetaInfo(ilk: IlkData) {
  const token = getToken(ilk.token)

  return typeof token.bannerIcon === 'string' && typeof token.background === 'string'
}

export function getNewest(ilks: IlkDataList) {
  return ilks[ilks.length - 1]
}

export function getMostPopular(ilks: IlkDataList) {
  return maxBy(ilks, (ilk) => ilk.ilkDebt)
}

export function getCheapest(ilks: IlkDataList) {
  return minBy(ilks, (ilk) => ilk.stabilityFee.toNumber())
}

export function createFeaturedIlks$(ilkDataList$: Observable<IlkDataList>) {
  return ilkDataList$.pipe(
    map((ilks) =>
      [
        createFeaturedIlk(ilks, getNewest, 'New'),
        createFeaturedIlk(ilks, getMostPopular, 'Most Popular'),
        createFeaturedIlk(ilks, getCheapest, 'Cheapest'),
      ].filter((featured): featured is FeaturedIlk => featured !== undefined),
    ),
  )
}
