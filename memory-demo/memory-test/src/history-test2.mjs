import { config } from 'dotenv';
config({ path: path.join(process.cwd(), '.env') });
import path from 'node:path';
import {
  ChatOpenAI
} from '@langchain/openai';
import {
  FileSystemChatMessageHistory
} from '@langchain/community/stores/message/file_system';
import {
  HumanMessage,
  AIMessage,
  SystemMessage
} from '@langchain/core/messages';

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  }
})

async function fileHistoryDemo() {
  const filePath = path.join(process.cwd(), "chat-history.json") // 当前进程所在目录
  const sessionId = "user_session_001"; // 新一轮会话的会话id
  // console.log('历史文件:', historyFilePath);
  const systemMessage = new SystemMessage(
    "你是一个友好的烹饪助手，喜欢分享美食和烹饪技巧。"
  )
  console.log("[第一轮对话]");
  const history = new FileSystemChatMessageHistory({sessionId, filePath});
  const userMessage1 = new HumanMessage("红烧肉怎么做？");
  await history.addMessages([userMessage1]);
  const messages1 = [systemMessage, ...(await history.getMessages())];
  console.log(messages1);
  const response1 = await model.invoke(messages1);
  console.log(response1);
  await history.addMessage(response1);
  console.log(await history.getMessages());

  const userMessage2 = new HumanMessage("好吃吗？");
  await history.addMessage(userMessage2);

  const messages2 = [systemMessage, ...(await history.getMessages())];
  const response2 = await model.invoke(messages2);
  await history.addMessage(response2);
  console.log(await history.getMessages());
}

fileHistoryDemo().catch(console.error);
