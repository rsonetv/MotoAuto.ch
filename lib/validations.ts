import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Nieprawidłowy e-mail'),
  password: z.string().min(8, 'Min. 8 znaków'),
  remember: z.boolean().optional().default(false),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Min. 2 znaki'),
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Mała, wielka litera i cyfra'),
    confirm_password: z.string(),
    terms: z.boolean().refine(Boolean, 'Akceptacja regulaminu wymagana'),
  })
  .refine((d) => d.password === d.confirm_password, {
    path: ['confirm_password'],
    message: 'Hasła nie są identyczne',
  });

export const resetPasswordSchema = z.object({
  email: z.string().email(),
});

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    path: ['confirm_password'],
    message: 'Hasła nie są identyczne',
  });

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ResetData = z.infer<typeof resetPasswordSchema>;
export type UpdateData = z.infer<typeof updatePasswordSchema>;