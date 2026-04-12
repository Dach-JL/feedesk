import VerificationsClient from "@/components/payments/VerificationsClient";

export const metadata = {
  title: "Payment Verifications | FeeDesk",
  description: "Review and verify student payment proofs.",
};

export default function VerificationsPage() {
  return (
    <div className="py-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Payment <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Verifications</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Review screenshots submitted by students and approve or reject their payment proofs.
        </p>
      </div>
      
      <VerificationsClient />
    </div>
  );
}
