// We still want people who haven't connected a wallet to be able simulate
// the opening a vault. This pipeline is for managing that context. On UI side
// it should offer a redirect to the connect page
//
// Also this is unreachable as it is dependent on the ilks$ which does not work
// in the current readonly context we have taken from casual

import { ContextConnectedReadOnly } from 'blockchain/network'
import { Observable, of } from 'rxjs'

export type OpenVaultReadonlyStage = 'editingReadonly'

export interface OpenVaultReadonlyState {
  stage: OpenVaultReadonlyStage
  token: string
  ilk: string
}

export function createOpenVaultReadonly$(
  context: ContextConnectedReadOnly,
  ilk: string,
  token: string,
): Observable<OpenVaultReadonlyState> {
  return of({
    stage: 'editingReadonly',
    token,
    ilk,
  })
}
