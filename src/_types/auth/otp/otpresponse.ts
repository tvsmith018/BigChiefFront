export type OTPResponse = {
data?: {code:string};     // support alternate shape just in case
  message?: string;
  success?: boolean;
};