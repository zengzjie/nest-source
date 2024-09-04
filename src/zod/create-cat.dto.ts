import z from 'zod';

export const createCatSchema = z.object({
    name: z.string().min(3).max(20),
    age: z.number().int().positive()
}).required();

export type CreateCatDto = z.infer<typeof createCatSchema>;