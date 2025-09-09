import type { Route } from "./+types/home";
import Navbar from '~/components/Navbar';
import { resumes } from '../../constants';
import ResumeCard from '~/components/ResumeCard';
import { usePuterStore } from '~/lib/puter';
import { useLocation, useNavigate } from 'react-router';
import { useEffect } from 'react';


export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumeBuddy" },
    { name: "description", content: "Ai Powered RESUME CRITIQUE" },
  ];
}

export default function Home() {
  const Auth = () => {
    const { auth } = usePuterStore();
    const navigate = useNavigate();
    useEffect(() => {
      if (!auth.isAuthenticated) navigate('/auth?next=/');
    }, [auth.isAuthenticated]);
    return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar />

        <section className="main-section">
          <div className="page-heading py-16">
            <h1>Follow your Applications and your Resume Reviews</h1>
            <h2>
              Review all your submissions and stay up to date with AI feedback
            </h2>
          </div>

          {resumes.length > 0 && (
            <div className="resumes-section">
              {resumes.map((resume) => (
                <ResumeCard key={resume.id} resume={resume} />
              ))}
            </div>
          )}
        </section>
      </main>
    );
  };
}
