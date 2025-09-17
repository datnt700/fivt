"use server";
import {auth} from "@/auth";
import {prisma} from "@/lib/prisma";


export const createCategory = async (name: string) => {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error('Unauthorized');

        const userId = session.user.id;
        const transaction = await prisma.category.create({
            data: {
                name: name,
                userId: userId,
            }
        })
        return { success: true, data: transaction };
    } catch (error) {
        console.error('Error creating category:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create category',
        };
    }
}