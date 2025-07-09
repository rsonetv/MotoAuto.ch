import * as z from "zod"

export const loginSchema = z.object({
  email: z.string().email("Wprowadź prawidłowy adres email"),
  password: z.string().min(6, "Hasło musi mieć co najmniej 6 znaków"),
  rememberMe: z.boolean().optional(),
})

export const registerSchema = z
  .object({
    firstName: z.string().min(2, "Imię musi mieć co najmniej 2 znaki"),
    lastName: z.string().min(2, "Nazwisko musi mieć co najmniej 2 znaki"),
    email: z.string().email("Wprowadź prawidłowy adres email"),
    password: z
      .string()
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
      .regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę")
      .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę"),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Musisz zaakceptować regulamin",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  })

export const forgotPasswordSchema = z.object({
  email: z.string().email("Wprowadź prawidłowy adres email"),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
      .regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę")
      .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  })

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>
