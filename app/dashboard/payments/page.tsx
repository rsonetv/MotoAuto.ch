"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CreditCard, Building, Wallet } from "lucide-react"
import { toast } from "sonner"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const packages = {
  "private": { name: "Private Seller", price: 0 },
  "dealer-lite": { name: "Dealer Lite", price: 50 },
  "dealer-starter": { name: "Dealer Starter", price: 100 },
  "dealer-pro": { name: "Dealer Pro", price: 300 },
  "dealer-enterprise": { name: "Dealer Enterprise", price: 800 }
}

function PaymentForm() {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const searchParams = useSearchParams()
  const packageId = searchParams.get('package') || 'dealer-lite'
  
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [clientSecret, setClientSecret] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [billingInfo, setBillingInfo] = useState({
    email: '',
    fullName: '',
    cardName: ''
  })

  const selectedPackage = packages[packageId as keyof typeof packages]

  useEffect(() => {
    if (selectedPackage && selectedPackage.price > 0) {
      // Create payment intent
      fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        },
        body: JSON.stringify({
          amount: selectedPackage.price,
          currency: 'chf',
          package_id: packageId,
          payment_type: 'package_subscription'
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.client_secret) {
          setClientSecret(data.client_secret)
        }
      })
      .catch(error => {
        console.error('Error creating payment intent:', error)
        toast.error('Błąd podczas inicjowania płatności')
      })
    }
  }, [packageId, selectedPackage])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    if (!agreedToTerms) {
      toast.error('Musisz zaakceptować regulamin i politykę prywatności')
      return
    }

    setLoading(true)

    try {
      if (selectedPackage.price === 0) {
        // Free package - just redirect to dashboard
        toast.success('Pakiet aktywowany!')
        router.push('/dashboard')
        return
      }

      if (paymentMethod === 'card') {
        const cardElement = elements.getElement(CardElement)
        
        if (!cardElement) {
          throw new Error('Card element not found')
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: billingInfo.cardName,
              email: billingInfo.email
            }
          }
        })

        if (error) {
          throw new Error(error.message)
        }

        if (paymentIntent.status === 'succeeded') {
          toast.success('Płatność zakończona pomyślnie!')
          router.push('/dashboard?payment=success')
        }
      } else {
        // Handle other payment methods (bank transfer, PayPal)
        toast.info('Przekierowanie do wybranej metody płatności...')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Błąd podczas przetwarzania płatności')
    } finally {
      setLoading(false)
    }
  }

  if (!selectedPackage) {
    return <div>Nie znaleziono pakietu</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Podsumowanie zamówienia</CardTitle>
              <CardDescription>
                Finalizuj wybór pakietu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">{selectedPackage.name}</span>
                  <span className="font-bold">{selectedPackage.price} CHF</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Kwota do zapłaty:</span>
                    <span>{selectedPackage.price} CHF</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Dane płatności</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Payment Method Selection */}
                <div>
                  <Label className="text-base font-medium mb-3 block">
                    Metoda płatności
                  </Label>
                  <RadioGroup 
                    value={paymentMethod} 
                    onValueChange={setPaymentMethod}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="card" id="card" />
                      <CreditCard className="h-5 w-5" />
                      <div>
                        <Label htmlFor="card" className="font-medium">
                          💳 Karta kredytowa/debetowa
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Visa, MasterCard, Maestro
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg opacity-50">
                      <RadioGroupItem value="bank" id="bank" disabled />
                      <Building className="h-5 w-5" />
                      <div>
                        <Label htmlFor="bank" className="font-medium">
                          🏛️ Przelew bankowy
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Tradycyjny przelew
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg opacity-50">
                      <RadioGroupItem value="paypal" id="paypal" disabled />
                      <Wallet className="h-5 w-5" />
                      <div>
                        <Label htmlFor="paypal" className="font-medium">
                          🅿️ PayPal
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Bezpieczne płatności online
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Card Details */}
                {paymentMethod === 'card' && selectedPackage.price > 0 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="card-element">Dane karty</Label>
                      <div className="mt-1 p-3 border rounded-md">
                        <CardElement
                          options={{
                            style: {
                              base: {
                                fontSize: '16px',
                                color: '#374151',
                                '::placeholder': {
                                  color: '#6B7280',
                                },
                              },
                            },
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="cardName">Imię i nazwisko na karcie</Label>
                      <Input
                        id="cardName"
                        value={billingInfo.cardName}
                        onChange={(e) => setBillingInfo({...billingInfo, cardName: e.target.value})}
                        placeholder="Jan Kowalski"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Billing Information */}
                <div>
                  <Label htmlFor="email">Email dla faktury</Label>
                  <Input
                    id="email"
                    type="email"
                    value={billingInfo.email}
                    onChange={(e) => setBillingInfo({...billingInfo, email: e.target.value})}
                    placeholder="jan.kowalski@email.com"
                    required
                  />
                </div>

                {/* Terms Acceptance */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    Akceptuję{" "}
                    <a href="/regulamin" className="text-primary hover:underline">
                      regulamin serwisu
                    </a>{" "}
                    i{" "}
                    <a href="/polityka-prywatnosci" className="text-primary hover:underline">
                      politykę prywatności
                    </a>
                  </Label>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Powrót
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || (!stripe && selectedPackage.price > 0)}
                    className="flex-1"
                  >
                    {loading ? 'Przetwarzanie...' : 
                     selectedPackage.price === 0 ? 'Aktywuj pakiet' : 'Zapłać i aktywuj'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <>
      <Header />
      <Elements stripe={stripePromise}>
        <PaymentForm />
      </Elements>
      <Footer />
    </>
  )
}
