import 'server-only'

import type { SiweChallenge } from '../types'

export async function insertChallenge(_data: {
  human_id: string
  address: string
  nonce: string
  issued_at: string
  expiration_time: string
}): Promise<SiweChallenge> {
  throw new Error('insertChallenge not implemented')
}

export async function findChallengeByNonce(
  _nonce: string
): Promise<SiweChallenge | null> {
  throw new Error('findChallengeByNonce not implemented')
}

export async function markChallengeUsed(_id: string): Promise<void> {
  throw new Error('markChallengeUsed not implemented')
}
