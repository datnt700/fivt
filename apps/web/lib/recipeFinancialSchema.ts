import { z } from "zod";

export const RecipeFinancialSchema = z.object({
    title: z.string().describe("Tiêu đề lời khuyên hoặc chiến lược tài chính"),
    description: z
        .string()
        .optional()
        .describe("Mô tả ngắn gọn hoặc bối cảnh cho lời khuyên"),

    // Structured strategies / actions
    strategies: z
        .array(
            z.object({
                name: z.string().describe("Tên chiến lược hoặc hành động tài chính"),
                detail: z.string().optional().describe("Mô tả chi tiết cho chiến lược"),
            })
        )
        .optional()
        .describe("Danh sách các chiến lược tài chính, nếu có"),

    // Structured steps (hành động cụ thể, tuần tự)
    steps: z
        .array(
            z.object({
                step: z.number().optional().describe("Số thứ tự"),
                action: z.string().describe("Mô tả chi tiết hành động cần làm"),
            })
        )
        .optional()
        .describe("Các bước hành động theo trình tự, nếu có"),

    // Nếu GPT trả plain text / markdown
    content: z
        .string()
        .optional()
        .describe("Nội dung markdown hoặc plain text cho lời khuyên tài chính"),

    tips: z
        .array(z.string())
        .optional()
        .describe("Các mẹo bổ sung hoặc gợi ý thêm"),
});