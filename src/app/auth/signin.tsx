import { useState, useEffect } from 'react'
import { userSignIn } from '../services/auth.services'
import { useRouter } from 'next/navigation'


const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter()

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await userSignIn(email, password);
    if (result.success) {
        console.log('user signed in successfully');
        router.push("/dashboard")
    }
    }
    return(
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input onChange={handleEmailChange} type="email" placeholder="Email" className="w-full focus:outline-none rounded-md px-3 bg-slate-100 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200" />
          <input onChange={handlePasswordChange} type="password" placeholder="Password" className="w-full focus:outline-none rounded-md px-3 bg-slate-100 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200" />
          <button type="submit" className="w-full cursor-pointer font-semibold rounded-full bg-blue-300 py-2 text-base text-slate-900 hover:bg-opacity-70">Sign in</button>
        </form>
    )
}

export default SignIn