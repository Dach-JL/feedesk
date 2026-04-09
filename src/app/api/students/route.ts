import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const students = await prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        class: true,
        assignments: {
          include: {
            feePlan: true,
            payments: true
          }
        }
      }
    });
    
    return NextResponse.json(students);
  } catch {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, classId, password } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Student name is required" }, { status: 400 });
    }
    if (!classId) {
      return NextResponse.json({ error: "A class assignment is strongly required" }, { status: 400 });
    }

    let hashedPassword = null;
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password.trim(), 10);
    }

    const newStudent = await prisma.student.create({
      data: { 
        name: name.trim(),
        email: email && email.trim() !== "" ? email.trim() : null,
        password: hashedPassword,
        classId: classId
      },
      include: {
        class: true
      }
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to register student" }, { status: 500 });
  }
}
