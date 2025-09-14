'use client'
import React, {useEffect, useRef, useState} from 'react';
import { parse } from "partial-json";
import {
    Send
} from 'lucide-react';

import { Button } from '@/app/components/ui/button';
import {z} from "zod";
import {Loading} from "@/app/components/loading";
import {RecipeCard} from "@/app/components/recipe-card";
import {RecipeFinancialSchema} from "@/lib/recipeFinancialSchema";

type QA = {
    id: number;
    question: string;
    loading: boolean;
    answer: z.infer<typeof RecipeFinancialSchema> | null;
};

export default function ChatBot() {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState<QA[]>([]);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // mỗi khi response thay đổi -> scroll xuống cuối
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [response]);

    useEffect(() => {
       console.log(response)
    }, [response]);

    async function handleSubmit() {
        const id = Date.now();
        setResponse(prev => [
            ...prev,
            { id, loading: true, question: prompt, answer: null }
        ]);
        setPrompt("");

        const res = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
        });

        const reader = res.body?.getReader();
        if (!reader) {
            return {};
        }

        const decoder = new TextDecoder();
        let data = "";
        let parsed = {};
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            data += decoder.decode(value);
            parsed = parse(data);
            setResponse(prev =>
                prev.map(item =>
                    item.id === id
                        ? { ...item,loading:false, answer: parsed as z.infer<typeof RecipeFinancialSchema> }
                        : item
                )
            );
        }
    }
    return (
        <section className="chat flex flex-col min-h-dvh ">
            <div className="flex-1 min-h-0 overflow-y-auto">
                    {response.map((data, index) =>
                        <div key={index} className="flex flex-col gap-4">
                            <span className="text-sm text-black-500 self-end border rounded-xl bg-gray-200 p-3 m-3">{data.question}</span>
                            {data.loading && <Loading />}
                            <RecipeCard data={data.answer} />
                        </div>
                    )}
                <div ref={bottomRef} />
            </div>
                    <div
                        className="flex flex-col gap-2 rounded-2xl border bg-white p-4 m-4"
                    >

                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={async (e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    await handleSubmit();
                                }
                            }}
                            onInput={(e) => {
                                const el = e.currentTarget;
                                el.style.height = "auto";
                                el.style.height = el.scrollHeight + "px";
                            }}
                            className="w-full resize-none outline-none overflow-y-auto max-h-[250px]"
                            placeholder="What is your question?"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="
          h-10 w-10 rounded-full flex justify-center items-center self-end"
                            aria-label="Send"
                            onClick={handleSubmit}
                        >
                            <Send />
                        </Button>
                    </div>
        </section>
    );
};
