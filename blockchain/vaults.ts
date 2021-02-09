import BigNumber from 'bignumber.js'
import { call } from 'blockchain/calls/callsHelpers'
import { ContextConnected } from 'blockchain/network'
import { zero } from 'helpers/zero'
import { combineLatest, Observable, of } from 'rxjs'
import { mergeMap, shareReplay, switchMap } from 'rxjs/operators'

import { cdpManagerIlks, cdpManagerOwner, cdpManagerUrns } from './calls/cdpManager'
import { getCdps } from './calls/getCdps'
import { CallObservable } from './calls/observe'
import { vatGem, vatUrns } from './calls/vat'
import { IlkData } from './ilks'

export function createVaults$(
  context$: Observable<ContextConnected>,
  proxyAddress$: (address: string) => Observable<string | undefined>,
  vault$: (id: BigNumber) => Observable<Vault>,
  address: string,
): Observable<Vault[]> {
  return combineLatest(context$, proxyAddress$(address)).pipe(
    switchMap(([context, proxyAddress]) => {
      if (!proxyAddress) return of([])
      return call(
        context,
        getCdps,
      )({ proxyAddress, descending: true }).pipe(
        switchMap(({ ids }) =>
          ids.length === 0
            ? of([])
            : combineLatest(ids.map((id) => vault$(new BigNumber(id)).pipe())),
        ),
      )
    }),
    shareReplay(1),
  )
}

export interface Vault {
  /*
   * The "Vault.id" is recorded in a list in the cdpManager contract.
   * On creation (open) of a vault using the cdpManager contract, two
   * actions occur:
   *
   * 1) a new id is generated from the cdpManager.cdpi variable, a counter
   * variable which increments on each creation of a vault.
   * 2) an UrnHandler contract is created which is a used as a memory location
   * for the Urn struct in the Vat contract.
   *
   * After these two actions, three mappings are instantiated:
   * - urns :: id => urnHandler
   * - owns :: id => address
   * - ilks :: id => ilk
   *
   */
  id: string

  /*
   * As mentioned in Vault.id, the "Vault.owner" is found in the cdpManager.owns
   * mapping. It requires just an address but for the majority of cases will
   * be an address for a proxy contract created by an oasis borrow user.
   *
   * The owner here is the controller of the vault through the cdpManager
   */
  owner: string

  /*
   * The "Vault.controller" is the assumed address of the user. It can be found
   * by calling "owner()" in a deployed instance of a DSProxy contract.
   * Assuming again the majority of cases, the oasis borrow's user address
   * should match the address found by calling DSProxy.owner at address
   * Vault.owner.
   */
  controller: string // address of owner of proxy which controls the vault

  /*
   * A "Vault.token" is referred to as a "gem" in the core contracts. The gems
   * are the series of tokens which are valid collateral tokens.
   */
  token: string

  /*
   * The "Vault.ilk" is also called "ilk" in the core contracts. We can
   * name it more generally as the "collateral type" as each has it's own set
   * of parameters or characteristics, e.g
   * - ETH-A, gem is ETH, Stability Fee is 2.5%, ...
   * - ETH-B, gem is ETH, Stability Fee is 5% ...
   * - WBTC-A, gem is WBTC, Stability Fee is 4.5% ...
   */
  ilk: string

  /*
   * The "Vault.address" is as mentioned in Vault.id, an address for the
   * UrnHandler contract which is a storage location in memory for the Urn
   * struct contained in the Vat contract. The struct contains two variables,
   * the ink and the art.
   */
  address: string

  /*
   * The "Vault.collateral" is called the "ink" in the core contracts.
   * It is a record of the (wad) amount of collateral tokens (gems) "locked"
   * in the Vat.
   *
   * To be specific, there can be ambiguity in terms of what is meant by
   * "locked".
   * The deposit process in the protocol as done by the cdpManager which
   * this frontend uses is done in two actions via dssProxyActions.lock(Eth|Gem)
   *
   * 1) The user executes a function "join" on the relevant join adapter to
   * transfer the collateral token amount from the users wallet into the Vat.
   * The actual tokens will reside on the adapter but are recorded as a wad
   * amount in the Vat.gems[ilk][owner], owner being the users proxy.
   *
   * 2) The user executes Vat.frob which specifically "locks" the collateral
   * into the system by subtracting the amount from Vat.gems[ilk][usr] and
   * adding it to Vat.urns[ilk][urn].ink
   *
   * We classify the token amounts in both cases as "unencumbered collateral"
   * and "encumbered" collateral.
   *
   * - unencumbered :: where the collateral is only "joined" to the vat. It is
   * not backing any DAI at this point and cannot be seized in the liquidation
   * process, "unlocked"
   * - encumbered :: where the collateral has been "frobbed" and is recorded
   * as the Urn.ink amount. It is backing DAI at this point and will be seized
   * in the event of a liquidation process. "locked"
   *
   * In terms of this type, Vault.collateral, we are specifying the latter
   * "encumbered collateral"
   */
  collateral: BigNumber

