import { z } from 'zod';

/**
 * Defines the validation rules for the signup form using Zod.
 * 
 * - `name` must be at least 2 characters long.
 * - `username` must be at least 2 characters long.
 * - `email` must be a valid email address.
 * - `password` must be at least 8 characters long.
 */
export const signupValidation = z.object({
    name: z.string().min(2, { 
        message: 'Name must be at least 2 characters' 
    }),
    username: z.string().min(2, { 
        message: 'Username must be at least 2 characters.' 
    }),
    email: z.string().email({ 
        message: 'Please enter a valid email address.' 
    }),
    password: z.string().min(8, { 
        message: 'Password must be at least 8 characters.' 
    }),
});

/**
 * Defines the validation rules for the signin form using Zod.
 * 
 * - `email` must be a valid email address.
 * - `password` must be at least 8 characters long.
 */

export const signinValidation = z.object({
    email: z.string().email({ 
        message: 'Please enter a valid email address.' 
    }),
    password: z.string().min(8, { 
        message: 'Password must be at least 8 characters.' 
    }),
});


 // Defines the validation rules for the signin form using Zod.
export const postValidation = z.object({
        caption: z.string().min(5,).max(2200),
        file: z.custom<File[]>(),
        location: z.string().min(2).max(100), 
        tags: z.string().min(2,).max(100),
});