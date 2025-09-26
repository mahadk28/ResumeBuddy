import {Link} from "react-router";
import ScoreCircle from '~/components/ScoreCircle';
import { useEffect, useState } from 'react';
import {usePuterStore} from "~/lib/puter";

const ResumeCard =({resume: {id,companyName,jobTitle,feedback,imagePath}}: {resume: Resume}) => {

  const [resumeUrl,setResumeUrl]=useState('');
  const {fs} = usePuterStore();
  useEffect(() => {
    let objectUrl: string | null = null;
    const loadResume = async () => {
      if (!imagePath) return;
      const blob = await fs.read(imagePath);
      if(!blob) return;
      objectUrl = URL.createObjectURL(blob);
      setResumeUrl(objectUrl);
      console.log({ url: objectUrl });
    }
    loadResume();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  }, [imagePath, fs]);



  return (
    <Link to ={ `/resume/${id}`}
          className="resume-card animate-in fade-in duration-1000">
      <div className="resume-card-header">
      <div className="flex-col gap-2">
        {companyName && <h2 className ="!text-black font-bold break-words">
        {companyName}
      </h2>}
        { jobTitle && <h3 className ="text-lg break-words text-gray-500">
        {jobTitle}
      </h3>}
        {!companyName && !jobTitle && <h3 className ="text-black font-bold">Resume</h3>}
      </div>
      <div className="flex-shrink-0">
        <ScoreCircle score = {feedback.overallScore}/>
      </div>
      </div>
      {resumeUrl && (
        <div className={"gradient-border animate-in fade-in duration-1000"}>
          <div className="w-full h-full">
            <img
              src={resumeUrl}
              alt="Resume"
              className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
            />
          </div>
        </div>
      )}
</Link>
  )
}

export default ResumeCard