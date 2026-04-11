import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.payment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Transaction voided successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to void transaction." }, { status: 500 });
  }
}
