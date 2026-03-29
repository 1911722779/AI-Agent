import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { tool } from '@langchain/core/tools';
import {
    HumanMessage,
    SystemMessage,
    ToolMessage /*告知工具使用*/
} from '@langchain/core/messages';
// node 内置文件模块 异步IO
import fs from 'node:fs/promises';
// 数据校验 zod tool parameter
import { z } from 'zod';
import { log } from 'node:console';
import path from 'node:path';

const model = new ChatOpenAI({
    modelName: process.env.MODEL_NAME,
    apiKey: process.env.OPENAI_API_KEY,
    configuration: {
        baseURL: process.env.OPENAI_BASE_URL
    },
    temperature: 0,
})
// 原生写法很麻烦
// 新建一个tool  
const readFileTool = tool(
    // tool 处理函数的函数体
    // 分析某个代码文件有没有bug
    // 先通过tool 读取文件内容 path 作为参数 等待它读取完成 最后再分析有没有bug
    async ({ path: filePath }) => {

        // console.log(`正在尝试读取绝对路径：${path.resolve(path)}`);

        try {
            // 使用绝对路径可以确保 100% 读到文件
            const absolutePath = path.resolve(filePath);
            const content = await fs.readFile(absolutePath, 'utf-8');
            console.log(`[工具调用成功] 读取: ${absolutePath} (${content.length}字节)`);
            return content;
        } catch (error) {
            console.error(`[工具调用失败] ${error.message}`);
            return `读取失败：找不到文件 "${filePath}"。请检查文件是否存在。`;
        }
    },
    {
        name: 'read_file',
        description: '用此工具读取文件内容。当用户需要读取文件、查看代码、分析文件内容时，调用此工具。输入文件路径（可以使相对路径或者是绝对路径）',
        schema: z.object(
            { path: z.string().describe('要读取的文件路径') }
        )
    }
)

const tools = [
    readFileTool
];
// langchai 提供了一个方法，绑定工具
// 绑定后，模型在生成回复时，会自动调用工具
// llm 就可以自己干活了
const modelWithTools = model.bindTools(tools);
const messages = [
    new SystemMessage(`
        你是一个代码助手，可以使用工具读取文件并解释代码。

        工作流程：
        1. 当用户需要读取文件时，调用 read_file 工具。
        2. 工具会读取文件内容并返回。
        3. 你可以根据文件内容进行解释、分析或其他操作。

        可用工具：
        - read_file:读取文件内容。(使用此工具来获取文件内容)
    `),
    new HumanMessage('请直接调用 read_file 工具读取 tool-file-read.mjs 文件内容，并解释代码。')
];
// llm 返回的决策 开始调用工具
// tool_calls 的 api部分
// name 执行函数
let response = await modelWithTools.invoke(messages);


while (response.tool_calls && response.tool_calls.length > 0) {
    messages.push(response); // 把llm要调用工具的message 也加入 messages数组，形成多轮对话

    console.log(`\n[检测到 ${response.tool_calls.length} 个工具调用]`);

    const toolResults = await Promise.all(
        response.tool_calls.map(async (toolCall) => {
            const tool = tools.find(t => t.name === toolCall.name);
            if (!tool) {
                return `错误：找不到工具 ${toolCall.name}`;
            }
            console.log(`[调用工具] ${toolCall.name}(${JSON.stringify(toolCall.args)})`);
            try {
                const result = await tool.invoke(toolCall.args); // 调用
                return result;
            } catch (error) {
                return `错误：调用工具 ${toolCall.name} 失败，${error.message}`;
            }
        })
    );

    response.tool_calls.forEach((toolCall, index) => {
        messages.push(
            new ToolMessage({
                content: toolResults[index],
                tool_call_id: toolCall.id
            })
        )
    })

    // console.log(messages);
    response = await modelWithTools.invoke(messages);
    messages.push(response);
}

console.log("\n--- AI 最终回复 ---");
if (response.content) {
    console.log(response.content);
} else {
    console.log("AI 没有返回具体文字内容，请检查工具返回结果是否正确。");
}
// console.log(tooResult);


// console.log(response,response.content)
// console.log(process.env.OPENAI_API_KEY,'////')

