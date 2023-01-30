export const FOLLOWED_VAULTS_LIMIT_REACHED_CHANGE = 'FOLLOWED_VAULTS_LIMIT_REACHED_CHANGE'

export type FollowedVaultsLimitReachedChangeAction = {
  type: 'followed-vaults-limit-reached-change'
  isLimitReached: boolean
}

export interface FollowedVaultsLimitReachedChange {
  isLimitReached: boolean
}

export function followedVaultsLimitReachedChangeReducer(
  state: FollowedVaultsLimitReachedChange,
  action: FollowedVaultsLimitReachedChangeAction,
): FollowedVaultsLimitReachedChange {
  switch (action.type) {
    case 'followed-vaults-limit-reached-change':
      return { ...state, isLimitReached: action.isLimitReached }
    default:
      return state
  }
}
