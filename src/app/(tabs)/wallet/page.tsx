'use client'

import { WalletBindingButton, WalletList } from '@/domains/wallet/client'
import { BridgeIssueCard } from '@/domains/bridge/client'

export default function WalletPage() {
  return (
    <div className="py-8 space-y-6">
      <WalletList />
      <WalletBindingButton />
      <BridgeIssueCard />
    </div>
  )
}
