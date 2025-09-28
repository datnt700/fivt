import {CreateTransitionForm} from "./create/CreateTransactionForm";
import {prisma} from "@/lib/prisma";


export default async function Page(){
    const transactionCount = await prisma.transaction.count();

    const stats = [
        { title: 'Total Transaction', value: transactionCount, description: 'Current rows' },
    ];
    return (
        <>
            <CreateTransitionForm/>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s) => (
                    <div key={s.title}>
                        <div className="text-sm">{s.title}</div>
                        <div className="text-2xl font-bold">{s.value}</div>
                        <div className="text-xs text-muted-foreground">{s.description}</div>
                    </div>
                ))}
            </div>
        </>
    )
}