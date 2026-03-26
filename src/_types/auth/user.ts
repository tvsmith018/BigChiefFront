export type User = {
  firstname?: string,
  lastname?: string,
  avatarURL?: string
  detail?:string
  messages?:[{token_class:string, token_type:string, message:string}]
}