import { JobCard } from "../JobCard";
import techLogo from "@assets/generated_images/Tech_company_logo_placeholder_52258a35.png";

export default function JobCardExample() {
  return (
    <JobCard
      id="1"
      title="Senior Frontend Developer"
      company="TechCorp Inc"
      companyLogo={techLogo}
      location="São Paulo"
      country="Brasil"
      workType="Remote"
      contractType="Full-time"
      salary="$80k - $120k"
      description="We are looking for an experienced frontend developer to join our team. You will work on cutting-edge projects using React, TypeScript, and modern web technologies."
      postedTime="2 dias atrás"
      applicants={45}
      verified={true}
    />
  );
}
