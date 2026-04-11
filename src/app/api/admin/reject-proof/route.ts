import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { proofId, reason } = body;

    if (!proofId) {
      return NextResponse.json({ error: "Proof ID is required" }, { status: 400 });
    }

    // 1. Fetch proof with assignment details
    const proof = await prisma.paymentProof.findUnique({
      where: { id: proofId },
      include: {
        studentFeeAssignment: {
          include: {
            feePlan: true,
          }
        }
      }
    });

    if (!proof || proof.status !== "PENDING") {
      return NextResponse.json({ error: "Proof not found or already reviewed" }, { status: 404 });
    }

    // 2. Mark proof as rejected with reason
    const finalReason = reason || "Proof could not be verified.";
    const updatedProof = await prisma.paymentProof.update({
      where: { id: proofId },
      data: { 
        status: "REJECTED",
        rejectionReason: finalReason,
        reviewedBy: session.user.name || "System Admin"
      },
    });

    // 3. Notify student
    await prisma.notification.create({
      data: {
        userId: proof.studentFeeAssignment.studentId,
        role: "student",
        title: "Payment Rejected",
        message: `Your payment for ${proof.studentFeeAssignment.feePlan.name} was rejected. Reason: ${finalReason}`,
        type: "ERROR",
        link: "/student", // Point back to student portal
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

