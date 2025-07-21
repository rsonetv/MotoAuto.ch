# 🤖 Integracja Groq SDK w Next.js - Kompletny Przewodnik

## 📋 **Raport Weryfikacji - ZAKOŃCZONE**

### ✅ **ZREALIZOWANE ZADANIA:**

#### 1️⃣ **Połączenie z Vercel**
- ✅ Projekt już połączony z Vercel
- ✅ Environment variables skonfigurowane
- ✅ `vercel link` i `vercel env pull` dostępne

#### 2️⃣ **Instalacja Groq SDK**
- ✅ `groq-sdk` zainstalowany w dependencies
- ✅ Groq client zainicjalizowany w `lib/groq.ts`
- ✅ TypeScript types skonfigurowane

#### 3️⃣ **API Routes**
- ✅ `/api/groq-test` endpoint utworzony
- ✅ GET i POST metody zaimplementowane
- ✅ Rate limiting z Upstash Redis
- ✅ Proper error handling

#### 4️⃣ **Konfiguracja Environment**
- ✅ `GROQ_API_KEY` dodany do `.env.example`
- ✅ Walidacja z Zod schemas
- ✅ Security measures implemented

---

## 🚀 **Instrukcje Uruchomienia**

### **1. Konfiguracja Projektu**

\`\`\`bash
# Jeśli nowy projekt
npx create-next-app@latest my-groq-app --typescript --tailwind --eslint --app

# Jeśli istniejący projekt
vercel login
vercel link
\`\`\`

### **2. Pobranie Environment Variables**

\`\`\`bash
# Pobierz zmienne z Vercel
npx vercel env pull .env.development.local

# Lub skopiuj ręcznie
cp .env.example .env.local
\`\`\`

### **3. Instalacja Dependencies**

\`\`\`bash
# Zainstaluj Groq SDK
npm install groq-sdk

# Zainstaluj pozostałe zależności
npm install @upstash/redis @upstash/ratelimit zod
\`\`\`

### **4. Konfiguracja Environment Variables**

Dodaj do `.env.local`:

\`\`\`bash
# Groq API
GROQ_API_KEY=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

# Upstash Redis (dla rate limiting)
KV_REST_API_URL=https://engaged-civet-46202.upstash.io
KV_REST_API_TOKEN=AbR6AAIjcDEyY2JkMmM0N2RhZGI0YzMwYWIxZDcwNWE4OGJhNGJiOXAxMA

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### **5. Uruchomienie Aplikacji**

\`\`\`bash
# Uruchom dev server
npm run dev

# Aplikacja dostępna na
http://localhost:3000
\`\`\`

---

## 🧪 **Testowanie API**

### **Test 1: Podstawowy GET Request**

\`\`\`bash
curl http://localhost:3000/api/groq-test
\`\`\`

**Oczekiwana odpowiedź:**
\`\`\`json
{
  "success": true,
  "message": "Cześć! Miło Cię poznać. Jak mogę Ci dzisiaj pomóc?",
  "model": "llama-3.3-70b-versatile",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
\`\`\`

### **Test 2: POST Request z Custom Prompt**

\`\`\`bash
curl -X POST http://localhost:3000/api/groq-test \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Napisz krótki wiersz o programowaniu w Next.js",
    "model": "llama-3.3-70b-versatile"
  }'
\`\`\`

**Oczekiwana odpowiedź:**
\`\`\`json
{
  "success": true,
  "message": "Next.js to framework wspaniały,\nReact i SSR w jednym miejscu...",
  "model": "llama-3.3-70b-versatile",
  "prompt": "Napisz krótki wiersz o programowaniu w Next.js",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 45,
    "total_tokens": 60
  }
}
\`\`\`

### **Test 3: Rate Limiting**

\`\`\`bash
# Wyślij 15 requestów szybko (limit: 10/min)
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/groq-test \
    -H "Content-Type: application/json" \
    -d '{"prompt":"Test '$i'"}' &
done
\`\`\`

**Po przekroczeniu limitu:**
\`\`\`json
{
  "error": "Rate limit exceeded. Try again in a minute.",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
\`\`\`

---

## 📁 **Struktura Plików**

\`\`\`
├── app/api/groq-test/route.ts    # Groq API endpoint
├── lib/
│   ├── groq.ts                   # Groq client i helpers
│   ├── ratelimit.ts              # Rate limiting
│   └── validations.ts            # Zod schemas
├── .env.example                  # Environment variables template
└── README-GROQ-INTEGRATION.md   # Ta dokumentacja
\`\`\`

---

## 🔧 **Dostępne Modele Groq**

| Model | Nazwa | Opis |
|-------|-------|------|
| `llama-3.3-70b-versatile` | Llama 3.3 70B | Najnowszy, najbardziej wszechstronny |
| `llama-3.1-70b-versatile` | Llama 3.1 70B | Duży model, dobra jakość |
| `llama-3.1-8b-instant` | Llama 3.1 8B | Szybki, mniejszy model |
| `mixtral-8x7b-32768` | Mixtral 8x7B | Dobry dla długich kontekstów |
| `gemma2-9b-it` | Gemma 2 9B | Zoptymalizowany dla instrukcji |

---

## 🛡️ **Bezpieczeństwo i Rate Limiting**

### **Rate Limits:**
- **Groq API**: 10 requestów / minutę
- **General API**: 100 requestów / godzinę
- **Auth endpoints**: 5 prób / 15 minut

### **Security Features:**
- Input validation z Zod
- Rate limiting z Upstash Redis
- Error handling bez exposure internal details
- IP-based limiting
- Request size limits

---

## 🔍 **Monitoring i Debugging**

### **Logi w Development:**
\`\`\`bash
# Sprawdź logi Next.js
npm run dev

# Sprawdź logi Vercel
vercel logs
\`\`\`

### **Metryki do Śledzenia:**
- Request count per endpoint
- Response times
- Error rates
- Rate limit hits
- Token usage (Groq)

---

## 🚀 **Deployment na Vercel**

### **1. Konfiguracja Environment Variables**

\`\`\`bash
# Dodaj zmienne do Vercel
vercel env add GROQ_API_KEY
vercel env add KV_REST_API_URL
vercel env add KV_REST_API_TOKEN
vercel env add NEXT_PUBLIC_APP_URL
\`\`\`

### **2. Deploy**

\`\`\`bash
# Deploy do production
vercel --prod

# Sprawdź status
vercel ls
\`\`\`

### **3. Test Production Endpoint**

\`\`\`bash
# Test production API
curl https://your-app.vercel.app/api/groq-test
\`\`\`

---

## 🔧 **Troubleshooting**

### **Problem: "Invalid API Key"**
\`\`\`bash
# Sprawdź czy GROQ_API_KEY jest ustawiony
echo $GROQ_API_KEY

# Sprawdź w Vercel Dashboard
vercel env ls
\`\`\`

### **Problem: Rate Limiting nie działa**
\`\`\`bash
# Sprawdź Redis connection
curl -X GET http://localhost:3000/api/redis

# Sprawdź Upstash Dashboard
\`\`\`

### **Problem: Model nie odpowiada**
\`\`\`bash
# Sprawdź dostępne modele
curl -X POST http://localhost:3000/api/groq-test \
  -d '{"prompt":"test","model":"invalid-model"}'

# Użyj domyślnego modelu
curl -X POST http://localhost:3000/api/groq-test \
  -d '{"prompt":"test"}'
\`\`\`

---

## 📊 **Performance Tips**

### **Optymalizacja Requestów:**
1. **Użyj odpowiedniego modelu** - `llama-3.1-8b-instant` dla szybkich odpowiedzi
2. **Ogranicz max_tokens** - ustaw rozsądny limit
3. **Cache responses** - dla powtarzających się zapytań
4. **Batch requests** - grupuj podobne zapytania

### **Monitoring:**
\`\`\`typescript
// Dodaj do API route
console.log('Request:', { prompt, model, timestamp: new Date() })
console.log('Response time:', Date.now() - startTime, 'ms')
console.log('Tokens used:', result.data?.usage)
\`\`\`

---

## 🎯 **Następne Kroki**

### **Rozszerzenia:**
- [ ] Streaming responses dla długich tekstów
- [ ] Chat interface z historią
- [ ] File upload i analiza dokumentów
- [ ] Integration z bazą danych
- [ ] User-specific rate limiting
- [ ] Response caching
- [ ] Analytics dashboard
- [ ] A/B testing różnych modeli

### **Production Checklist:**
- [ ] Environment variables skonfigurowane
- [ ] Rate limiting przetestowany
- [ ] Error handling zweryfikowany
- [ ] Security review przeprowadzony
- [ ] Performance testing zakończony
- [ ] Monitoring skonfigurowany
- [ ] Backup strategy ustalona

---

## 📞 **Support**

W przypadku problemów:
1. Sprawdź logi w Vercel Dashboard
2. Sprawdź Groq API status
3. Sprawdź Upstash Redis metrics
4. Otwórz issue na GitHub

**Groq SDK Integration - KOMPLETNY! ✅**
