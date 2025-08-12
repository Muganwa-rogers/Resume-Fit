import { callbackify } from "util";
import { resumes } from "../../constants";
import type { Route } from "./+types/home";
import Navbar from '~/components/Navbar'
import Resumecard from "~/components/Resumecard";
// import {resumes} from '../../../Resume-Controller/Constants'

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resume-fit" },
    { name: "description", content: "Make every application count with Resume-Fit’s smart resume checker" },
  ];
}

export default function Home() {
  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar/>
    <section className="main">
      <div className="page-heading">

        <h1>UPLOAD, ANALYSE, IMPROVE — GET HIRED</h1>
        <h2>Does your resume fit the job? Find out fast with Resume-Fit!</h2>

      </div>

    {resumes.length > 0 && (    
      <div className="resumes-section">
      {resumes.map((resume) => (
        <Resumecard key={resume.id} resume={resume}/>
      ))}
    </div>
    )}
    </section>
  </main>;
}
