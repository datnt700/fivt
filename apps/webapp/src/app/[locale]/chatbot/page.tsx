'use client'
import React, {useEffect, useRef, useState} from 'react';
import { parse } from "partial-json";
import { Send } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import {z} from "zod";
import {Loading} from "@/components/loading";
import {RecipeCard} from "@/components/recipe-card";
import {RecipeFinancialSchema} from "@/lib/recipeFinancialSchema";
import {LanguageSwitcher} from "@/components/language-switcher";

type QA = {
    id: number;
    question: string;
    loading: boolean;
    answer: z.infer<typeof RecipeFinancialSchema> | null;
};

export default function ChatBot() {
    const t = useTranslations('chatbot');
    const locale = useLocale();
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

        const res = await fetch(`/${locale}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt, locale }),
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
        <section className="chat flex flex-col min-h-dvh">
            {/* Header with title and language switcher */}
            <div className="flex justify-between items-center p-4 border-b bg-white">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">{t('title')}</h1>
                    <p className="text-sm text-gray-600">{t('subtitle')}</p>
                </div>
                <LanguageSwitcher />
            </div>
            
            <div className="flex-1 min-h-0 overflow-y-auto">
                {response.length === 0 && (
                    <div className="flex items-center justify-center h-full p-4">
                        <div className="text-center text-gray-600">
                            <p className="text-lg mb-2">👋</p>
                            <p>{t('welcomeMessage')}</p>
                        </div>
                    </div>
                )}
                {response.map((data, index) =>
                    <div key={index} className="flex flex-col gap-4">
                        <span className="text-sm text-black-500 self-end border rounded-xl bg-gray-200 p-3 m-3">{data.question}</span>
                        {data.loading && <Loading />}
                        <RecipeCard data={data.answer} />
                    </div>
                )}
                <div ref={bottomRef} />
            </div>
            <div className="flex flex-col gap-2 rounded-2xl border bg-white p-4 m-4">
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
                    placeholder={t('placeholder')}
                />
                <Button
                    type="submit"
                    size="icon"
                    className="h-10 w-10 rounded-full flex justify-center items-center self-end"
                    aria-label={t('send')}
                    onClick={handleSubmit}
                >
                    <Send />
                </Button>
            </div>
        </section>
    );
};
