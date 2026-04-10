import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { proofId, reason } = await req.json();

    if (!proofId) {
      return NextResponse.json({ error: "Proof ID is required" }, { status: 400 });
    }

    // 1. Fetch proof
    const proof = await prisma.paymentProof.findUnique({
      where: { id: proofId },
    });

    if (!proof || proof.status !== "PENDING") {
      return NextResponse.json({ error: "Proof not found or already reviewed" }, { status: 404 });
    }

    // 2. Mark proof as rejected with reason
    const updatedProof = await prisma.paymentProof.update({
      where: { id: proofId },
      data: { 
        status: "REJECTED",
        rejectionReason: reason || "Proof could not be verified.",
        reviewedBy: session.user.name || "System Admin"
      },
    });

    return NextResponse.json({ 
      message: "Proof rejected.",
      proof: updatedProof 
    });

  } catch (error) {
    console.error("Reject proof API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
