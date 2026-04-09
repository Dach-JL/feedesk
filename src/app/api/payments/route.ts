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

    const payments = await prisma.payment.findMany({
      orderBy: { paymentDate: 'desc' },
      include: {
        studentFeeAssignment: {
          include: {
            student: true,
            feePlan: true,
          }
        }
      }
    });
    
    return NextResponse.json(payments);
  } catch {
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, studentFeeAssignmentId } = body;

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: "A valid strict positive amount is required" }, { status: 400 });
    }
    if (!studentFeeAssignmentId) {
      return NextResponse.json({ error: "Student Fee Assignment ID is required to log a transaction" }, { status: 400 });
    }

    const newPayment = await prisma.payment.create({
      data: {
        amount: Number(amount),
        studentFeeAssignmentId,
        status: "COMPLETED"
      },
      include: {
        studentFeeAssignment: {
          include: {
            student: true,
            feePlan: true
          }
        }
      }
    });

    return NextResponse.json(newPayment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to record payment transaction" }, { status: 500 });
  }
}
