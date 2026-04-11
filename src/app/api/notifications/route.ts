import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        role: session.user.role,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        link: true,
        isRead: true,
        createdAt: true,
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { notificationId, all } = body;

    if (all) {
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          role: session.user.role,
        },
        data: {
          isRead: true,
        },
      });
    } else if (notificationId) {
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId: session.user.id, // Ensure user owns the notification
        },
        data: {
          isRead: true,
        },
      });
    } else {
      return new NextResponse("Missing data", { status: 400 });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[NOTIFICATIONS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
