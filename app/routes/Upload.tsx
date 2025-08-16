import React, { useState, type FormEvent } from 'react'
import Navbar from '~/components/Navbar'
import FileUploader from '~/components/FileUploader';
import { usePuterStore } from '~/lib/Puter';
import { useNavigate } from 'react-router';
import { convertPdfToImage } from '~/lib/pdf2img';
import { generateUUID } from '~/lib/Utils';
import { prepareInstructions } from 'constants';

const Upload = () => {

    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const nvigate = useNavigate(); 
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect= (file: File | null) => {
        setFile(file)
    }

    const handleAnalyse = async ({ companyName,jobTitle,jobDiscription,file }: {companyName: String ,jobTitle: String ,jobDiscription: String ,file: File }) => {
        setIsProcessing(true);
        setStatusText('Uploading.............');
        const uploadedFile = await fs.upload([file]);

        if(!uploadedFile) return setStatusText('Error failed to upload the Doc');
        setStatusText('Coverting Doc to image...........');
        const imageFile = await  convertPdfToImage(file)
        
        if(!imageFile.file) return setStatusText('Error: Failed to convert PDF to image!!');

        setStatusText('Uploading the image .............')

        const uploadedImage = await fs.upload([imageFile.file]);
        
        if(!uploadedImage) return setStatusText('Error: Failed to upload Image!!');

        setStatusText("Preparing Data ................");

        const uuid = generateUUID();

        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName, jobTitle, jobDiscription,
            feedback: '',
        }

        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatusText('Analyzing ...................')

        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({jobTitle,jobDiscription})
        )

        if(!feedback) return setStatusText('Error: Failed to Analye resume !!');

        const feedbackText = typeof feedback.message.content === 'string' ?
        feedback.message.content
        : feedback.message.content[0].text;

        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        setStatusText('Analyse complete !! redirecting .......')

        console.log(data);
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const  formData = new FormData(form);

        const companyName = formData.get('company-name') as String;
        const jobTitle = formData.get('job-title') as String;
        const jobDiscription= formData.get('job-description') as String;

        if(!file) return;

        handleAnalyse({companyName, jobTitle, jobDiscription, file});
    }

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar/>
        <section className="main-section">
            <div className='page-heading py-16'>
                <h1>Check out your |<span className='text-blue-700 font-light px-2'> job connector</span></h1>
                {isProcessing ? (
                    <>
                        <h2>{statusText}</h2>
                        <img src="/images/resume-scan.gif" className='w-full' alt="Loading......" />
                    </>
                ):(
                    <h2>Drop in your resume for ATS Application Tracking System Score and Improvement Tips</h2>
                )}
                {!isProcessing && (
                    <form action="" onSubmit={handleSubmit} id='upload' className='flex flex-col gap-4 mt-8'>
                        <div className='form-div'>
                            <label htmlFor="Company-name">Company Name</label>
                            <input type="text" name='company-name' placeholder='Company Name' id='company-name'/>
                        </div>
                        <div className='form-div'>
                            <label htmlFor="Job-Title">Job-Title</label>
                            <input type="text" name='job-title' placeholder='Job-Title' id='job-title'/>
                        </div>
                        <div className='form-div'>
                            <label htmlFor="Job Discription">Job Discription</label>
                            <textarea rows={5} name='job-description' placeholder='.............. Write in the Discription of your certain Job .............' id='job-description'/>
                        </div>
                        <div className='form-div'>
                            <label htmlFor="Uploader">Uploader</label>
                            <FileUploader onFileSelect={handleFileSelect}/>
                        </div>
                        <button className='primary-button' type='submit'>Analyse-resume</button>
                    </form>
                )}
            </div>
        </section>
    </main>
  )
}

export default Upload