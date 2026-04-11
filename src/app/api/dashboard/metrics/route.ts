import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // 1. Parallelize Independent Aggregations
    const [
      aggregations,
      todayAggregations,
      activeStudents,
      activeClasses,
      studentsWithPending,
    ] = await Promise.all([
      // Total Revenue
      prisma.payment.aggregate({
        _sum: { amount: true },
      }),
      // Today's Collections
      prisma.payment.aggregate({
        where: { paymentDate: { gte: startOfDay } },
        _sum: { amount: true },
        _count: { id: true },
      }),
      // System Counters
      prisma.student.count(),
      prisma.class.count(),
      // Optimized Unpaid Students fetch (Top 10 only)
      prisma.student.findMany({
        where: {
          assignments: {
            some: { status: "PENDING" }
          }
        },
        include: {
          class: true,
          assignments: {
            include: {
              feePlan: true,
              payments: true
            }
          }
        },
        take: 10,
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    const totalRevenue = aggregations._sum.amount || 0;
    const todayRevenue = todayAggregations._sum.amount || 0;
    const todayTransactions = todayAggregations._count.id || 0;

    // 2. Optimized Unpaid Calculation (Calculated based on fetched assignments)
    const unpaidStudentsList = studentsWithPending.map((student) => {
      // Calculate owed amount from assignments
      const totalOwed = student.assignments.reduce((sum, a) => sum + a.feePlan.amount, 0);
      
      // Calculate total paid across all assignments
      const totalPaid = student.assignments.reduce((sum, assignment) => {
        const assignmentPayments = assignment.payments.reduce((pSum, p) => pSum + p.amount, 0);
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
    }).filter(s => s.outstandingDues > 0)
      .sort((a, b) => b.outstandingDues - a.outstandingDues);

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

  } catch (error) {
    console.error("[DASHBOARD_METRICS_ERROR]", error);
    return NextResponse.json({ error: "Failed to load dashboard metrics" }, { status: 500 });
  }
}
