import { useMemo, useState } from 'react'
import { AddOutline } from 'antd-mobile-icons'
import {
  CapsuleTabs,
  Divider,
  Empty,
  FloatingBubble,
  List,
  NavBar,
  SwipeAction,
  Tag,
  Toast,
} from 'antd-mobile'
import { useBillingStore } from './store/billingStore'
import type { BillRecord, TradeDirection } from './types'
import BillForm from './components/BillForm'
import './App.css'

function getYearMonth(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function Section({ title, items, onEdit, onDelete }: {
  title: string
  items: BillRecord[]
  onEdit: (record: BillRecord) => void
  onDelete: (id: string) => void
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <Tag color="primary" fill="outline">{title}</Tag>
        <span style={{ color: 'var(--adm-color-weak)' }}>共 {items.length} 条</span>
      </div>
      {items.length === 0 ? (
        <Empty description="暂无数据" style={{ padding: '16px 0' }} />
      ) : (
        <List>
          {items.map((r) => (
            <SwipeAction
              key={r.id}
              rightActions={[
                {
                  key: 'edit',
                  text: '编辑',
                  color: 'primary',
                  onClick: () => onEdit(r),
                },
                {
                  key: 'delete',
                  text: '删除',
                  color: 'danger',
                  onClick: () => onDelete(r.id),
                },
              ]}
            >
              <List.Item
                description={`金额：¥${r.amount.toLocaleString()}`}
              >
                {r.partnerName}
              </List.Item>
            </SwipeAction>
          ))}
        </List>
      )}
    </div>
  )
}

function App() {
  const [selectedMonth, setSelectedMonth] = useState<string>(getYearMonth(new Date()))
  const [tab, setTab] = useState<'all' | TradeDirection>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<BillRecord | null>(null)

  const upsertRecord = useBillingStore((s) => s.upsertRecord)
  const deleteRecord = useBillingStore((s) => s.deleteRecord)
  const getRecordsByMonth = useBillingStore((s) => s.getRecordsByMonth)
  const getMonthTotals = useBillingStore((s) => s.getMonthTotals)

  const records = getRecordsByMonth(selectedMonth)

  const upstreamRecords = useMemo(() => records.filter((r) => r.direction === 'upstream'), [records])
  const downstreamRecords = useMemo(() => records.filter((r) => r.direction === 'downstream'), [records])
  const totals = getMonthTotals(selectedMonth)

  const handleAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleEdit = (r: BillRecord) => {
    setEditing(r)
    setFormOpen(true)
  }

  const handleSubmit = (payload: Parameters<typeof upsertRecord>[0]) => {
    upsertRecord(payload)
    Toast.show({ content: payload.id ? '修改成功' : '新增成功' })
  }

  const handleDelete = (id: string) => {
    deleteRecord(id)
    Toast.show({ content: '已删除' })
  }

  const MonthPicker = (
    <input
      type="month"
      value={selectedMonth}
      onChange={(e) => setSelectedMonth(e.target.value)}
      style={{ fontSize: 16 }}
    />
  )

  return (
    <div>
      <NavBar back={null} right={MonthPicker}>
        月度往来账单
      </NavBar>

      <div style={{ padding: 12 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <Tag color="success">上游：¥{totals.upstreamTotal.toLocaleString()}</Tag>
          <Tag color="warning">下游：¥{totals.downstreamTotal.toLocaleString()}</Tag>
        </div>

        <CapsuleTabs activeKey={tab} onChange={(k) => setTab(k as any)}>
          <CapsuleTabs.Tab title="全部" key="all">
            <Section title="上游" items={upstreamRecords} onEdit={handleEdit} onDelete={handleDelete} />
            <Divider />
            <Section title="下游" items={downstreamRecords} onEdit={handleEdit} onDelete={handleDelete} />
          </CapsuleTabs.Tab>
          <CapsuleTabs.Tab title="仅上游" key="upstream">
            <Section title="上游" items={upstreamRecords} onEdit={handleEdit} onDelete={handleDelete} />
          </CapsuleTabs.Tab>
          <CapsuleTabs.Tab title="仅下游" key="downstream">
            <Section title="下游" items={downstreamRecords} onEdit={handleEdit} onDelete={handleDelete} />
          </CapsuleTabs.Tab>
        </CapsuleTabs>
      </div>

      <FloatingBubble
        axis="y"
        style={{ '--initial-position-bottom': '80px', '--initial-position-right': '16px' } as any}
        onClick={handleAdd}
      >
        <AddOutline fontSize={24} />
      </FloatingBubble>

      <BillForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editing}
      />
    </div>
  )
}

export default App
