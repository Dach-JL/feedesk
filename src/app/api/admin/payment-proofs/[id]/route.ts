import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const proof = await prisma.paymentProof.findUnique({
      where: { id: params.id },
      include: {
        studentFeeAssignment: {
          include: {
            student: {
              include: {
                class: true
              }
            },
            feePlan: true,
          }
        }
      }
    });

    if (!proof) {
      return NextResponse.json({ error: "Proof not found" }, { status: 404 });
    }

    return NextResponse.json(proof);
  } catch (error) {
    console.error("Get payment proof detail API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
