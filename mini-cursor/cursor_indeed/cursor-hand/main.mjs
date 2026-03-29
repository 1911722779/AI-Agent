import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import {
    readFileTool,
    writeFileTool,
    executeCommanTool,
    listDirectoryTool
} from './all_tools.mjs';
import {
    HumanMessage,
    SystemMessage,
    ToolMessage /* 告知工具的使用 */
} from '@langchain/core/messages';
import chalk from 'chalk'; // 彩色输出

const model = new ChatOpenAI({
    modelName: process.env.MODEL_NAME, // 比qwen-coder-turbo 更强大
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
    configuration: {
        baseURL: process.env.OPENAI_BASE_URL,
    }
})

const tools = [
    readFileTool,
    writeFileTool,
    executeCommanTool,
    listDirectoryTool
];
// modelWithTools 绑定工具
const modelWithTools = model.bindTools(tools);
// web 4.0 AI earn money
async function runAgentWithTools(query, maxIterations = 30) {
    // 检测任务完成情况
    // 不用tool就是表示完成了
    // 正在使用tool就是任务依旧在进行中
    const messages = [
        new SystemMessage(`
        你是一个项目管理助手，使用工具完成任务。
        当前工作目录： ${process.cwd()}

        工具：
        1. read_file: 读取文件
        2. write_file: 写入文件
        3. execute_command: 执行命令（支持workingDirectory 参数）
        4. list_directory: 列出目录

        重要规则 - execute_command:
        - workingDirectory 参数会自动切换到指定目录
        - 当使用workingDirectory 参数时，不要再command中使用cd命令
        - 错误示例：{command:"cd react-todo-app && pnpm install",workingDirectory:"react-todo-app"}
        这是错误的！因为workingDirectory 已经在react-todo-app 目录了，再cdreact-todo-app 会找不到目录
        - 正确实力：{command:"pnpm install",workingDirectory:"react-todo-app"}
        这样就对了！workingDirectory 已经切换到react-todo-app，直接执行命令即可

        回复要简洁，只说做了什么
      `),
        new HumanMessage(query),
    ];
    // 循环是agent 的核心 llm 思考、规划、调整 不断迭代 直到完成任务
    for (let i = 0; i < maxIterations; i++) {
        console.log(chalk.bgGreen('⌛️正在等待AI思考...'))
        const response = await modelWithTools.invoke(messages);
        messages.push(response);
        // if (response.isFinal) {
        //     console.log(response);
        //     break;
        // }
        // console.log(response);
        if (!response.tool_calls || response.tool_calls.length === 0) {
            console.log(`\n AI 最终回复: \n ${response.content}\n`);
            return response.content;
        }
        for (const toolCall of response.tool_calls) {
            const foundTool = tools.find(t => t.name === toolCall.name);
            if (foundTool) {
                const toolResult = await foundTool.invoke(toolCall.args);
                messages.push(new ToolMessage({
                    content: toolResult,
                    tool_call_id: toolCall.id
                }))
            }
        }
    }

    return messages[messages.length - 1].content;
}

const case1 = `
创建一个功能丰富的React TodoList应用，要求：

0. 如果项目目录 react-todo-app 已存在，先删除：rmdir /s /q react-todo-app 2>nul
1. 创建项目：pnpm create vite react-todo-app --template react --no-interactive
2. 修改 src/App.jsx，实现完整功能的 TodoList:
  - 添加、删除、编辑、标记完成、取消任务
  - 分类筛选（全部/进行中/已完成）
  - 统计信息显示
  - localStorage 数据持久化
3. 添加复杂样式
  - 渐变背景（青到粉）
  - 卡片阴影、圆角
  - 悬停效果
4. 添加动画：
  - 添加/删除时的过渡动画
  - 使用CSS transitions
5. 最后列出目录确认，并读取 src/App.jsx 验证已被修改（不要启动 dev server）

注意：使用 pnpm，功能要完整，样式要美观，要有动画效果

之后再react-todo-app 项目中：
1.使用pnpm install 安装依赖
2.使用pnpm run dev 启动服务器
`

try {
    await runAgentWithTools(case1);

} catch (error) {
    console.error(`\n错误： ${error.message}\n`)
}
