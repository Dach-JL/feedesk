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
    const { proofId } = body;

    if (!proofId) {
      return NextResponse.json({ error: "Proof ID is required" }, { status: 400 });
    }

    // 1. Fetch proof with related assignment and fee plan
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

    // 2. Transaction: Log payment, mark assignment as paid, and approve the proof
    const result = await prisma.$transaction(async (tx) => {
      // Create official payment record
      const payment = await tx.payment.create({
        data: {
          amount: proof.studentFeeAssignment.feePlan.amount,
          status: "COMPLETED",
          studentFeeAssignmentId: proof.studentFeeAssignmentId,
        },
      });

      // Mark assignment as paid
      const updatedAssignment = await tx.studentFeeAssignment.update({
        where: { id: proof.studentFeeAssignmentId },
        data: { status: "PAID" },
      });

      // Mark proof as approved
      const updatedProof = await tx.paymentProof.update({
        where: { id: proofId },
        data: { 
          status: "APPROVED",
          reviewedBy: session.user.name || "System Admin"
        },
      });

      return { payment, updatedAssignment, updatedProof };
    });

    // 3. Notify student
    await prisma.notification.create({
      data: {
        userId: proof.studentFeeAssignment.studentId,
        role: "student",
        title: "Payment Approved",
        message: `Your payment for ${proof.studentFeeAssignment.feePlan.name} has been approved.`,
        type: "SUCCESS",
        link: "/dashboard/receipts",
      },
    });

    return NextResponse.json({ 
      message: "Proof approved, payment recorded, and assignment marked as PAID.",
      ...result 
    });

  } catch (error) {
    console.error("Approve proof API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

