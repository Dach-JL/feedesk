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

    const feePlans = await prisma.feePlan.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        class: true, // Fetch the associated Class relation if explicitly tied to a class
      }
    });
    
    return NextResponse.json(feePlans);
  } catch {
    return NextResponse.json({ error: "Failed to fetch fee plans" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, amount, dueDate, classId } = body;

    // Strict Validations
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Fee plan name is required" }, { status: 400 });
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: "A valid positive amount is required" }, { status: 400 });
    }
    if (!dueDate) {
      return NextResponse.json({ error: "A valid due date is required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const newFeePlan = await tx.feePlan.create({
        data: { 
          name: name.trim(),
          amount: Number(amount),
          dueDate: new Date(dueDate),
          classId: classId || null
        },
        include: {
          class: true
        }
      });

      // If a class is specified, automatically assign this fee plan to all students in that class
      if (classId) {
        const students = await tx.student.findMany({
          where: { classId: classId }
        });

        if (students.length > 0) {
          await tx.studentFeeAssignment.createMany({
            data: students.map(student => ({
              studentId: student.id,
              feePlanId: newFeePlan.id,
              status: "PENDING"
            }))
          });
        }
      }

      return newFeePlan;
    });

    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create fee plan" }, { status: 500 });
  }
}
