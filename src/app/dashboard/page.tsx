import DashboardClient from "@/components/dashboard/DashboardClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | FeeDesk",
  description: "Executive overview of your institution's financial metrics.",
};

export default function DashboardPage() {
  return (
    <div className="py-6 w-full h-full">
      <DashboardClient />
    </div>
  );
}
