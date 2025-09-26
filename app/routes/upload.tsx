import { useEffect, useState } from 'react';
import Navbar from '~/components/Navbar';
import FileUploader from '~/components/fileUploader';
import { usePuterStore } from '~/lib/puter';
import { useNavigate } from 'react-router';
import { convertPdfToImage } from '~/lib/pdf2image';
import { generateUUID } from '~/lib/utils';
import { prepareInstructions } from '../../constants';


const Upload = () => {
  const { fs, ai, kv, auth, isLoading } = usePuterStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate('/auth?next=/upload');
  }, [isLoading, auth.isAuthenticated, navigate]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  function withTimeout<T>(p: Promise<T>, ms = 90000): Promise<T> {
    return Promise.race([
      p,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
      ),
    ]);
  }

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    try {
      setIsProcessing(true);
      setStatusText('Processing...');

      const uploadedFile = await fs.upload([file]);
      if (!uploadedFile) {
        setStatusText('Failed to upload');
        return;
      }

      setStatusText('Converting to Image...');
      const imageFile = await convertPdfToImage(file);
      if (!imageFile.file) {
        setStatusText('Failed to convert to image');
        return;
      }

      const uploadingImage = await fs.upload([imageFile.file]);
      if (!uploadingImage) {
        setStatusText('Failed to upload image');
        return;
      }

      setStatusText('Preparing Data...');
      const uuid = generateUUID();
      const data: any = {
        id: uuid,
        resumePath: uploadedFile.path,
        imagePath: uploadingImage.path,
        companyName,
        jobTitle,
        jobDescription,
        feedback: '',
      };

      await kv.set(`resume:${uuid}`, JSON.stringify(data));

      setStatusText('Analyzing resume...');

      const instructions = prepareInstructions(companyName, jobTitle, jobDescription);
      const feedback = await withTimeout(
        ai.feedback(uploadingImage.path, instructions),
        90000
      );

      if (!feedback || !(feedback as any).message) {
        throw new Error('AI service returned error or no response');
      }

      const content = (feedback as any).message?.content;
      const feedbackText = typeof content === 'string' ? content : content?.[0]?.text;
      if (!feedbackText) {
        throw new Error('AI response content missing');
      }

      try {
        data.feedback = JSON.parse(feedbackText);
      } catch (e) {
        // In case model returned plain text, store as-is
        data.feedback = feedbackText;
      }

      await kv.set(`resume:${uuid}`, JSON.stringify(data));
      setStatusText('Analysis completed. Redirecting...');
      setTimeout(() => {
        navigate(`/resume/${uuid}`);
      }, 1200);
    } catch (err) {
      console.error('Analyze failed:', err);
      setStatusText('Failed to analyze resume. Please try again later.');
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form) return;

    const formData = new FormData(form);
    const companyName = formData.get('company-name') as string;
    const jobTitle = formData.get('job-title') as string;
    const jobDescription = formData.get('job-description') as string;

    if (!companyName.trim() || !jobTitle.trim() || !jobDescription.trim()) {
      alert('Please fill in all fields');
      return;
    }

    if (!file) {
      alert('Please upload a resume');
      return;
    }

    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading">
          <h1>Helpful Feed Back To Land You Your Dream Job!</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" className="w-full" />
            </>
          ) : (
            <h2>Upload Your Resume For An ATS Score And Tips To Improve</h2>
          )}
          {!isProcessing && (
            <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input type="text" name="company-name" placeholder="Company Name" required />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input type="text" name="job-title" placeholder="Job Title" required />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea rows={5} name="job-description" placeholder="Job Description" required />
              </div>
              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>
              <button className="primary-button" type="submit">Analyze Resume</button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default Upload;