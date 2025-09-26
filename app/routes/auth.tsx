import { usePuterStore } from '~/lib/puter';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

export const meta = () => ([
  { title: 'ResumeBuddy | Sign In' },
  { name: 'description', content: 'Sign in to continue your resume analysis journey.' },
]);

const Auth = () => {
  const { isLoading, auth } = usePuterStore();
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const next = params.get('next') || '/';

  useEffect(() => {
    if (auth.isAuthenticated) navigate(next);
  }, [auth.isAuthenticated, next]);

  return (
    <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center px-4">
      <div className="gradient-border shadow-2xl max-w-4xl w-full">
        <section className="grid md:grid-cols-2 gap-0 bg-white rounded-2xl overflow-hidden">
          {/* Left side: welcome and highlights */}
          <div className="p-8 sm:p-10 flex flex-col justify-center bg-white">
            <div className="flex flex-col gap-4">
              <p className="text-sm font-semibold text-gray-500">Welcome to</p>
              <h1 className="text-5xl font-extrabold text-gradient leading-tight">RM</h1>
              <p className="text-base text-gray-600">Your AI-powered resume sidekick. Sign in to get instant feedback, ATS scoring, and practical tips to land the interview.</p>
            </div>

            <ul className="mt-6 space-y-3">
              <li className="flex items-start gap-3">
                <img src="/icons/check.svg" className="size-5 mt-0.5" alt="" />
                <p className="text-sm text-gray-700">Actionable, section-by-section improvements</p>
              </li>
              <li className="flex items-start gap-3">
                <img src="/icons/check.svg" className="size-5 mt-0.5" alt="" />
                <p className="text-sm text-gray-700">ATS compatibility score with quick wins</p>
              </li>
              <li className="flex items-start gap-3">
                <img src="/icons/check.svg" className="size-5 mt-0.5" alt="" />
                <p className="text-sm text-gray-700">Secure and private — your files stay yours</p>
              </li>
            </ul>

            <p className="mt-6 text-xs text-gray-500">By continuing, you agree to our Terms and acknowledge our Privacy Policy.</p>
          </div>

          {/* Right side: auth actions */}
          <div className="p-8 sm:p-10 flex flex-col items-center justify-center bg-gradient-to-b from-light-blue-100 to-light-blue-200">
            <div className="w-full max-w-sm">
              {isLoading ? (
                <button className="auth-button animate-pulse w-full">
                  <p>Preparing your workspace…</p>
                </button>
              ) : auth.isAuthenticated ? (
                <button className="auth-button w-full" onClick={auth.signOut}>
                  <p>Sign Out</p>
                </button>
              ) : (
                <button className="auth-button w-full" onClick={auth.signIn}>
                  <p>Sign In</p>
                </button>
              )}

              {!auth.isAuthenticated && (
                <p className="mt-4 text-center text-xs text-gray-600">You’ll be redirected back to where you left off.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Auth;