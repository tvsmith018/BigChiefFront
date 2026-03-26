import dynamic from 'next/dynamic';

const DynamicLoginView = dynamic(async ()=> import('@/_views/authorization/login/LoginContainer'))

export default async function LoginPage() {

  return (
    <DynamicLoginView />
  )
}