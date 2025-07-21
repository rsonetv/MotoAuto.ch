# 📦 Integracja Vercel Blob SDK (server upload) w Next.js - Kompletny Przewodnik

## 📋 **Raport Weryfikacji - ZAKOŃCZONE**

### ✅ **WSZYSTKIE ZADANIA ZREALIZOWANE:**

#### 1️⃣ **Połączenie z Vercel**
- ✅ Projekt już połączony z Vercel
- ✅ `BLOB_READ_WRITE_TOKEN` w environment variables
- ✅ `vercel link` i `vercel env pull` dostępne

#### 2️⃣ **Instalacja Vercel Blob SDK**
- ✅ `@vercel/blob` package zainstalowany
- ✅ Blob utilities w `lib/blob.ts`
- ✅ File validation (type, size)
- ✅ Upload, delete, list operations

#### 3️⃣ **API Routes**
- ✅ `/api/avatar/upload` - Server upload endpoint
- ✅ `/api/blob/list` - List files endpoint  
- ✅ `/api/blob/delete` - Delete files endpoint
- ✅ Rate limiting (10 req/min per IP)
- ✅ Input validation z Zod

#### 4️⃣ **UI Components**
- ✅ Avatar upload page (`/avatar/upload`)
- ✅ File preview before upload
- ✅ Progress indicators
- ✅ Success/error states
- ✅ Responsive design

#### 5️⃣ **Security & Performance**
- ✅ File type validation (JPEG, PNG, WebP, GIF)
- ✅ File size limits (10MB max)
- ✅ Rate limiting per IP
- ✅ Error handling bez exposure
- ✅ Cache control headers

---

## 🚀 **Instrukcje Uruchomienia**

### **1. Konfiguracja Projektu**

