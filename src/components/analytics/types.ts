export interface GroupedTransactionRow {
  platform_name: string
  platform_id: string

  partner_name: string
  partner_id: string

  agent_name: string
  agent_id: string

  merchant_name: string
  merchant_id: string

  vendor_name?: string
  vendor_id?: string

  created_at: string // time.Time → ISO string
  status: string
  process_status: string

  transaction_amount: number
  transaction_final_amount: number
  agent_fee: number
  platform_fee: number

  agent_commission_fee: number
}

export interface GroupedSummary {
  rows: GroupedTransactionRow[]
}

export type FinancialRow = {
  date: string
  platform: string
  agent: string
  merchant: string
  txnCount: number
  txnValue: number
  agentFee: number
  platformFee: number
  amount: number
}
