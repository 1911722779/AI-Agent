import 'dotenv/config';
import { ChatOpenAI } from '@langchain/openai';
import { FileSystemChatMessageHistory } from "@langchain/community/stores/message/file_system";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import path from 'node:path';

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL
  },
  temperature: 0,
});


async function fileHistoryDemo() {
  const filePath = path.join(process.cwd(), "chat-history.json") // 当前进程所在目录
  const sessionId = "user_session_001"; // 新一轮会话的会话id
  const systemMessage = new SystemMessage(
    "你是一个友好的烹饪助手，喜欢分享美食和烹饪技巧。"
  )
  console.log("[第一轮对话]");
  const history = new FileSystemChatMessageHistory({ sessionId, filePath });
  const userMessage1 = new HumanMessage("红烧肉怎么做？");
  await history.addMessage(userMessage1);
  const messages1 = [systemMessage, ...(await history.getMessages())];
  const response1 = await model.invoke(messages1);
  await history.addMessage(response1);

  console.log(`用户：${userMessage1.content}`);
  console.log(`助手：${response1.content}`);
  console.log(`√对话已保存到文件：${filePath}\n`);

  console.log("[第二轮对话]");
  const userMessage2 = new HumanMessage("好吃吗?");
  await history.addMessage(userMessage2);
  const messages2 = [systemMessage, ...(await history.getMessages())];
  const response2 = await model.invoke(messages2);
  await history.addMessage(response2);

  console.log(`用户：${userMessage2.content}`);
  console.log(`助手：${response2.content}`);
  console.log(`√对话已更新到文件：${filePath}\n`);
}

fileHistoryDemo().catch(console.error);

