import StudentsClient from "@/components/students/StudentsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Directory | FeeDesk",
  description: "Browse and intake students to your institution.",
};

export default function StudentsPage() {
  return (
    <div className="py-6 w-full h-full">
      <StudentsClient />
    </div>
  );
}
