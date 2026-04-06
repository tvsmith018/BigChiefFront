export type User = {
  id?: string | number,
  firstname?: string,
  lastname?: string,
  avatar?: string,
  avatarUrl?: string,
  avatarURL?: string,
  detail?:string,
  messages?:[{token_class:string, token_type:string, message:string}],
  errors?:string,
  netError?:string
}
