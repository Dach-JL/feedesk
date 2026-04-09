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

    // 1. Fetch Student, Class, Assignments & associated Payments
    const studentData = await prisma.student.findUnique({
      where: { id: studentId },
      include: { 
        class: true,
        assignments: {
          include: {
            feePlan: true,
            payments: {
              orderBy: { paymentDate: "desc" }
            }
          }
        }
      },
    });

    if (!studentData) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // 2. Extract and Flatten data for the frontend
    const assignments = studentData.assignments;
    const allPayments = assignments.flatMap(a => a.payments);
    const feePlans = assignments.map(a => a.feePlan);

    // 3. Compute Financial Metrics
    const totalOwed = feePlans.reduce((sum, plan) => sum + plan.amount, 0);
    const totalPaid = allPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const outstandingDues = totalOwed - totalPaid;

    // Avoid sending password hash back to the client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeProfile } = studentData;

    const payload = {
      profile: safeProfile,
      assignments,
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
