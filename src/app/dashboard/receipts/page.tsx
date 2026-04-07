import ReceiptsClient from "@/components/receipts/ReceiptsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Receipts & History | FeeDesk",
  description: "View payment transaction history and export PDF receipts.",
};

export default function ReceiptsPage() {
  return (
    <div className="py-6 w-full h-full">
      <ReceiptsClient />
    </div>
  );
}
