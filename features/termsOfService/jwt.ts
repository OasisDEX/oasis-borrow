import SafeAppsSDK from '@gnosis.pm/safe-apps-sdk'
import { getNetworkId } from '@oasisdex/web3-context'
import { decode } from 'jsonwebtoken'
import getConfig from 'next/config'
import { Observable, of } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { fromPromise } from 'rxjs/internal-compatibility'
import { map } from 'rxjs/operators'
import Web3 from 'web3'

const LOCAL_STORAGE_GNOSIS_SAFE_PENDING = 'LOCAL_STORAGE_GNOSIS_SAFE_PENDING'

const basePath = getConfig()?.publicRuntimeConfig.basePath || ''

export type JWToken = string

export function jwtAuthGetToken(address: string): JWToken | undefined {
  const token = localStorage.getItem(`token-b/${address}`)
  if (token && token !== 'xxx') {
    const parsedToken = JSON.parse(atob(token.split('.')[1]))
    // remove old tokens
    if (!parsedToken.chainId) {
      localStorage.removeItem(`token-b/${address}`)
      return undefined
    }
  }
  return token === null ? undefined : token
}

export function jwtAuthSetupToken$(
  web3: Web3,
  account: string,
  isGnosisSafe: boolean,
): Observable<JWToken> {
  const token = jwtAuthGetToken(account)
  if (token === undefined) {
    return fromPromise(requestJWT(web3, account, isGnosisSafe))
  }
  return of(token)
}

interface GnosisSafePendingTransaction {
  dataToSign: string
  safeTxHash: string
}

async function requestJWT(web3: Web3, account: string, isGnosisSafe: boolean): Promise<string> {
  const web3Instance = web3
  const addressForSignature = account

  const challenge = await requestChallenge(account).toPromise()
  const chainId = getNetworkId()

  if (isGnosisSafe) {
    const sdk = new SafeAppsSDK()

    const pendingSignature: GnosisSafePendingTransaction = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_GNOSIS_SAFE_PENDING)!,
    )

    let dataToSign: string
    let safeTxHash: string
    if (pendingSignature) {
      dataToSign = pendingSignature.dataToSign
      safeTxHash = pendingSignature.safeTxHash
    } else {
      dataToSign = getDataToSignFromChallenge(challenge)
      const signatureRequest = await sdk.txs.signMessage(dataToSign)
      safeTxHash = signatureRequest.safeTxHash
      localStorage.setItem(
        LOCAL_STORAGE_GNOSIS_SAFE_PENDING,
        JSON.stringify({
          dataToSign,
          safeTxHash,
        } as GnosisSafePendingTransaction),
      )
    }

    // start polling
    const token = await new Promise<string | null>((resolve) => {
      // eslint-disable-next-line func-style
      let returnValue = (val: string | null) => resolve(val) // CAUTION: this function is reassigned later
      const interval = setInterval(async () => {
        try {
          const { detailedExecutionInfo } = await sdk.txs.getBySafeTxHash(safeTxHash)
          if (
            !(
              detailedExecutionInfo?.type === 'MULTISIG' &&
              detailedExecutionInfo.confirmations.length
            )
          ) {
            throw new Error('GS: not ready')
          }

          const isSigned = await sdk.safe.isMessageSigned(dataToSign)
          if (!isSigned) {
            throw new Error('Not signed yet')
          }

          const safeJwt = await requestSignin({
            challenge,
            signature: '',
            chainId,
            isGnosisSafe: true,
          }).toPromise()

          return returnValue(safeJwt)
        } catch (error) {
          console.log('GS: error occurred', error)
        }
      }, 5 * 1000)

      // clear all scheduled callbacks
      returnValue = (val: string | null) => {
        clearInterval(interval)
        resolve(val)
      }
    })

    if (!token) {
      throw new Error(`GS: failed to sign`)
    }

    localStorage.setItem(`token-b/${account}`, token)
    return token
  }

  const signature = await signTypedPayload(challenge, web3Instance, addressForSignature)
  const jwt = await requestSignin({
    challenge,
    signature,
    chainId,
    isGnosisSafe: false,
  }).toPromise()

  localStorage.setItem(`token-b/${account}`, jwt)

  return jwt
}

async function signTypedPayload(challenge: string, web3: Web3, account: string): Promise<string> {
  const data = getDataToSignFromChallenge(challenge)

  return web3.eth.personal.sign(data, account, '')
}

function requestChallenge(address: string): Observable<string> {
  return ajax({
    url: `/api/auth/challenge`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: { address: address.toLowerCase() },
  }).pipe(map((resp) => resp.response.challenge))
}

function requestSignin({
  signature,
  challenge,
  chainId,
  isGnosisSafe,
}: {
  signature: string
  challenge: string
  chainId: number
  isGnosisSafe: boolean
}): Observable<string> {
  return ajax({
    url: `${basePath}/api/auth/signin`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: { signature, challenge, chainId, isGnosisSafe },
  }).pipe(map((resp) => resp.response.jwt))
}

function getDataToSignFromChallenge(challenge: string): string {
  const decodedChallenge = decode(challenge) as any
  return `Sign to verify your wallet ${decodedChallenge.address} (${decodedChallenge.randomChallenge})`
}
