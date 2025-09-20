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

  // Mock AI response for testing
  const createMockFeedback = (jobTitle: string, companyName: string) => {
    return {
      strengths: [
        "Strong technical skills relevant to the position",
        "Clear work experience progression",
        "Good educational background",
        "Relevant certifications and achievements"
      ],
      weaknesses: [
        "Could include more specific metrics and achievements",
        "Missing some industry-specific keywords",
        "Contact information could be more prominent",
        "Could benefit from a stronger summary section"
      ],
      suggestions: [
        `Tailor your resume more specifically for ${jobTitle} roles`,
        `Include keywords from ${companyName}'s job posting`,
        "Add quantifiable achievements (numbers, percentages, dollar amounts)",
        "Consider reformatting for better ATS compatibility",
        "Include a professional summary at the top"
      ],
      atsScore: Math.floor(Math.random() * 20) + 75, // Random score between 75-95
      summary: `Your resume shows good potential for the ${jobTitle} position at ${companyName}. With some targeted improvements focusing on keyword optimization and quantifiable achievements, you can significantly improve your chances of getting past ATS systems and landing an interview.`
    };
  };

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

      // Try AI first, fallback to mock if it fails
      let feedback;
      try {
        feedback = await withTimeout(
          ai.feedback(
            uploadedFile.path,
            prepareInstructions({ jobTitle, jobDescription })
          ),
          30000 // Shorter timeout
        );

        if (!feedback || !feedback.success) {
          throw new Error('AI service returned error or no response');
        }

        const feedbackText = typeof feedback.message.content === 'string'
          ? feedback.message.content
          : feedback.message.content[0].text;

        data.feedback = JSON.parse(feedbackText);

      } catch (aiError) {
        console.log('AI analysis failed, using mock response:', aiError);
        setStatusText("AI service unavailable, generating sample analysis...");

        // Use mock feedback when AI fails
        data.feedback = createMockFeedback(jobTitle, companyName);

        // Add a note that this is a mock response
        data.feedback.note = "This is a sample analysis due to AI service limitations. For actual analysis, please try again later.";
      }

      await kv.set(`resume:${uuid}`, JSON.stringify(data));
      setStatusText('Analysis completed. Redirecting...');
      console.log('Final data:', data);

      // Navigate to results page
      setTimeout(() => {
        navigate(`/results/${uuid}`);
      }, 1500);

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
              {statusText.includes('sample analysis') && (
                <p style={{ color: '#ff9800', fontSize: '14px', marginTop: '10px' }}>
                  Note: Using sample analysis due to AI service limits. Please try again later for actual AI analysis.
                </p>
              )}
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