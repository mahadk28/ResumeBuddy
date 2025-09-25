import type { Route } from "./+types/home";
import Navbar from '~/components/Navbar';
import { resumes } from '../../constants';
import ResumeCard from '~/components/ResumeCard';
import { usePuterStore } from '~/lib/puter';
import Cover from '~/components/Cover';
import { useLocation, useNavigate } from 'react-router';
import { useEffect } from 'react';


export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumeBuddy" },
    { name: "description", content: "Ai Powered RESUME CRITIQUE" },
  ];
}

export default function Home() {
    const { auth } = usePuterStore();
    const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated]);

  return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex flex-col">
        <Navbar />

        <section className="flex-1 flex items-center justify-center text-center py-16">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight text-gradient">RESUMATE</h1>
            <p className="max-w-xl text-black text-base sm:text-lg">Your AI-powered resume sidekick. Upload your resume to get instant, actionable feedback.</p>
            <a href="/upload" className="primary-button px-6 py-3">Upload Resume</a>
          </div>
        </section>

        <section className="main-section">
          <div className="page-heading">
            <h2 className="text-white">Try sample resumes</h2>
            <p className="text-black">Preview a few examples to see how feedback looks.</p>
          </div>
          <div className="resumes-section">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        </section>
      </main>
    );
  };