  /*
   * "Vault.unlockedCollateral" references the amount of unencumbered collateral
   * as mentioned in Vault.collateral
   *
   * Necessary for functionality to reclaim leftover collateral on the adapter
   */
  unlockedCollateral: BigNumber

  /*
   * "Vault.collateralPrice" is the value of the collateral denominated in USD
   * locked in a vault
   */
  collateralPrice: BigNumber

  /*
   * "Vault.backingCollateral" is the minimum amount of collateral which
   * must be locked in the vault given the current amount of debt.
   * "minSafeCollateralAmount"
   */
  backingCollateral: BigNumber

  /*
   * "Vault.backingCollateralPrice" is the minimum amount of collateral in USD
   * which must be locked in the vault given the current amount of debt.
   */
  backingCollateralPrice: BigNumber

  /*
   * "Vault.freeCollateral" is the amount of collateral that can be
   * withdrawn from a vault without being liquidated
   */
  freeCollateral: BigNumber

  /*
   * "Vault.freeCollateralPrice" is the amount of collateral in USD that
   * can be withdrawn from a vault without being liquidated
   */
  freeCollateralPrice: BigNumber

  /*
   * The "Vault.debt" represents an amount of "internal DAI" generated through a
   * vault. It is a function of two values contained in the Vat:
   *
   * Vat.ilks[ilk].rate - "debtScalingFactor", this is a value which is used to
   * compute the stability fees for each vault of a certain collateral type.
   * It is updated via the Jug.drip function which is executed each time DAI
   * is withdrawn from the Vat through proxyActions.
   *
   * Vat.urns[ilk][urn].art - "normalized debt", see Vault.normalizedDebt
   *
   * The calculation then is:
   *
   * debt = normalizedDebt * debtScalingFactor
   *
   * Note: "Vault.debt" in this context is like the "Vault.collateral" and
   * only represents a record of the "internal DAI" within the system. All DAI
   * exists as "internal DAI", a recorded amount of debt in the system.
   * It becomes it's tokenised form when it is minted through executing exit
   * on the daiJoin adapter
   */
  debt: BigNumber

  /*
   * The "Vault.normalizedDebt" is called the "art" (lowercase) in the core
   * contracts and is recorded alongside the "ink" in the Urn struct.
   *
   * It is used in combination with the Vat.ilks[ilk].rate (debtScalingFactor) to
   * calculate the amount of debt generated by this vault.
   */
  normalizedDebt: BigNumber

  /*
   * "Vault.availableDebt" is the maximum amount of debt denominated in DAI a
   * vault can generate without being liquidated
   */
  availableDebt: BigNumber

  /*
   * "Vault.globalDebtAvailable" is the maximum amount of debt available to
   * generate that does not break the debt ceiling for that ilk
   */
  availableIlkDebt: BigNumber

  /*
   * Vault.liquidationRatio is found in Spot.ilks[ilk].mat, if the
   * collateralizationRatio is lower than this value then the vault is deemed
   * to be at risk of liquidation
   */
  liquidationRatio: BigNumber

  /*
   * "Vault.collateralizationRatio" is the ratio of the collateralPrice in USD
   * to the amount of debt in USD. A value less then liquidationRatio means that
   * the vault is at risk of being liquidated.
   */
  collateralizationRatio: BigNumber | undefined

  /*
   * "Vault.tokenOraclePrice" is the USD value of 1 unit of Vault.token as calculated
   * by the Maker Protocol;
   *
   * It can be computed by multiplying three values:
   *
   * Vat.ilks[ilk].spot - maxDebtPerUnitCollateral, sometimes called
   * "priceWithSafetyMargin", this is the maximum amount of DAI that can be
   * generated per unit token of that ilk.
   * Spot.par - daiPrice, The ratio of DAI to the reference asset, it being USD
   * Spot.ilks[ilk].mat - See Vault.liquidationRatio
   *
   * tokenPrice = daiPrice * maxDebtPerUnitCollateral * liquidationRatio
   */
  tokenOraclePrice: BigNumber

  /*
   * "Vault.liquidationPrice" is the price of the collateral of a vault
   * in USD if the Vault.collateralizationRatio is equal to the
   * Vault.liquidationRatio
   */
  liquidationPrice: BigNumber | undefined

