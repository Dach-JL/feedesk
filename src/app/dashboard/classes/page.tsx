import ClassesClient from "@/components/classes/ClassesClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Classes Management | FeeDesk",
  description: "Manage classes and courses inside the FeeDesk System.",
};

export default function ClassesPage() {
  return (
    <div className="py-6 w-full h-full">
      <ClassesClient />
    </div>
  );
}
