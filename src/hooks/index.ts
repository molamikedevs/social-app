import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { signupValidation } from '../lib/validation';

/**
 * Initializes the signup form using React Hook Form with Zod validation.
 * 
 * - `useForm` provides form state management and validation.
 * - `zodResolver(signupValidation)` integrates Zod schema for validation.
 * - `defaultValues` define initial form values to avoid uncontrolled component issues.
 */
export const form = useForm<z.infer<typeof signupValidation>>({
    resolver: zodResolver(signupValidation), // Apply Zod validation schema
    defaultValues: {
        name: '', // Default empty value for the name field
        username: '', // Default empty value for the username field
        email: '', // Default empty value for the email field
        password: '', // Default empty value for the password field
    },
});
