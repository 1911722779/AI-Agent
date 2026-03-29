import "dotenv/config";
import {
  ChatOpenAI,
  OpenAIEmbeddings
} from "@langchain/openai";
// 知识库中一段知识的抽象概念
import {
  Document
} from "@langchain/core/documents";
// 内存向量数据库
import {
  MemoryVectorStore
} from "@langchain/classic/vectorstores/memory";

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL
  },
  temperature: 0,
});

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDING_MODEL_NAME,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL
  }
})

const documents = [
  new Document({
    pageContent: "Chapter 1：开学第一天，光光背着新书包走进学校，心里有点紧张。他在教室门口深呼吸，告诉自己要勇敢一点。",
    metadata: {
      chapter: 1,
      character: "光光",
      type: "开头",
      mood: "紧张"
    }
  }),
  new Document({
    pageContent: "Chapter 2：老师安排座位时，光光坐在靠窗的位置。旁边的同学主动打招呼，说自己叫东东，还借给光光一支铅笔。",
    metadata: {
      chapter: 2,
      character: "光光,东东",
      type: "角色介绍",
      mood: "友好"
    }
  }),
  new Document({
    pageContent: "Chapter 3：课间时，光光不小心把作业本掉在地上。东东帮他一起捡起来，还笑着说：我们以后一起写作业吧。",
    metadata: {
      chapter: 3,
      character: "光光,东东",
      type: "关系发展",
      mood: "温暖"
    }
  }),
  new Document({
    pageContent: "Chapter 4：体育课上要分组接力，光光有些害怕跑慢。东东拍了拍他的肩膀，说只要尽力就好，两人配合得很默契。",
    metadata: {
      chapter: 4,
      character: "光光,东东",
      type: "冲突铺垫",
      mood: "鼓励"
    }
  }),
  new Document({
    pageContent: "Chapter 5：中午吃饭时，光光一个人端着餐盘找位置。东东挥手叫他过去，两人边吃边聊，发现都喜欢画画和踢球。",
    metadata: {
      chapter: 5,
      character: "光光,东东",
      type: "发展",
      mood: "轻松"
    }
  }),
  new Document({
    pageContent: "Chapter 6：下午的美术课上，光光忘记带彩笔。东东把自己的彩笔分给他，两人一起画了一幅校园操场的图画。",
    metadata: {
      chapter: 6,
      character: "光光,东东",
      type: "友情情节",
      mood: "合作"
    }
  }),
  new Document({
    pageContent: "Chapter 7：放学时，光光和东东一起走到校门口，约好明天早点到学校打篮球。光光觉得，今天是他最开心的一天。",
    metadata: {
      chapter: 7,
      character: "光光,东东",
      type: "结局",
      mood: "开心"
    }
  })
];

const vectorStore = await MemoryVectorStore.fromDocuments(
  documents,
  embeddings
);
// asRetriever检索器
// k: 检索结果数量
const retriever = vectorStore.asRetriever({ k: 2 });

const questions = ["光光和东东各自擅长什么？"];

for (const question of questions) {
  console.log("=".repeat(80));
  console.log(`问题：${question}`);
  console.log("=".repeat(80));
  // 先将question 转换为向量
  // 再通过向量搜索，cosine 找到最相似的2个文档
  const retrievedDocs = await retriever.invoke(question);
  // console.log(retrievedDocs);
  const scoreResults = await vectorStore.similaritySearchWithScore(question, 2);
  console.log(scoreResults);
  console.log("\n [检索到文档及相识度评分]");
  retrievedDocs.forEach((doc, i) => {
    const scoreResult = scoreResults.find(
      ([scoredDoc]) =>
        scoredDoc.pageContent === doc.pageContent
    );
    const score = scoreResult ? scoreResult[1] : null;
    const similarity = score ? (1 - score).toFixed(2) : "N/A";
    console.log(`\n 文档 ${i + 1} 相似度：${similarity}`);
    console.log(`内容：${doc.pageContent}`);
    console.log(`元数据：${JSON.stringify(doc.metadata)}`);
  })

  const context = retrievedDocs
    .map((doc, i) => `[片段${i + 1}]\n ${doc.pageContent}`)
    .join("\n\n----\n\n");

  const promopt = `
    你是一个将友情故事的老师。
    基于一下故事片段回答问题，用温暖生动的语言。
    如果故事中没有提及，就说“这个故事里没有提到这个情节”

    故事片段：
    ${context}

    问题：
    ${question}

    老师的回答：
    `;
  console.log("\n [AI 回答]");
  const response = await model.invoke(promopt);

  console.log(response.content);
  console.log("\n");

}
