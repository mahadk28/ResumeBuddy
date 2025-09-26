import type { Route } from "./+types/home";
import Navbar from '~/components/Navbar';

import ResumeCard from '~/components/ResumeCard';
import { usePuterStore } from '~/lib/puter';
import Cover from '~/components/Cover';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import resume from '~/routes/resume';


export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumeBuddy" },
    { name: "description", content: "Ai Powered RESUME CRITIQUE" },
  ];
}

export default function Home() {
    const { auth , kv, fs, isLoading } = usePuterStore();
    const navigate = useNavigate();
    const [resumes,setResumes]=useState<Resume[]>([]);
    const [loadingResumes,setLoadingResumes]=useState(false);


  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate('/auth?next=/');
  }, [isLoading, auth.isAuthenticated, navigate]);


  useEffect(() => {
    const loadResume = async () => {
      setLoadingResumes(true);

      const resumes = (await kv.list ('resume:*', true)) as KVItem[];
      const parsedResumes = resumes?.map((resume) => (
        JSON.parse(resume.value) as Resume
      ))

      setResumes(parsedResumes || []);
      setLoadingResumes(false);
      console.log({parsedResumes});
    };


    loadResume();
  }, []);

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
            <h2 className="text-white">Your uploaded resumes</h2>
            <p className="text-black">These are your recent uploads. Click any card to view the full analysis.</p>
          </div>

          {!loadingResumes && resumes.length > 0 ? (
            <div className="resumes-section">
              {resumes.map((resume) => (
                <ResumeCard key={resume.id} resume={resume} />
              ))}
            </div>
          ) : (
            !loadingResumes && (
              <div className="gradient-border bg-white rounded-2xl p-6 text-center max-w-xl w-full">
                <p className="text-gray-700 mb-4">No resumes uploaded yet.</p>
                <a href="/upload" className="primary-button inline-block w-auto">Upload your first resume</a>
              </div>
            )
          )}
        </section>
      </main>
    );
  };

