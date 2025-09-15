import { usePuterStore } from '~/lib/puter';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

export const meta =()=>([
  {title:'resumeBuddy|auth'},
  {name: 'description', content : 'log in to your account.'},

])

const Auth = () => {
  const{isLoading,auth } = usePuterStore();
const location = useLocation();
const next = location.search.split("next=")[1];
const navigate = useNavigate();
 useEffect(()=>{
   if (auth.isAuthenticated) navigate(next);


 }, [auth.isAuthenticated,next]);


  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h screen flex items-center justify-center" >
      <div className="gradient-border shadow-lg">
        <section className="flex flex-col gap-8 bg-white rounded-2xl">
          <div className="flex flex-col gap-6 text-center">
            <h1>Welcome</h1>
            <h2>Log In To Continue Your Job Journey</h2>
          </div>
          <div>
            {isLoading ? (
              <button className={"auth-button animate-pulse"}>
                <p>Taking You To Resume Land.......</p>
              </button>
            ):(
              <>
                {auth.isAuthenticated ? (
                  <button className="auth-button" onClick={auth.signOut}>
                    <p>Sign Out</p>
                  </button>
                ):(
                  <button className="auth-button" onClick={auth.signIn}>
                    <p>Sign In</p>
                  </button>
                )}
              </>
            )}
          </div>
        </section>

      </div>

    </main>
  );
};

export default Auth;