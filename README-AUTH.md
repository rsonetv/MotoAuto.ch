# 🔐 System Uwierzytelniania MotoAuto

Kompletny system uwierzytelniania z Next.js 14, Supabase i Upstash Redis.

## 🚀 Funkcjonalności

### ✅ **Uwierzytelnianie**
- **Logowanie** z emailem i hasłem
- **Rejestracja** z walidacją danych
- **Reset hasła** przez email
- **OAuth** (Google, GitHub)
- **Wylogowanie** z czyszczeniem sesji

### ✅ **Bezpieczeństwo**
- **Rate limiting** z Upstash Redis
- **Walidacja** z Zod i polskimi komunikatami
- **RLS policies** w Supabase
- **Secure sessions** z middleware
- **Password visibility** toggle
- **CSRF protection**

### ✅ **UX/UI**
- **Responsive design** z Tailwind CSS
- **Loading states** z useTransition
- **Error handling** z proper feedback
- **Accessibility** (ARIA labels, focus management)
- **Form validation** z React Hook Form

## 📁 Struktura Plików

\`\`\`
├── app/(auth)/
│   ├── actions.ts              # Server Actions
│   ├── layout.tsx              # Auth layout
│   ├── loading.tsx             # Loading component
│   ├── login/page.tsx          # Login page
│   ├── register/page.tsx       # Register page
│   ├── reset-password/page.tsx # Reset password
│   ├── update-password/page.tsx # Update password
│   └── auth-code-error/page.tsx # Error page
├── app/auth/callback/route.ts  # OAuth callback
├── components/auth/
│   ├── login-form.tsx          # Login form
│   ├── register-form.tsx       # Register form
│   ├── oauth-button.tsx        # OAuth buttons
│   ├── reset-form.tsx          # Reset form
│   └── update-password-form.tsx # Update form
├── lib/
│   ├── auth.ts                 # Auth utilities
│   ├── validations.ts          # Zod schemas
│   └── ratelimit.ts            # Rate limiting
├── scripts/auth-schema.sql     # Database schema
└── middleware.ts               # Route protection
\`\`\`

## 🔧 Konfiguracja

### 1. **Zmienne Środowiskowe**

Skopiuj `.env.example` do `.env.local` i uzupełnij:

\`\`\`bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Upstash Redis
KV_REST_API_URL=https://your-redis.upstash.io
KV_REST_API_TOKEN=your_token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
\`\`\`

### 2. **Baza Danych**

Wykonaj SQL w Supabase SQL Editor:

\`\`\`sql
-- Uruchom scripts/auth-schema.sql
\`\`\`

### 3. **OAuth (Opcjonalne)**

W Supabase Dashboard → Authentication → Providers:
- Włącz Google OAuth
- Włącz GitHub OAuth
- Dodaj redirect URLs

## 🧪 Testowanie

### **Lokalne Testowanie**

\`\`\`bash
# Uruchom aplikację
npm run dev

# Testuj endpointy
curl -X POST http://localhost:3000/api/redis \
  -H "Content-Type: application/json" \
  -d '{"key":"test","value":"hello","action":"set"}'
\`\`\`

### **Testowanie Rate Limiting**

\`\`\`bash
# Testuj rate limiting (5 prób na 15 minut)
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
\`\`\`

## 📊 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Login | 5 prób | 15 minut |
| Register | 3 próby | 1 godzina |
| Reset Password | 3 próby | 1 godzina |
| General | 100 żądań | 1 godzina |

## 🔒 Bezpieczeństwo

### **RLS Policies**
- Użytkownicy widzą tylko swoje profile
- Admini widzą wszystkie profile
- Automatyczne tworzenie profili

### **Walidacja**
- Email format validation
- Strong password requirements
- Cross-field validation (confirm password)
- Polish error messages

### **Rate Limiting**
- IP-based limiting
- Sliding window algorithm
- Redis-backed storage
- Graceful degradation

## 🚀 Deployment

### **Vercel Deployment**

\`\`\`bash
# Link projekt
vercel link

# Pull environment variables
vercel env pull .env.local

# Deploy
vercel --prod
\`\`\`

### **Environment Variables w Vercel**

\`\`\`bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add KV_REST_API_URL
vercel env add KV_REST_API_TOKEN
vercel env add NEXT_PUBLIC_APP_URL
vercel env add JWT_SECRET
\`\`\`

## 🔍 Troubleshooting

### **Częste Problemy**

1. **"Module does not provide export"**
   - Sprawdź czy wszystkie exporty są w `lib/auth.ts`
   - Zrestartuj dev server

2. **Rate limiting nie działa**
   - Sprawdź Upstash Redis credentials
   - Sprawdź czy Redis jest dostępny

3. **OAuth nie działa**
   - Sprawdź redirect URLs w Supabase
   - Sprawdź czy providers są włączone

4. **Email nie wysyła się**
   - Sprawdź email templates w Supabase
   - Sprawdź SMTP configuration

## 📈 Monitoring

### **Metryki do Śledzenia**
- Login success/failure rates
- Registration conversion
- Rate limiting hits
- OAuth usage
- Password reset requests

### **Logi**
- Authentication errors
- Rate limiting violations
- Failed login attempts
- OAuth failures

## 🔄 Maintenance

### **Regularne Zadania**
- Monitor failed login attempts
- Clean up expired rate limit keys
- Review security logs
- Update dependencies
- Test backup/recovery procedures

---

## 📞 Support

W przypadku problemów:
1. Sprawdź logi w Vercel Dashboard
2. Sprawdź Supabase logs
3. Sprawdź Upstash Redis metrics
4. Otwórz issue na GitHub
