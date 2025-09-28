"use server";
import { prisma } from "@/lib/prisma";
import { TransactionType } from "@prisma/client";
import { auth } from "@/auth";


export const createTransaction = async (input : {
    amount: number,
    categoryId: string,
    type: TransactionType,
    description: string,
})=> {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error('Unauthorized');

        const categoryExists = await prisma.category.findUnique({
            where: { id: input.categoryId },
            select: { id: true },
        });

        if (!categoryExists) {
            throw new Error("User not found");
        }

        const userId = session.user.id;
        const transaction = await prisma.transaction.create({
            data: {
                amount: input.amount,
                type: input.type as TransactionType,
                categoryId: input.categoryId,
                description: input.description,
                userId: userId,
            }
        })
        return {  data: {
                ...transaction,
                amount: transaction.amount.toString(),
            }, };
    } catch (error) {
        console.error('Error creating address:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create address',
        };
    }
}