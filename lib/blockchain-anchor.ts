import { anchorHashOnStellar, isStellarAnchoringConfigured } from "@/lib/stellar"

export type BlockchainAnchorRequest = {
  hash: string
  profileId?: string
  schemaVersion?: string
}

export type BlockchainAnchorReceipt = {
  provider: "stellar"
  profileHash: string
  hash: string
  transactionId: string
  transactionHash: string
  network: string
  explorerUrl: string | null
  anchoredAt: string
  verifiedAt: string
}

export function isBlockchainAnchorConfigured() {
  return isStellarAnchoringConfigured()
}

export async function anchorProfileSnapshotHash({ hash }: BlockchainAnchorRequest): Promise<BlockchainAnchorReceipt> {
  const receipt = await anchorHashOnStellar(hash)

  return {
    provider: "stellar",
    profileHash: receipt.hash,
    hash: receipt.hash,
    transactionId: receipt.transactionHash,
    transactionHash: receipt.transactionHash,
    network: receipt.network,
    explorerUrl: receipt.explorerUrl,
    anchoredAt: receipt.verifiedAt,
    verifiedAt: receipt.verifiedAt
  }
}
