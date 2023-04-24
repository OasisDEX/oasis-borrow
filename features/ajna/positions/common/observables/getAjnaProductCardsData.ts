import { getNetworkContracts } from 'blockchain/contracts'
import { Context } from 'blockchain/network'
import { productCardsAjna } from 'features/ajna/common/content'
import { AjnaProductCardsData, AlternateProductCardBase } from 'features/ajna/common/types'
import { Observable } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'

interface ReducedTokens {
  [key: string]: string[]
}

interface ReducedPairs {
  borrow: ReducedTokens
  earn: ReducedTokens
}

const getMappedPairs = ({
  data,
  reducedTokens,
}: {
  data: AlternateProductCardBase[]
  reducedTokens: ReducedTokens
}) =>
  data
    .filter((card) => Object.keys(reducedTokens).includes(card.token))
    .map((card) => ({
      ...card,
      computed: {
        tokens: reducedTokens[card.token],
      },
    }))

export function getAjnaProductCardsData$(
  context$: Observable<Context>,
  once$: Observable<undefined>,
): Observable<AjnaProductCardsData> {
  return context$.pipe(
    switchMap((context) => {
      const pairs = Object.keys(getNetworkContracts(context.chainId).ajnaPoolPairs)
      const reducedTokensPerProduct = pairs.reduce(
        (acc, curr) => {
          const tokens = curr.split('-')
          return {
            ...acc,
            borrow: { ...acc.borrow, [tokens[0]]: [...(acc.borrow[tokens[0]] || []), tokens[1]] },
            earn: { ...acc.earn, [tokens[1]]: [...(acc.earn[tokens[1]] || []), tokens[0]] },
          }
        },
        { borrow: {}, earn: {} } as ReducedPairs,
      )

      const borrowCards = getMappedPairs({
        data: productCardsAjna.borrow,
        reducedTokens: reducedTokensPerProduct.borrow,
      })

      const earnCards = getMappedPairs({
        data: productCardsAjna.earn,
        reducedTokens: reducedTokensPerProduct.earn,
      })

      return once$.pipe(
        map(() => ({
          borrowCards,
          earnCards,
          // TODO provide proper multiply cards once available
          multiplyCards: [],
        })),
        shareReplay(1),
      )
    }),
  )
}
