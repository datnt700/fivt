import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    const whereCondition: {
      userId: string;
      createdAt?: {
        gte: Date;
        lte: Date;
      };
    } = {
      userId: session.user.id,
    };

    // Only filter by date if a specific date is provided
    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      whereCondition.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const transactions = await prisma.transaction.findMany({
      where: whereCondition,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" }, 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, description, categoryId, type = 'EXPENSE', date } = body;

    // Validate required fields
    if (!amount || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields: amount, categoryId" },
        { status: 400 }
      );
    }

    // Parse the date if provided, otherwise use current date
    const transactionDate = date ? new Date(date) : new Date();

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        description: description || '',
        categoryId,
        type,
        userId: session.user.id,
        createdAt: transactionDate,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    );
  }
}