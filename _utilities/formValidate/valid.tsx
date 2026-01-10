export class Validator{
  private email:string;
  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private password:string;
  private passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

  constructor(data:{email:string, password:string},type="login") {
    this.email=data.email;
    this.password=data.password;
  }

  validateEmail():boolean {
    return this.emailRegex.test(this.email)
  }

  validatePassword():boolean {
    return this.passwordRegex.test(this.password)
  }

}