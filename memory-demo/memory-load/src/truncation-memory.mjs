import {
  InMemoryChatMessageHistory
} from '@langchain/core/chat_history';
import {
  HumanMessage,
  AIMessage,
  trimMessages
} from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import {
  getEncoding  // 40%
} from 'js-tiktoken';

async function messageCountTruncation() {
  const history = new InMemoryChatMessageHistory();
  const maxMessages = 4;

  const messages = [
    {type:'human',content:'我叫张三'},
    {type:'ai',content:'你好，张三，很高兴认识你'},
    {type:'human',content:'我今年25岁'},
    {type:'ai',content:'25岁正是人生的黄金时期，有什么我可以帮助你的吗？'},
    {type:'human',content:'我想学习编程'},
    {type:'ai',content:'编程是一个非常有挑战性的领域，你需要先学习基础知识'},
    {type:'human',content:'我想学习Python'},
    {type:'ai',content:'Python是一个非常流行的编程语言，你可以先学习Python的基础知识'},
    {type:'human',content:'我想学习JavaScript'},
    {type:'ai',content:'JavaScript是一个非常流行的编程语言，你可以先学习JavaScript的基础知识'},
    {type:'human',content:'我住在北京'},
    {type:'ai',content:'北京是个很棒的城市'},
    {type:'human',content:'我想去长城玩'},
    {type:'ai',content:'长城是个非常著名的景点，你可以先去长城玩'},
  ];
  for (const message of messages) {
    if(message.type === 'human'){
      await history.addMessage(new HumanMessage(message.content));
    } else {
      await history.addMessage(new AIMessage(message.content));
    }
  }

  let allMessages = await history.getMessages();
  console.log("所有消息:", allMessages);
  const trimmedMessages = allMessages.slice(-maxMessages);
  console.log(trimMessages.length,"保留消息数量");
  console.log("保留消息:", trimmedMessages.map(m => `${m.constructor.name}: ${m.content}`).join('\n\n'));
  
}

async function runAll() {
  await messageCountTruncation(); // 按消息数量截断

}


runAll()
  .catch(console.error);