  /*
   * "Vault.liquidationPenalty" is used if a vault is liquidated, the penalty
   * is applied after a portion of the collateral in a vault is sold to
   * pay back the outstanding debt. This percentage penalty is then applied
   * on the remaining collateral.
   */
  liquidationPenalty: BigNumber

  /*
   * "Vault.stabilityFee" is the annual percentage rate of interest that
   * accumulates over time for the amount of debt issued by a vault
   */
  stabilityFee: BigNumber

  /*
   * "Vault.debtFloor" is the minimum amount of debt that can be issued by
   * a vault. The reasons for this is that it becomes inefficient to liquidate
   * vaults if the amount collateral backing the debt does not cover the gas
   * required
   */
  debtFloor: BigNumber
}

/*
 * TODO Determine if "controller" is best name for
 * communicating relationship of
 * id -> cdpManager.owns -> DsProxy(owner) -> controller/externalAddress/user
 *
 * Assumption breaks the vault in question uses a different cdpManager or if
 * the vault has been given away
 */
export function createController$(
  proxyOwner$: (proxyAddress: string) => Observable<string | undefined>,
  cdpManagerOwner$: CallObservable<typeof cdpManagerOwner>,
  id: BigNumber,
) {
  return cdpManagerOwner$(id).pipe(mergeMap((owner) => proxyOwner$(owner)))
}

export function createVault$(
  cdpManagerUrns$: CallObservable<typeof cdpManagerUrns>,
  cdpManagerIlks$: CallObservable<typeof cdpManagerIlks>,
  cdpManagerOwner$: CallObservable<typeof cdpManagerOwner>,
  vatUrns$: CallObservable<typeof vatUrns>,
  vatGem$: CallObservable<typeof vatGem>,
  ilkData$: (ilk: string) => Observable<IlkData>,
  tokenOraclePrice$: (ilk: string) => Observable<BigNumber>,
  controller$: (id: BigNumber) => Observable<string | undefined>,
  ilkToToken$: Observable<(ilk: string) => string>,
  id: BigNumber,
): Observable<Vault> {
  return combineLatest(
    cdpManagerUrns$(id),
    cdpManagerIlks$(id),
    cdpManagerOwner$(id),
    controller$(id),
    ilkToToken$
  ).pipe(
    switchMap(([urnAddress, ilk, owner, controller, ilkToToken]) => {
      const token = ilkToToken(ilk)
      return combineLatest(
        vatUrns$({ ilk, urnAddress }),
        vatGem$({ ilk, urnAddress }),
        tokenOraclePrice$(ilk),
        ilkData$(ilk),
      ).pipe(
        switchMap(
          ([
            { collateral, normalizedDebt },
            unlockedCollateral,
            tokenOraclePrice,
            {
              normalizedIlkDebt,
              debtFloor,
              debtScalingFactor,
              debtCeiling,
              liquidationRatio,
              stabilityFee,
              liquidationPenalty,
            },
          ]) => {
            const collateralPrice = collateral.times(tokenOraclePrice)
            const debt = debtScalingFactor.times(normalizedDebt)
            const ilkDebt = debtScalingFactor.times(normalizedIlkDebt)

            const backingCollateral = debt.times(liquidationRatio).div(tokenOraclePrice)
            const freeCollateral = backingCollateral.gt(collateral)
              ? zero
              : collateral.minus(backingCollateral)

            const backingCollateralPrice = backingCollateral.div(tokenOraclePrice)
            const freeCollateralPrice = freeCollateral.div(tokenOraclePrice)
            const collateralizationRatio = debt.eq(zero) ? undefined : collateralPrice.div(debt)

            const maxAvailableDebt = collateralPrice.div(liquidationRatio)
            const availableDebt = debt.lt(maxAvailableDebt) ? maxAvailableDebt.minus(debt) : zero
            const availableIlkDebt = debtCeiling.minus(ilkDebt)

            const liquidationPrice = collateral.eq(zero)
              ? undefined
              : debt.times(liquidationRatio).div(collateral)

            return of({
              id: id.toString(),
              ilk,
              token,
              address: urnAddress,
              owner,
              controller,
              collateral,
              unlockedCollateral,
              collateralPrice,
              backingCollateral,
              backingCollateralPrice,
              freeCollateral,
              freeCollateralPrice,
              normalizedDebt,
              collateralizationRatio,
              debt,
              availableDebt,
              availableIlkDebt,
              debtFloor,
              stabilityFee,
              liquidationPrice,
              liquidationRatio,
              liquidationPenalty,
              tokenOraclePrice,
            })
          },
        ),
      )
    }),
    shareReplay(1),
  )
}
