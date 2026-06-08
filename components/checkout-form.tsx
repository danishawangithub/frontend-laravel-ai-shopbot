'use client'

import { useState } from 'react'
import { CheckoutData } from '@/lib/types'

interface CheckoutFormProps {
  onSubmit: (data: CheckoutData) => void
  isLoading?: boolean
}

type FormErrors = Partial<Record<keyof CheckoutData, string>>

export default function CheckoutForm({ onSubmit, isLoading = false }: CheckoutFormProps) {
  const [formData, setFormData] = useState<CheckoutData>({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    agreeToTerms: false,
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    const email = formData.email.trim()
    if (!email) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter a valid email address'
    if (!formData.phone.trim() || formData.phone.length < 10) newErrors.phone = 'Enter a valid phone number'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const isCheckbox = type === 'checkbox'
    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }))
    if (errors[name as keyof CheckoutData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) onSubmit(formData)
  }

  const inputClass = (field: keyof CheckoutData) =>
    `w-full px-4 py-2 border rounded text-foreground placeholder:text-muted-foreground transition ${
      errors[field] ? 'border-destructive' : 'border-border focus:border-primary'
    } focus:outline-none`

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Full Name *</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" className={inputClass('name')} />
        {errors.name ? <p className="text-sm text-destructive mt-1">{errors.name}</p> : null}
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className={inputClass('email')}
        />
        {errors.email ? <p className="text-sm text-destructive mt-1">{errors.email}</p> : null}
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Phone Number *</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="03001234567"
          className={inputClass('phone')}
        />
        {errors.phone ? <p className="text-sm text-destructive mt-1">{errors.phone}</p> : null}
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">City *</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          placeholder="e.g., Karachi, Lahore"
          className={inputClass('city')}
        />
        {errors.city ? <p className="text-sm text-destructive mt-1">{errors.city}</p> : null}
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">Delivery Address *</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter your complete delivery address"
          rows={3}
          className={`${inputClass('address')} resize-none`}
        />
        {errors.address ? <p className="text-sm text-destructive mt-1">{errors.address}</p> : null}
      </div>

      <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded">
        <input
          type="checkbox"
          name="agreeToTerms"
          id="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={handleChange}
          className="mt-1 w-4 h-4 rounded border border-border cursor-pointer"
        />
        <label htmlFor="agreeToTerms" className="text-sm text-foreground cursor-pointer">
          I agree to the terms and conditions and understand that orders are subject to our 7-day
          exchange policy. *
        </label>
      </div>
      {errors.agreeToTerms ? (
        <p className="text-sm text-destructive -mt-3">{errors.agreeToTerms}</p>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-primary text-primary-foreground rounded font-semibold hover:opacity-90 transition disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Place Order (Cash on Delivery)'}
      </button>

      <p className="text-xs text-muted-foreground text-center">
        You will receive a call to confirm your order after submission.
      </p>
    </form>
  )
}
