import dynamic from 'next/dynamic';

const DynamicLoginView = dynamic(async ()=> import('@/_views/authorization/login/loginview'))

export default async function LoginPage() {

  return (
    <DynamicLoginView />
  )
}