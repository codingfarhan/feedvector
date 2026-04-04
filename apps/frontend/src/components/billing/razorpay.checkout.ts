"use client"

type RazorpaySuccessPayload = {
  razorpay_payment_id: string
  razorpay_subscription_id: string
  razorpay_signature: string
}

type OpenRazorpayParams = {
  keyId: string
  subscriptionId: string
  amount?: number
  currency?: string
  name?: string
  description?: string
  prefill?: { name?: string; email?: string }
  onSuccess: (payload: { paymentId: string; subscriptionId: string; signature: string }) => Promise<void> | void
}

declare global {
  interface Window {
    Razorpay?: any
  }
}

const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js"

export const loadRazorpay = () => {
  return new Promise<boolean>((resolve) => {
    if (typeof window === "undefined") return resolve(false)
    if (window.Razorpay) return resolve(true)
    const script = document.createElement("script")
    script.src = RAZORPAY_SRC
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export const openRazorpayCheckout = async (params: OpenRazorpayParams) => {
  const {
    keyId,
    subscriptionId,
    amount,
    currency,
    name,
    description,
    prefill,
    onSuccess,
  } = params

  const ok = await loadRazorpay()
  if (!ok || !window.Razorpay) {
    throw new Error("Razorpay SDK failed to load")
  }

  const rzp = new window.Razorpay({
    key: keyId,
    subscription_id: subscriptionId,
    name: name || "FeedVector",
    description: description || "Pro Plan",
    currency,
    amount,
    prefill,
    handler: async (response: RazorpaySuccessPayload) => {
      await onSuccess({
        paymentId: response.razorpay_payment_id,
        subscriptionId: response.razorpay_subscription_id,
        signature: response.razorpay_signature,
      })
    },
    modal: {
      ondismiss: () => {},
    },
  })

  rzp.open()
}
