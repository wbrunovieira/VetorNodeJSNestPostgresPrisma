import { z } from 'zod';

export const createDeviceSchema = z.object({
  name: z.string().min(2, { message: 'Nome muito curto' }),
  userId: z.string().min(2, { message: 'Nome muito curto' }),
  hostname: z.string(),
  macNumber: z.string(),
  os: z.string(),
  version: z.string(),
});
