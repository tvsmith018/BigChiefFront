import dynamic from 'next/dynamic';
const DynamicSignupView = dynamic(async ()=> import('@/_views/authorization/signup/signupview'))


export default async function SignupPage() {

  return (
      <DynamicSignupView />
    );
}