import { z } from "zod";

export const AuthFormSchema = z.object({
  email: z
    .email({message:"Please enter a valid email"}).trim(),
  password: z
    .string()
    .min(8, {message:"Must be 8 characters long."})
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .regex(/\d/, { message: 'Contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Contain at least one special character.',
    })
    .trim(),
  firstname: z
    .string()
    .min(2, {message:"Must be 2 characters long."})
    .trim(),
  lastname: z
    .string()
    .min(2, {message:"Must be 2 characters long."})
    .trim(),
  dob: z
    .string()
    .refine((val)=>{
      const birthDate = new Date(val);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();

      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 13; 
      }
      
      return age >= 13;
    }, "You must be at least 13 years old"),
})