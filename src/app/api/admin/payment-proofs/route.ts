import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Fetch all pending proofs but EXCLUDE the heavy screenshotUrl column
    // We fetch details later when the admin clicks to view the image
    const pendingProofs = await prisma.paymentProof.findMany({
      where: {
        status: "PENDING",
      },
      select: {
        id: true,
        note: true,
        status: true,
        createdAt: true,
        studentFeeAssignment: {
          select: {
            id: true,
            student: {
              select: {
                id: true,
                name: true,
                class: {
                  select: {
                    name: true
                  }
                }
              }
            },
            feePlan: {
              select: {
                name: true,
                amount: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(pendingProofs);
  } catch (error) {
    console.error("List payment proofs API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
