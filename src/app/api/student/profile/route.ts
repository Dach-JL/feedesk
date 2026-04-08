import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "student" || !session.user.studentId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const studentId = session.user.studentId;

    // 1. Fetch Student & Class
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // 2. Fetch Applicable Fee Plans (Global OR attached to their specific class)
    const feePlans = await prisma.feePlan.findMany({
      where: {
        OR: [
          { classId: null },
          { classId: student.classId },
        ],
      },
      include: {
        class: true,
      },
      orderBy: { dueDate: "asc" },
    });

    // 3. Fetch Student's Payment History
    const payments = await prisma.payment.findMany({
      where: { studentId },
      include: {
        feePlan: true,
      },
      orderBy: { paymentDate: "desc" },
    });

    // 4. Compute Financial Metrics
    const totalOwed = feePlans.reduce((sum, plan) => sum + plan.amount, 0);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const outstandingDues = totalOwed - totalPaid;

    // Avoid sending password hash back to the client
    const safeStudentProfile = { ...student } as Partial<typeof student>;
    delete safeStudentProfile.password;

    const payload = {
      profile: safeStudentProfile,
      feePlans,
      payments,
      metrics: {
        totalOwed,
        totalPaid,
        outstandingDues: Math.max(0, outstandingDues),
      },
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Student profile API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
