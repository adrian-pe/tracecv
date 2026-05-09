export type BlockchainAnchorRequest = {
  hash: string
  profileId?: string
  schemaVersion?: string
}

export type BlockchainAnchorReceipt = {
  provider: string
  transactionId: string
  anchoredAt: string
}

export async function anchorProfileSnapshotHash(_request: BlockchainAnchorRequest): Promise<BlockchainAnchorReceipt> {
  throw new Error("Blockchain anchor provider is not configured yet. Publish only non-reversible hashes or identifiers on-chain.")
}
