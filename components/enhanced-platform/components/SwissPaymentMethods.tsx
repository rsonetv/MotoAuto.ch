"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { 
  CreditCard, 
  Smartphone, 
  BadgeSwissFranc,
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Lock,
  Banknote
} from "lucide-react"
import { PaymentMethodsProps } from "../schema"
import { formatBidAmount } from "../string-formatters"

export function SwissPaymentMethods({
  methods,
  selectedMethod,
  amount,
  currency,
  onMethodSelect,
  onPaymentComplete
}: PaymentMethodsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'select' | 'details' | 'confirm' | 'processing' | 'success'>('select')
  const [paymentDetails, setPaymentDetails] = useState({
    twintPhone: '',
    postfinanceAccount: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: ''
  })

  const selectedPaymentMethod = methods.find(m => m.id === selectedMethod)
  const totalAmount = amount + (selectedPaymentMethod?.fees || 0)

  const handleMethodSelect = (methodId: string) => {
    onMethodSelect?.(methodId)
    setPaymentStep('details')
  }

  const handlePaymentSubmit = async () => {
    if (!selectedPaymentMethod) return

    setIsProcessing(true)
    setPaymentStep('processing')

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Mock payment result
      const result = {
        success: true,
        transactionId: `TXN-${Date.now()}`,
        method: selectedPaymentMethod.id
      }

      setPaymentStep('success')
      onPaymentComplete?.(result)
      
      toast.success('Płatność zakończona pomyślnie!', {
        description: `ID transakcji: ${result.transactionId}`
      })

    } catch (error) {
      toast.error('Błąd płatności', {
        description: 'Spróbuj ponownie lub wybierz inną metodę'
      })
      setPaymentStep('details')
    } finally {
      setIsProcessing(false)
    }
  }

  const renderPaymentForm = () => {
    if (!selectedPaymentMethod) return null

    switch (selectedPaymentMethod.id) {
      case 'twint':
        return (
          <div className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-br from-black to-gray-800 text-white rounded-lg">
              <Smartphone className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">TWINT</h3>
              <p className="text-sm opacity-80">Szybka płatność mobilna</p>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="twintPhone">Numer telefonu</Label>
                <Input
                  id="twintPhone"
                  type="tel"
                  placeholder="+41 79 123 45 67"
                  value={paymentDetails.twintPhone}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, twintPhone: e.target.value }))}
                  className="touch-optimized"
                />
              </div>
              
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  Otrzymasz powiadomienie TWINT na swoim telefonie
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )

      case 'postfinance':
        return (
          <div className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-br from-yellow-400 to-yellow-600 text-black rounded-lg">
              <BadgeSwissFranc className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">PostFinance</h3>
              <p className="text-sm opacity-80">Bezpieczne płatności online</p>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="postfinanceAccount">Numer konta PostFinance</Label>
                <Input
                  id="postfinanceAccount"
                  placeholder="01-123456-7"
                  value={paymentDetails.postfinanceAccount}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, postfinanceAccount: e.target.value }))}
                  className="touch-optimized"
                />
              </div>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Zostaniesz przekierowany do PostFinance e-finance
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )

      case 'credit_card':
        return (
          <div className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-lg">
              <CreditCard className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Karta kredytowa</h3>
              <p className="text-sm opacity-80">Visa, Mastercard, American Express</p>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="cardName">Imię i nazwisko na karcie</Label>
                <Input
                  id="cardName"
                  placeholder="Jan Kowalski"
                  value={paymentDetails.cardName}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardName: e.target.value }))}
                  className="touch-optimized"
                />
              </div>
              
              <div>
                <Label htmlFor="cardNumber">Numer karty</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={paymentDetails.cardNumber}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                  className="touch-optimized"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cardExpiry">Data ważności</Label>
                  <Input
                    id="cardExpiry"
                    placeholder="MM/RR"
                    value={paymentDetails.cardExpiry}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardExpiry: e.target.value }))}
                    className="touch-optimized"
                  />
                </div>
                <div>
                  <Label htmlFor="cardCvv">CVV</Label>
                  <Input
                    id="cardCvv"
                    placeholder="123"
                    value={paymentDetails.cardCvv}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardCvv: e.target.value }))}
                    className="touch-optimized"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (paymentStep === 'success') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="text-center p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">Płatność zakończona!</h3>
          <p className="text-muted-foreground mb-4">
            Twoja płatność została pomyślnie przetworzona
          </p>
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span>Kwota:</span>
              <span className="font-bold">{formatBidAmount(totalAmount, currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (paymentStep === 'processing') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="text-center p-8">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-bold mb-2">Przetwarzanie płatności...</h3>
          <p className="text-muted-foreground mb-4">
            Nie zamykaj tej strony
          </p>
          <Progress value={66} className="mb-4" />
          <p className="text-sm text-muted-foreground">
            Metoda: {selectedPaymentMethod?.name}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Podsumowanie płatności
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Kwota:</span>
              <span>{formatBidAmount(amount, currency)}</span>
            </div>
            {selectedPaymentMethod && selectedPaymentMethod.fees > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Opłata ({selectedPaymentMethod.name}):</span>
                <span>{selectedPaymentMethod.fees}%</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Razem:</span>
              <span>{formatBidAmount(totalAmount, currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Method Selection */}
      {paymentStep === 'select' && (
        <Card>
          <CardHeader>
            <CardTitle>Wybierz metodę płatności</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedMethod} onValueChange={handleMethodSelect}>
              <div className="space-y-3">
                {methods.filter(method => method.enabled).map((method) => (
                  <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {method.id === 'twint' && <Smartphone className="w-5 h-5" />}
                        {method.id === 'postfinance' && <BadgeSwissFranc className="w-5 h-5" />}
                        {method.id === 'credit_card' && <CreditCard className="w-5 h-5" />}
                        
                        <div>
                          <Label htmlFor={method.id} className="font-medium">
                            {method.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {method.description}
                          </p>
                        </div>
                      </div>
                      
                      {method.fees > 0 && (
                        <Badge variant="secondary" className="mt-1">
                          +{method.fees}% opłaty
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Payment Details */}
      {paymentStep === 'details' && selectedPaymentMethod && (
        <Card>
          <CardHeader>
            <CardTitle>Szczegóły płatności</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderPaymentForm()}
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setPaymentStep('select')}
                className="flex-1 touch-optimized"
              >
                Wstecz
              </Button>
              <Button
                onClick={handlePaymentSubmit}
                disabled={isProcessing}
                className="flex-1 touch-optimized"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Przetwarzanie...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Zapłać {formatBidAmount(totalAmount, currency)}
                  </>
                )}
              </Button>
            </div>
            
            {/* Security Notice */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Twoje dane są chronione 256-bitowym szyfrowaniem SSL
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Security Features */}
      <div className="text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            <span>Bezpieczne</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="w-4 h-4" />
            <span>Szyfrowane</span>
          </div>
          <div className="flex items-center gap-1">
            <BadgeSwissFranc className="w-4 h-4" />
            <span>Szwajcarskie</span>
          </div>
        </div>
      </div>
    </div>
  )
}