import { AuthFormSchema } from "./base/authFormSchema"

interface Payload {
  email?:string, 
  password?:string
}

export const LoginSchema = AuthFormSchema.omit({
  lastname: true,
  firstname: true,
  dob: true,
})

export const EmailSchema = AuthFormSchema.omit({
  password: true,
  lastname: true,
  firstname:true,
  dob:true
})

export const PasswordSchema = AuthFormSchema.omit({
  email: true,
  lastname: true,
  firstname:true,
  dob:true
})

export const FirstnameSchema = AuthFormSchema.omit({
  email: true,
  lastname: true,
  password: true,
  dob:true
})

export const LastnameSchema = AuthFormSchema.omit({
  email: true,
  firstname: true,
  password: true,
  dob:true
})

export const DOBSchema = AuthFormSchema.omit({
  email:true,
  firstname: true,
  lastname: true,
  password: true
})

export type LoginFormState = 
    | {
        errors?: {
          email?: string[],
          password?: string[]
        }
        message?: string
      }
    | undefined

export type PasswordResetState = 
  | {
      errors?: {
        email?: string[],
        password?: string[],
      }
      message?:string
    }
  | undefined

export type SignupState = 
  | {
    errors?: {
      email?: string[],
      password?: string[],
      firstname?: string[],
      lastname?: string[],
      dob? :string[]
    }
    message?:string
  }
  | undefined