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

    const classes = await prisma.class.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { students: true }
        }
      }
    });
    
    return NextResponse.json(classes);
  } catch {
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Class name is required" }, { status: 400 });
    }

    const newClass = await prisma.class.create({
      data: { name: name.trim() },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}
