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

    const newFeePlan = await prisma.feePlan.create({
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

    return NextResponse.json(newFeePlan, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create fee plan" }, { status: 500 });
  }
}
