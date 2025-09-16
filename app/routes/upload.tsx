import { useState } from 'react';
import Navbar from '~/components/Navbar';
import FileUploader from '~/components/fileUploader';
import { usePuterStore } from '~/lib/puter';
import { useNavigate } from 'react-router';
import { convertPdfToImage } from '~/lib/pdf2image';
import { generateUUID } from '~/lib/utils';
import { prepareInstructions } from '../../constants';

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
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
                                 file
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

      setStatusText("Converting to Image....");
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

      setStatusText("Preparing Data....");
      const uuid = generateUUID();
      const data = {
        id: uuid,
        resumePath: uploadedFile.path,
        imagePath: uploadingImage.path,
        companyName,
        jobTitle,
        jobDescription,
        feedback: '',
      };

      await kv.set(`resume:${uuid}`, JSON.stringify(data));

      setStatusText("Analyzing resume...");

      // Analyze with AI (no mock fallback). Retry once on transient errors.
      let feedback;
      let attempts = 0;
      const maxAttempts = 2;
      while (attempts < maxAttempts) {
        try {
          attempts++;
          setStatusText(attempts === 1 ? 'Analyzing resume…' : 'Analyzing resume… (retry)');
          feedback = await withTimeout(
            ai.feedback(
              uploadingImage.path,
              prepareInstructions({ jobTitle, jobDescription })
            ),
            60000
          );

          if (!feedback) {
            throw new Error('AI service returned error or no response');
          }

          // Extract text content from various possible AI response shapes
          let feedbackText: any;
          const messageAny: any = (feedback as any).message;
          const content = messageAny?.content ?? (Array.isArray(messageAny) ? messageAny : undefined);

          if (typeof content === 'string') {
            feedbackText = content;
          } else if (Array.isArray(content) && content.length > 0) {
            const first = content[0];
            feedbackText = first?.text ?? first?.content ?? (typeof first === 'string' ? first : undefined);
          } else if (typeof messageAny === 'string') {
            feedbackText = messageAny;
          }

          if (!feedbackText || typeof feedbackText !== 'string') {
            throw new Error('Empty AI response content');
          }

          // Debug logs: raw AI response and extracted text
          try {
            // eslint-disable-next-line no-console
            console.log('AI raw response:', feedback);
          } catch {}
          try {
            // eslint-disable-next-line no-console
            console.log('AI extracted text:', feedbackText);
          } catch {}

          // Expose for manual inspection in DevTools
          try {
            (window as any).__lastAIResponse = feedback;
            (window as any).__lastAIText = feedbackText;
          } catch {}

          let parsedFeedback: any;
          try {
            parsedFeedback = JSON.parse(feedbackText);
          } catch (parseErr) {
            // eslint-disable-next-line no-console
            console.error('Failed to parse AI feedback text as JSON:', feedbackText, parseErr);
            throw parseErr;
          }

          data.feedback = parsedFeedback;

          // Additional debug: final data before persisting
          try {
            // eslint-disable-next-line no-console
            console.log('Final data before save:', data);
            (window as any).__lastResumeData = data;
          } catch {}

          // Persist and navigate only on success
          await kv.set(`resume:${uuid}`, JSON.stringify(data));
          setStatusText('Analysis completed. Redirecting...');
          setTimeout(() => {
            navigate(`/results/${uuid}`);
          }, 800);
          return; // done
        } catch (aiErr) {
          console.error(`AI analysis attempt ${attempts} failed:`, aiErr);
          if (attempts >= maxAttempts) {
            throw aiErr;
          }
        }
      }

    } catch (error) {
      console.error('Analysis failed:', error);
      setStatusText('Error occurred during analysis');

      // Reset after error
      setTimeout(() => {
        setIsProcessing(false);
        setStatusText('');
      }, 3000);
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

    // Basic validation
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
                <input
                  type="text"
                  name="company-name"
                  placeholder="Company Name"
                  required
                />
              </div>

              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="Job Title"
                  required
                />
              </div>

              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  rows={5}
                  name="job-description"
                  placeholder="Job Description"
                  required
                />
              </div>

              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>

              <button className="primary-button" type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default Upload;