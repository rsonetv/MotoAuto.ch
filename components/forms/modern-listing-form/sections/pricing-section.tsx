"use client"

import { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Calculator, TrendingUp, Gavel, ShoppingCart } from "lucide-react"
import { CURRENCIES, FINANCING_OPTIONS, TRANSPORT_OPTIONS } from "@/lib/constants"

interface PricingSectionProps {
  form: UseFormReturn<any>
}

export function PricingSection({ form }: PricingSectionProps) {
  const watchedSaleType = form.watch("saleType")
  const watchedPrice = form.watch("price")
  const watchedCurrency = form.watch("currency")

  // Funkcja do formatowania ceny
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Szacowanie opłat (przykładowe wartości)
  const calculateFees = (price: number) => {
    const platformFee = Math.max(price * 0.02, 50) // 2% min. 50 CHF
    const paymentFee = price * 0.015 // 1.5%
    const total = platformFee + paymentFee
    
    return {
      platformFee,
      paymentFee,
      total,
      netAmount: price - total
    }
  }

  const fees = watchedPrice ? calculateFees(watchedPrice) : null

  return (
    <div className="space-y-6">
      {/* Typ sprzedaży */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sposób sprzedaży</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="saleType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="Kup Teraz" id="buy-now" />
                      <Label htmlFor="buy-now" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <ShoppingCart className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Kup Teraz</span>
                          <Badge variant="secondary">Polecane</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Sprzedaż za stałą cenę. Szybka i prosta transakcja.
                        </p>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="Aukcja" id="auction" />
                      <Label htmlFor="auction" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <Gavel className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Aukcja</span>
                          <Badge variant="outline">Premium</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Licytacja. Możliwość uzyskania wyższej ceny.
                        </p>
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Cena */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            {watchedSaleType === "Aukcja" ? "Cena wywoławcza" : "Cena sprzedaży"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {watchedSaleType === "Aukcja" ? "Cena wywoławcza *" : "Cena *"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="25000"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || "")}
                        className="text-lg font-medium"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Waluta *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="CHF" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Podgląd ceny */}
          {watchedPrice && watchedCurrency && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(watchedPrice, watchedCurrency)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {watchedSaleType === "Aukcja" ? "Cena wywoławcza" : "Cena końcowa"}
                </p>
              </div>
            </div>
          )}

          {/* Dodatkowe opcje dla aukcji */}
          {watchedSaleType === "Aukcja" && (
            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium">Dodatkowe opcje aukcji</h4>
              
              <FormField
                control={form.control}
                name="reservePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cena minimalna (opcjonalnie)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="30000"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || "")}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Minimalna cena, za którą zgadzasz się sprzedać pojazd
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buyNowPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cena "Kup Teraz" (opcjonalnie)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="35000"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || "")}
                      />
                    </FormControl>
                    <p className="text-sm text-muted-foreground">
                      Cena za którą kupujący może natychmiast zakończyć aukcję
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kalkulacja opłat */}
      {fees && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Szacunkowe opłaty</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Cena sprzedaży:</span>
              <span className="font-medium">{formatPrice(watchedPrice, watchedCurrency)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Opłata platformy (2%):</span>
              <span>-{formatPrice(fees.platformFee, watchedCurrency)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Opłata płatności (1.5%):</span>
              <span>-{formatPrice(fees.paymentFee, watchedCurrency)}</span>
            </div>
            <hr className="border-blue-200" />
            <div className="flex justify-between font-medium text-blue-900">
              <span>Do wypłaty:</span>
              <span>{formatPrice(fees.netAmount, watchedCurrency)}</span>
            </div>
            <p className="text-xs text-blue-700">
              * Opłaty są szacunkowe i mogą się różnić w zależności od wybranej metody płatności
            </p>
          </CardContent>
        </Card>
      )}

      {/* Opcje finansowania */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Opcje finansowania</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="financingOptions"
            render={() => (
              <FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {FINANCING_OPTIONS.map((option) => (
                    <FormField
                      key={option}
                      control={form.control}
                      name="financingOptions"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={option}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, option])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value: string) => value !== option
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              {option}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Opcje transportu */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Opcje dostawy</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="transportOptions"
            render={() => (
              <FormItem>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {TRANSPORT_OPTIONS.map((option) => (
                    <FormField
                      key={option}
                      control={form.control}
                      name="transportOptions"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={option}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, option])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value: string) => value !== option
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              {option}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Dodatkowe informacje */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dodatkowe informacje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="additionalInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dodatkowe uwagi (opcjonalnie)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="np. Możliwość negocjacji ceny, preferowane godziny kontaktu, dodatkowe wyposażenie w cenie..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon kontaktowy (opcjonalnie)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+41 79 123 45 67"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email kontaktowy (opcjonalnie)</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="kontakt@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Wskazówki cenowe */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Wskazówki dotyczące ceny
          </h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Sprawdź ceny podobnych pojazdów na rynku</li>
            <li>• Uwzględnij stan techniczny i przebieg</li>
            <li>• Pozostaw miejsce na negocjacje (5-10%)</li>
            <li>• W aukcjach ustaw realną cenę wywoławczą</li>
            <li>• Dodaj informacje o serwisowaniu i wyposażeniu</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}