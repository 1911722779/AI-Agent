import 'dotenv/config';
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { ChatOpenAI } from '@langchain/openai';
import chalk from 'chalk';
import {
  HumanMessage,
  SystemMessage,
  ToolMessage
} from '@langchain/core/messages';

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL
  }
})

const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    "amap-maps-streamableHTTP": {
      "url": `https://mcp.amap.com/mcp?key=${process.env.AMAP_MAPS_API_KEY}`
    },
    // mcp 官方提供
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "F:/AIGC/LESSON_HM/ai/agent/mcp_in_action/mcp-test"
      ]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest"
      ]
    }
  }
})

const tools = await mcpClient.getTools();
const modelWithTools = model.bindTools(tools);
async function runAgentWithTools(query, maxIterations = 30) {
  const messages = [new HumanMessage(query)];

  for (let i = 0; i < maxIterations; i++) {
    console.log(chalk.bgGreen('⌛️正在等待AI思考...'));

    // 1) 先让模型基于当前 messages 输出：可能是最终内容，也可能是 tool_calls 请求
    const response = await modelWithTools.invoke(messages);
    messages.push(response);

    // 2) 如果没有 tool_calls，说明模型已经给出最终答复
    if (!response.tool_calls || response.tool_calls.length === 0) {
      console.log(`\n AI 最终回复：\n ${response.content}\n`);
      return response.content;
    }

    // 3) 有 tool_calls：必须立刻为每个 tool_call_id 回填 ToolMessage，否则 OpenAI 会报 INVALID_TOOL_RESULTS
    console.log(chalk.bgBlue(`[检测到 ${response.tool_calls.length} 个工具调用]`));
    console.log(chalk.bgBlue(`[工具调用] ${response.tool_calls.map(t => t.name).join(', ')}`));

    for (const toolCall of response.tool_calls) {
      const foundTool = tools.find(t => t.name === toolCall.name);

      let contentStr = '';

      if (typeof toolResult === 'string') {
        contentStr = toolResult;
      } else if (toolResult && toolResult.text) {
        contentStr = toolRest.text
      }
      // try {
      //   if (!foundTool) {
      //     contentStr = `[工具调用失败]: 找不到工具 ${toolCall.name}`;
      //   } else {
      //     const toolResult = await foundTool.invoke(toolCall.args);
      //     contentStr = typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult);
      //   }
      // } catch (e) {
      //   contentStr = `Tool execution error: ${e?.message || String(e)}`;
      // }

      messages.push(
        new ToolMessage({
          content: contentStr,
          tool_call_id: toolCall.id,
        })
      );
    }
  }

  return messages[messages.length - 1]?.content ?? '';
}

// await runAgentWithTools('北京南站附近的酒店，以及去的路线');
// await runAgentWithTools(`北京南站附近的2个酒店，以及去的路线，路线规划生成文档保存到 F:/AIGC/LESSON_HM/ai/agent/mcp_in_action/mcp-test 的一个md 文件`);
await runAgentWithTools(`北京南站附近的3个酒店，拿到酒店图片，展开浏览器，展示每个酒店的图片，每个tab一个url展示，并且把那个页面标题改为酒店名称`)
await mcpClient.close();

