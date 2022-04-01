import { MagicLinkConnector, NetworkName } from '@oasisdex/connectors'
import { getNetworkId, Web3Context } from '@oasisdex/web3-context'
import { networksById } from 'blockchain/config'
import { EMAIL_REGEX } from 'helpers/constants'
import { identity, merge, Observable, of, Subject } from 'rxjs'
import { first, map, scan, tap } from 'rxjs/operators'

import curry from 'ramda/src/curry'

export function getMagicLinkKey(network: number) {
  return networksById[network.toString()].magicLink.apiKey
}

export type MagicLinkMessage = {
  kind: 'emailIsInvalid'
}

type EmailChange = {
  kind: 'email'
  email: string
}

type MagicLinkChange = EmailChange

export interface MagicLinkFormState {
  messages: MagicLinkMessage[]
  email: string
  login?: () => void
  change: (change: MagicLinkChange) => void
}

function applyChange(state: MagicLinkFormState, change: MagicLinkChange): MagicLinkFormState {
  if (change.kind === 'email') {
    return { ...state, email: change.email }
  }

  return state
}

function validate(state: MagicLinkFormState): MagicLinkFormState {
  const { email } = state
  const messages: MagicLinkMessage[] = []

  if (email && !EMAIL_REGEX.test(email)) {
    messages[messages.length] = { kind: 'emailIsInvalid' }
  }

  return { ...state, messages }
}

function connect(web3Context$: Observable<Web3Context>, email: string) {
  web3Context$
    .pipe(
      first(),
      tap((web3Context) => {
        if (web3Context.status === 'notConnected' || web3Context.status === 'connectedReadonly') {
          const networkId = getNetworkId()

          web3Context.connect(
            new MagicLinkConnector({
              apiKey: getMagicLinkKey(networkId),
              chainId: networkId,
              network: (networksById[networkId].name as any) as NetworkName,
              email,
            }),
            'magicLink',
          )
        }
      }),
    )
    .subscribe(identity)
}

function addTransitions(
  web3Context$: Observable<Web3Context>,
  change: (change: MagicLinkChange) => void,
  state: MagicLinkFormState,
): MagicLinkFormState {
  const { messages, email } = state

  if (email && messages.length === 0) {
    return {
      ...state,
      login: () => connect(web3Context$, email),
    }
  }

  return state
}

export function createMagicLinkConnect$(
  web3Context$: Observable<Web3Context>,
): Observable<MagicLinkFormState> {
  const change$ = new Subject<MagicLinkChange>()
  function change(ch: MagicLinkChange) {
    change$.next(ch)
  }

  const initialState: MagicLinkFormState = {
    email: '',
    messages: [],
    change,
  }

  return merge(change$, of({ kind: 'email', email: '' })).pipe(
    scan(applyChange, initialState),
    map(validate),
    map(curry(addTransitions)(web3Context$, change)),
  )
}