\`\`\`bash
# Jeśli nowy projekt
npx create-next-app@latest my-blob-app --typescript --tailwind --eslint --app

# Jeśli istniejący projekt
vercel login
vercel link
\`\`\`

### **2. Pobranie Environment Variables**

\`\`\`bash
# Pobierz zmienne z Vercel
npx vercel env pull .env.development.local

# Sprawdź czy BLOB_READ_WRITE_TOKEN jest obecny
cat .env.development.local | grep BLOB
\`\`\`

### **3. Instalacja Dependencies**

\`\`\`bash
# Zainstaluj Vercel Blob SDK
npm install @vercel/blob

# Zainstaluj pozostałe zależności
npm install @upstash/redis @upstash/ratelimit zod
\`\`\`

### **4. Konfiguracja Environment Variables**

Dodaj do `.env.local`:

\`\`\`bash
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...

# Upstash Redis (dla rate limiting)
KV_REST_API_URL=https://your-redis.upstash.io
KV_REST_API_TOKEN=your_token_here

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

### **Test 1: Avatar Upload UI**

\`\`\`bash
# Otwórz w przeglądarce
open http://localhost:3000/avatar/upload
\`\`\`

### **Test 2: Upload via cURL**

\`\`\`bash
# Upload image file
curl -X POST "http://localhost:3000/api/avatar/upload?filename=test.png" \
  -H "Content-Type: image/png" \
  --data-binary @/path/to/image.png
\`\`\`

**Oczekiwana odpowiedź:**
\`\`\`json
{
  "success": true,
  "blob": {
    "url": "https://blob.vercel-storage.com/test-1234567890-abc123.png",
    "pathname": "test-1234567890-abc123.png",
    "size": 245760,
    "uploadedAt": "2024-01-20T10:30:00.000Z"
  },
  "originalFilename": "test.png",
  "uniqueFilename": "test-1234567890-abc123.png",
  "contentType": "image/png",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
\`\`\`

### **Test 3: List Blobs**

\`\`\`bash
# List all uploaded files
curl "http://localhost:3000/api/blob/list"

# List with prefix filter
curl "http://localhost:3000/api/blob/list?prefix=avatar&limit=10"
\`\`\`

**Oczekiwana odpowiedź:**
\`\`\`json
{
  "success": true,
  "blobs": [
    {
      "url": "https://blob.vercel-storage.com/test-1234567890-abc123.png",
      "pathname": "test-1234567890-abc123.png",
      "size": 245760,
      "uploadedAt": "2024-01-20T10:30:00.000Z"
    }
  ],
  "cursor": null,
  "hasMore": false,
  "count": 1,
  "timestamp": "2024-01-20T10:30:00.000Z"
}
\`\`\`

### **Test 4: Delete Blob**

\`\`\`bash
# Delete uploaded file
curl -X DELETE "http://localhost:3000/api/blob/delete" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://blob.vercel-storage.com/test-1234567890-abc123.png"}'
\`\`\`

**Oczekiwana odpowiedź:**
\`\`\`json
{
  "success": true,
  "message": "File deleted successfully",
  "url": "https://blob.vercel-storage.com/test-1234567890-abc123.png",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
\`\`\`

### **Test 5: Rate Limiting**

\`\`\`bash
# Wyślij 15 requestów szybko (limit: 10/min)
for i in {1..15}; do
  curl -X POST "http://localhost:3000/api/avatar/upload?filename=test$i.png" \
    -H "Content-Type: image/png" \
    --data-binary @/path/to/image.png &
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
├── app/
│   ├── api/
│   │   ├── avatar/upload/route.ts    # Avatar upload endpoint
│   │   └── blob/
│   │       ├── list/route.ts         # List blobs endpoint
│   │       └── delete/route.ts       # Delete blob endpoint
│   └── avatar/
│       └── upload/page.tsx           # Upload UI page
├── lib/
│   ├── blob.ts                       # Blob utilities
│   ├── ratelimit.ts                  # Rate limiting
│   └── validations.ts                # Zod schemas
├── .env.example                      # Environment variables template
└── README-BLOB-INTEGRATION.md       # Ta dokumentacja
\`\`\`

---

## 🔧 **Dostępne Funkcje**

### **1. File Upload**
- Obsługiwane formaty: JPEG, PNG, WebP, GIF
- Maksymalny rozmiar: 10MB
- Automatyczne generowanie unikalnych nazw
- Preview przed uploadem
- Progress indicator

### **2. File Management**
- Lista wszystkich plików
- Filtrowanie po prefix
- Paginacja z cursor
- Usuwanie plików
- Informacje o rozmiarze i dacie

### **3. Security Features**
- Walidacja typu pliku
- Walidacja rozmiaru pliku
- Rate limiting per IP
- Input sanitization
- Error handling

---

## 🛡️ **Bezpieczeństwo**

### **File Validation:**
\`\`\`typescript
// Dozwolone typy plików
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png", 
  "image/webp",
  "image/gif"
]

// Maksymalny rozmiar (10MB)
const MAX_SIZE = 10 * 1024 * 1024
\`\`\`

### **Rate Limits:**
- **Upload**: 10 requestów / minutę per IP
- **List**: 10 requestów / minutę per IP
- **Delete**: 10 requestów / minutę per IP

### **URL Validation:**
- Tylko Vercel Blob URLs są akceptowane
- Walidacja z regex patterns
- CORS protection

---

## 🚀 **Deployment na Vercel**

### **1. Konfiguracja Environment Variables**

\`\`\`bash
# Dodaj zmienne do Vercel
vercel env add BLOB_READ_WRITE_TOKEN
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

### **3. Test Production Endpoints**

\`\`\`bash
# Test production upload
curl -X POST "https://your-app.vercel.app/api/avatar/upload?filename=test.png" \
  -H "Content-Type: image/png" \
  --data-binary @/path/to/image.png

# Test production list
curl "https://your-app.vercel.app/api/blob/list"
\`\`\`

---

## 🔧 **Troubleshooting**

### **Problem: "BLOB_READ_WRITE_TOKEN is required"**
\`\`\`bash
# Sprawdź czy token jest ustawiony
echo $BLOB_READ_WRITE_TOKEN

# Sprawdź w Vercel Dashboard
vercel env ls
\`\`\`

### **Problem: "Invalid file type"**
\`\`\`bash
# Sprawdź Content-Type header
curl -X POST "http://localhost:3000/api/avatar/upload?filename=test.png" \
  -H "Content-Type: image/png" \
  --data-binary @/path/to/image.png
\`\`\`

### **Problem: "File too large"**
\`\`\`bash
# Sprawdź rozmiar pliku
ls -lh /path/to/image.png

# Maksymalny rozmiar to 10MB
\`\`\`

---

## 📊 **Performance Tips**

### **Optymalizacja Uploadów:**
1. **Kompresuj obrazy** przed uploadem
2. **Użyj WebP** dla lepszej kompresji
3. **Resize images** do odpowiednich rozmiarów
4. **Cache responses** dla list operations
5. **Use CDN** dla delivery

### **Monitoring:**
\`\`\`typescript
// Dodaj do API route
console.log('Upload:', { filename, size, contentType, timestamp: new Date() })
console.log('Upload time:', Date.now() - startTime, 'ms')
console.log('File size:', contentLength, 'bytes')
\`\`\`

---

## 🎯 **Następne Kroki**

### **Rozszerzenia:**
- [ ] Image resizing i optimization
- [ ] Multiple file upload
- [ ] Drag & drop interface
- [ ] User authentication integration
- [ ] File organization (folders)
- [ ] Metadata storage
- [ ] Image editing tools
- [ ] Backup to other storage
- [ ] Analytics dashboard
- [ ] Cost monitoring

### **Production Checklist:**
- [ ] Environment variables skonfigurowane
- [ ] Rate limiting przetestowany
- [ ] File validation zweryfikowana
- [ ] Security review przeprowadzony
- [ ] Performance testing zakończony
- [ ] Monitoring skonfigurowany
- [ ] Backup strategy ustalona
- [ ] Cost limits ustawione

---

## 📞 **Support**

W przypadku problemów:
1. Sprawdź logi w Vercel Dashboard
2. Sprawdź Vercel Blob dashboard
3. Sprawdź Upstash Redis metrics
4. Otwórz issue na GitHub
5. Sprawdź Vercel Blob documentation

**Vercel Blob SDK Integration - KOMPLETNY! ✅**
