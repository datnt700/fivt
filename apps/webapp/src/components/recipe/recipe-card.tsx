import { z } from "zod";
import Markdown from "react-markdown";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {RecipeFinancialSchema} from "@/lib/recipeFinancialSchema";

export function RecipeCard({ data }: { data ?: z.infer<typeof RecipeFinancialSchema> | null}) {
    if (!data ) return null;
    return (
        <Card className="w-full max-w-2xl mx-auto">
            {data.title && (
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold">
                        {data.title}
                    </CardTitle>
                </CardHeader>
            )}

            <CardContent className={`grid gap-6 ${data.title ? 'pt-0' : 'pt-6'}`}>
                {/* Description */}
                {data.description && (
                    <p className="text-gray-700">{data.description}</p>
                )}

                {/* Strategies */}
                {data.strategies && data.strategies.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Financial strategy</h3>
                        <ul className="list-disc list-inside space-y-1">
                            {data.strategies.map((s, i) => (
                                <li key={i}>
                                    <strong>{s.name}</strong>
                                    {s.detail ? ` – ${s.detail}` : ""}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Steps */}
                {data.steps && data.steps.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Action steps</h3>
                        <ol className="list-decimal list-inside space-y-2">
                            {data.steps.map((s, i) => (
                                <li key={i}> <Markdown
                                    components={{
                                        p: ({ children }) => <span>{children}</span>,
                                    }}
                                >
                                    {s.action}
                                </Markdown> </li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* Tips */}
                {data.tips && data.tips.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Additional Tips</h3>
                        <ul className="list-disc list-inside space-y-1">
                            {data.tips.map((t, i) => (
                                <li key={i}> <Markdown
                                    components={{
                                        p: ({ children }) => <span>{children}</span>,
                                    }}
                                >
                                    {t}
                                </Markdown></li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Fallback content */}
                {data.content && (
                    <div>
                        <Markdown>{data.content}</Markdown>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}