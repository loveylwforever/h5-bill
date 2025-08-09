import { useEffect, useMemo, useState } from 'react'
import { Button, DatePicker, Form, Input, Modal, Radio } from 'antd-mobile'
import type { BillRecord, TradeDirection } from '../types'

export interface BillFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (payload: Omit<BillRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void
  initial?: BillRecord | null
}

function toDateFromYearMonth(ym: string): Date {
  const [y, m] = ym.split('-').map((v) => Number(v))
  return new Date(y, m - 1, 1)
}

function toYearMonth(date?: Date | null): string {
  if (!date) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function BillForm({ open, onClose, onSubmit, initial }: BillFormProps) {
  const [month, setMonth] = useState<Date | null>(initial ? toDateFromYearMonth(initial.month) : new Date())
  const [partnerName, setPartnerName] = useState<string>(initial?.partnerName ?? '')
  const [direction, setDirection] = useState<TradeDirection>(initial?.direction ?? 'upstream')
  const [amount, setAmount] = useState<string>(initial ? String(initial.amount) : '')

  useEffect(() => {
    if (initial) {
      setMonth(toDateFromYearMonth(initial.month))
      setPartnerName(initial.partnerName)
      setDirection(initial.direction)
      setAmount(String(initial.amount))
    } else {
      setMonth(new Date())
      setPartnerName('')
      setDirection('upstream')
      setAmount('')
    }
  }, [initial, open])

  const canSubmit = useMemo(() => {
    return !!month && partnerName.trim().length > 0 && /^\d+(?:\.\d+)?$/.test(amount)
  }, [month, partnerName, amount])

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({
      id: initial?.id,
      month: toYearMonth(month) || '',
      partnerName: partnerName.trim(),
      direction,
      amount: Number(amount),
    })
    onClose()
  }

  return (
    <Modal
      visible={open}
      onClose={onClose}
      showCloseButton
      content={
        <div>
          <Form layout="horizontal">
            <Form.Item label="月份" required>
              <DatePicker
                precision="month"
                value={month ?? undefined}
                onConfirm={(val) => setMonth(val)}
              >
                {(value) => (value ? toYearMonth(value) : '选择月份')}
              </DatePicker>
            </Form.Item>
            <Form.Item label="方向" required>
              <Radio.Group value={direction} onChange={(val) => setDirection(val as TradeDirection)}>
                <Radio value="upstream">上游</Radio>
                <Radio value="downstream">下游</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="公司名称" required>
              <Input
                placeholder="请输入往来公司名称"
                value={partnerName}
                onChange={setPartnerName}
                clearable
              />
            </Form.Item>
            <Form.Item label="金额(元)" required>
              <Input
                placeholder="请输入金额"
                value={amount}
                onChange={setAmount}
                type="number"
                clearable
              />
            </Form.Item>
          </Form>
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <Button block color="primary" disabled={!canSubmit} onClick={handleSubmit}>
              {initial ? '保存修改' : '新增账单'}
            </Button>
          </div>
        </div>
      }
    />
  )
}

export default BillForm