'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminPutProductVariants } from '@/lib/admin-services'
import type { ProductVariantInput, ProductVariantRow } from '@/lib/admin-api-types'

const DEFAULT_STITCHED: ProductVariantInput[] = [
  { size: 'S', stock_qty: 0 },
  { size: 'M', stock_qty: 0 },
  { size: 'L', stock_qty: 0 },
]

function fromApi(rows: ProductVariantRow[] | undefined | null): ProductVariantInput[] {
  if (!rows?.length) return DEFAULT_STITCHED.map((r) => ({ ...r }))
  return rows.map((r) => ({
    size: String(r.size),
    stock_qty: Number(r.stock_qty) || 0,
    label: r.label ? String(r.label) : undefined,
    color: r.color ? String(r.color) : undefined,
    sku: r.sku ? String(r.sku) : undefined,
  }))
}

type Props = {
  token: string
  productId: number
  /** When false, panel is hidden (category slug does not include `stitched`). */
  enabled: boolean
  initialVariants?: ProductVariantRow[] | null
}

export function ProductVariantsPanel({ token, productId, enabled, initialVariants }: Props) {
  const [rows, setRows] = useState<ProductVariantInput[]>(() => fromApi(initialVariants))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!enabled) return
    setRows(fromApi(initialVariants))
  }, [enabled, initialVariants])

  if (!enabled) return null

  function updateRow(i: number, patch: Partial<ProductVariantInput>) {
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  }

  function addRow() {
    setRows((prev) => [...prev, { size: '', stock_qty: 0 }])
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, j) => j !== i))
  }

  async function save() {
    const cleaned = rows
      .map((r) => ({
        ...r,
        size: r.size.trim(),
        stock_qty: Math.max(0, Math.floor(Number(r.stock_qty) || 0)),
      }))
      .filter((r) => r.size.length > 0)

    setSaving(true)
    try {
      await adminPutProductVariants(token, productId, cleaned)
      toast.success('Variants saved')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save variants')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Sizes & stock (stitched)</h2>
        <p className="text-sm text-muted-foreground mt-1">
          This category is stitched — manage S/M/L or custom rows. Saving replaces all variant rows on the server
          (empty list clears variants).
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30 text-left">
              <th className="px-2 py-2 font-semibold">Size *</th>
              <th className="px-2 py-2 font-semibold">Stock</th>
              <th className="px-2 py-2 font-semibold">Label</th>
              <th className="px-2 py-2 font-semibold">Color</th>
              <th className="px-2 py-2 font-semibold">SKU</th>
              <th className="px-2 py-2 w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border">
                <td className="px-2 py-2">
                  <Input
                    value={row.size}
                    onChange={(e) => updateRow(i, { size: e.target.value })}
                    placeholder="S"
                  />
                </td>
                <td className="px-2 py-2 w-24">
                  <Input
                    type="number"
                    min={0}
                    value={row.stock_qty}
                    onChange={(e) => updateRow(i, { stock_qty: Number(e.target.value) })}
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    value={row.label ?? ''}
                    onChange={(e) => updateRow(i, { label: e.target.value || undefined })}
                    placeholder="—"
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    value={row.color ?? ''}
                    onChange={(e) => updateRow(i, { color: e.target.value || undefined })}
                    placeholder="—"
                  />
                </td>
                <td className="px-2 py-2">
                  <Input
                    value={row.sku ?? ''}
                    onChange={(e) => updateRow(i, { sku: e.target.value || undefined })}
                    placeholder="—"
                  />
                </td>
                <td className="px-2 py-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeRow(i)}>
                    ✕
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          Add row
        </Button>
        <Button type="button" onClick={() => void save()} disabled={saving}>
          {saving ? 'Saving…' : 'Save variants'}
        </Button>
      </div>
    </div>
  )
}
