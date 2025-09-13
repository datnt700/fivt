// utils/tokenize.ts
export function chunkIncremental(
    buffer: string,
    separatePunctuation = true
): { emit: string[]; carry: string| undefined   } {
    // Split words safely; keep last partial token as carry
    const pattern = separatePunctuation
        ? /([A-Za-zÀ-ÖØ-öø-ÿ0-9_]+|[^\sA-Za-zÀ-ÖØ-öø-ÿ0-9_])/g
        : /(\S+)/g;

    // If buffer ends without whitespace, we keep the tail for next chunk
    const endsWithBoundary = /\s$/.test(buffer);
    const tokens = buffer.match(pattern) ?? [];

    if (!endsWithBoundary && tokens.length) {
        const carry = tokens[tokens.length - 1];
        return { emit: tokens.slice(0, -1), carry };
    }
    return { emit: tokens, carry: "" };
}
