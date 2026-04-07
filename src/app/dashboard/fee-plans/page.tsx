import FeePlansClient from "@/components/fee-plans/FeePlansClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fee Plans | FeeDesk",
  description: "Manage tuition fees and payment structures.",
};

export default function FeePlansPage() {
  return (
    <div className="py-6 w-full h-full">
      <FeePlansClient />
    </div>
  );
}
