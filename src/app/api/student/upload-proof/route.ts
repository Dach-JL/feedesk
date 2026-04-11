import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "student" || !session.user.studentId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { studentFeeAssignmentId, screenshotBase64, mimeType, note } = await req.json();

    if (!studentFeeAssignmentId || !screenshotBase64 || !mimeType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Verify this assignment belongs to the student
    const assignment = await prisma.studentFeeAssignment.findUnique({
      where: { id: studentFeeAssignmentId },
    });

    if (!assignment || assignment.studentId !== session.user.studentId) {
      return NextResponse.json({ error: "Assignment not found or unauthorized" }, { status: 404 });
    }

    // 2. Prevent uploading if already paid or has a pending proof
    if (assignment.status === "PAID") {
      return NextResponse.json({ error: "This fee has already been paid" }, { status: 400 });
    }

    const existingPendingProof = await prisma.paymentProof.findFirst({
      where: {
        studentFeeAssignmentId,
        status: "PENDING",
      },
    });

    if (existingPendingProof) {
      return NextResponse.json({ error: "A verification is already pending for this fee" }, { status: 400 });
    }

    // 3. Simple size check (2MB approx)
    // Base64 is ~4/3 larger than binary. 2MB binary ~ 2.7MB base64.
    if (screenshotBase64.length > 2.8 * 1024 * 1024) {
      return NextResponse.json({ error: "Image size too large. Max 2MB." }, { status: 413 });
    }

    // 4. Create the proof
    const fullDataUrl = `data:${mimeType};base64,${screenshotBase64}`;

    const proof = await prisma.paymentProof.create({
      data: {
        studentFeeAssignmentId,
        screenshotUrl: fullDataUrl,
        note: note || null,
        status: "PENDING",
      },
    });

    // 5. Notify admin
    await prisma.notification.create({
      data: {
        userId: "admin-1",
        role: "admin",
        title: "New Payment Proof",
        message: `${session.user.name} uploaded a payment proof for verification.`,
        type: "INFO",
        link: "/dashboard/verifications",
      },
    });

    return NextResponse.json({ 
      message: "Proof uploaded successfully. Pending verification.",
      proofId: proof.id 
    });

  } catch (error) {
    console.error("Upload proof API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
