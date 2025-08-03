declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Supabase
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
      SUPABASE_URL: string;
      SUPABASE_JWT_SECRET: string;
      
      // PostgreSQL
      POSTGRES_URL: string;
      POSTGRES_PRISMA_URL: string;
      POSTGRES_URL_NON_POOLING: string;
      POSTGRES_USER: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_HOST: string;
      POSTGRES_DATABASE: string;
      
      // Captcha
      NEXT_PUBLIC_HCAPTCHA_SITE_KEY: string;
      HCAPTCHA_SECRET_KEY: string;
      
      // NextAuth
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      
      // Google OAuth
      NEXT_PUBLIC_GOOGLE_CLIENT_ID?: string;
      GOOGLE_CLIENT_SECRET?: string;
      
      // Google Maps
      NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string;
      GOOGLE_MAPS_ID: string;
      
      // Other environment variables
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;
    }
  }
}

export {};
