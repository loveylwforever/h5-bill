import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BillRecord } from '../types'
import { nanoid } from 'nanoid'

interface BillingState {
  records: BillRecord[]
  upsertRecord: (data: Omit<BillRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => BillRecord
  deleteRecord: (id: string) => void
  getRecordsByMonth: (month: string) => BillRecord[]
  getMonthTotals: (month: string) => { upstreamTotal: number; downstreamTotal: number }
}

export const useBillingStore = create<BillingState>()(
  persist(
    (set, get) => ({
      records: generateInitialData(),
      upsertRecord: (data) => {
        const now = Date.now()
        if (data.id) {
          set((state) => ({
            records: state.records.map((r) => (r.id === data.id ? { ...r, ...data, updatedAt: now } : r)),
          }))
          return get().records.find((r) => r.id === data.id) as BillRecord
        }
        const newRecord: BillRecord = {
          id: nanoid(12),
          month: data.month,
          partnerName: data.partnerName,
          direction: data.direction,
          amount: data.amount,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({ records: [newRecord, ...state.records] }))
        return newRecord
      },
      deleteRecord: (id) => set((state) => ({ records: state.records.filter((r) => r.id !== id) })),
      getRecordsByMonth: (month) => get().records.filter((r) => r.month === month),
      getMonthTotals: (month) => {
        const monthRecords = get().records.filter((r) => r.month === month)
        const upstreamTotal = monthRecords
          .filter((r) => r.direction === 'upstream')
          .reduce((sum, r) => sum + r.amount, 0)
        const downstreamTotal = monthRecords
          .filter((r) => r.direction === 'downstream')
          .reduce((sum, r) => sum + r.amount, 0)
        return { upstreamTotal, downstreamTotal }
      },
    }),
    {
      name: 'h5-billing-store',
      version: 1,
      partialize: (state) => ({ records: state.records }),
    },
  ),
)

function formatYearMonth(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function generateInitialData(): BillRecord[] {
  const now = new Date()
  const thisMonth = formatYearMonth(now)
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonth = formatYearMonth(lastMonthDate)
  const sample: Array<Omit<BillRecord, 'id' | 'createdAt' | 'updatedAt'>> = [
    { month: thisMonth, partnerName: '上游A公司', direction: 'upstream', amount: 120000 },
    { month: thisMonth, partnerName: '下游B公司', direction: 'downstream', amount: 185000 },
    { month: thisMonth, partnerName: '上游C公司', direction: 'upstream', amount: 76000 },
    { month: lastMonth, partnerName: '下游D公司', direction: 'downstream', amount: 99000 },
  ]
  const nowTs = Date.now()
  return sample.map((s) => ({ ...s, id: nanoid(12), createdAt: nowTs, updatedAt: nowTs }))
}