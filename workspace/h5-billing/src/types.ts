export type TradeDirection = 'upstream' | 'downstream'

export interface BillRecord {
  id: string
  month: string // format: YYYY-MM
  partnerName: string
  direction: TradeDirection
  amount: number
  createdAt: number
  updatedAt: number
}

export interface MonthSummary {
  month: string
  upstreamTotal: number
  downstreamTotal: number
  records: BillRecord[]
}