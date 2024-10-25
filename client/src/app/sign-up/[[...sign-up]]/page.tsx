import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return <div className='flex min-h-screen w-full justify-center items-center'>
        <SignUp />
  </div>
}