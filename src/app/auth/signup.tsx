import { useState, useEffect } from 'react'
import { userSignUp } from '../services/auth.services'
import { useRouter } from 'next/navigation'

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [signUpSuccess, setSignUpSuccess] = useState<null | boolean>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter()
    
      const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
      }
    
      const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
      }
    
      const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setLoading(true)
          console.log('signing up user')
          const result = await userSignUp(email, password);
          if (result.success) {
            console.log('user signed up successfully');
            setSignUpSuccess(true)
          }
        } catch (err) {
          console.error('Error signing up user:', err);
          setSignUpSuccess(false)
        } finally {
          setLoading(false)
        }
        
      }
    return(
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input onChange={handleEmailChange} type="email" placeholder="Email" className="w-full focus:outline-none rounded-md px-3 bg-slate-100 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200" />
          <input onChange={handlePasswordChange} type="password" placeholder="Password" className="w-full focus:outline-none rounded-md px-3 bg-slate-100 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200" />
          <button type="submit" className="w-full cursor-pointer font-semibold rounded-full bg-blue-300 py-2 text-base text-slate-800 hover:bg-opacity-70">
            {loading ? 'Signing up...' : 'Sign up'}
          </button>
          {signUpSuccess && <p className="text-green-500">Sign up successful!</p>}
          {signUpSuccess === false && <p className="text-red-500">Sign up failed.</p>}
        </form>
    )
}

export default SignUp