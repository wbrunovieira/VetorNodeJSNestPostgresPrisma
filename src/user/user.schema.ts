import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, { message: 'Nome muito curto' }),
  email: z.string().email({ message: 'Email inválido' }),
  password: z
    .string()
    .min(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
    .regex(/[0-9]/, { message: 'Senha deve conter pelo menos um número' })
    .regex(/[a-zA-Z]/, { message: 'Senha deve conter pelo menos uma letra' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Senha deve conter pelo menos um caractere especial',
    }),
});
