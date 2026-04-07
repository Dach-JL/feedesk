import PaymentsClient from "@/components/payments/PaymentsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Process Payments | FeeDesk",
  description: "Secure layout for cashing and logging student fee payments.",
};

export default function PaymentsPage() {
  return (
    <div className="py-6 w-full h-full">
      <PaymentsClient />
    </div>
  );
}
