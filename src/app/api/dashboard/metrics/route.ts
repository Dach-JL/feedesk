import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Total Revenue
    const aggregations = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
    });
    const totalRevenue = aggregations._sum.amount || 0;

    // 2. Today's Collections
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayAggregations = await prisma.payment.aggregate({
      where: {
        paymentDate: {
          gte: startOfDay,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      }
    });
    const todayRevenue = todayAggregations._sum.amount || 0;
    const todayTransactions = todayAggregations._count.id || 0;

    // 3. System Counters
    const activeStudents = await prisma.student.count();
    const activeClasses = await prisma.class.count();

    // 4. Unpaid Students Report Calculation
    const allStudents = await prisma.student.findMany({
      include: {
        class: true,
        assignments: {
          include: {
            payments: true,
          }
        },
      },
    });

    const feePlans = await prisma.feePlan.findMany();

    const unpaidStudentsList = allStudents.map((student: any) => {
      // Find fee plans applicable to this student (mapped to their class or global)
      const applicablePlans = feePlans.filter((p: any) => !p.classId || p.classId === student.classId);
      const totalOwed = applicablePlans.reduce((sum: number, p: any) => sum + p.amount, 0);
      
      // Calculate total paid across all assignments
      const totalPaid = student.assignments.reduce((sum: number, assignment: any) => {
        const assignmentPayments = assignment.payments.reduce((pSum: number, p: any) => pSum + p.amount, 0);
        return sum + assignmentPayments;
      }, 0);
      
      const outstandingDues = totalOwed - totalPaid;

      return {
        id: student.id,
        name: student.name,
        className: student.class?.name || "Unassigned",
        totalOwed,
        totalPaid,
        outstandingDues
      };
    }).filter((s: { outstandingDues: number }) => s.outstandingDues > 0)
      .sort((a: { outstandingDues: number }, b: { outstandingDues: number }) => b.outstandingDues - a.outstandingDues);

    return NextResponse.json({
      revenue: {
        total: totalRevenue,
        today: todayRevenue,
        recentTransactions: todayTransactions
      },
      counters: {
        students: activeStudents,
        classes: activeClasses
      },
      unpaidStudents: unpaidStudentsList
    });

  } catch {
    return NextResponse.json({ error: "Failed to load dashboard metrics" }, { status: 500 });
  }
}
