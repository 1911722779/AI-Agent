import "dotenv/config";
import "cheerio"; // 后端，使用css 选择器，像操作前端一样查找DOM节点
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";

const cheerioLoader = new CheerioWebBaseLoader("https://juejin.cn/post/7233327509919547452?searchId=20260325012319135E4B969E894981B1B6",
  {
    selector: '.main-area p'
  }
)

const documents = await cheerioLoader.load();
// console.log(documents);
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 400, // 大小
  chunkOverlap: 50, // 重叠 语义的保护 连贯性 保留切割片段的前后50字
  separators: ['。', '，', '！', '？'] // 分隔符
})

const splitDocuments = await textSplitter.splitDocuments(documents);
console.log(splitDocuments);
console.log(`文档切割完成，共${splitDocuments.length}个片段`);

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDING_MODEL_NAME,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL
  }
});

const model = new ChatOpenAI({
  modelName: process.env.MODEL_NAME,
  apiKey: process.env.OPENAI_API_KEY,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL
  },
  temperature: 0,
});

console.log("正在创建向量存储...");
const vectorStore = await MemoryVectorStore.fromDocuments(splitDocuments, embeddings);
console.log("向量存储创建完成");

const questions = ["父亲的去世对坐着的人生态度产生了怎样的根本性逆转？"]

for (const question of questions) {
  console.log("=".repeat(80));
  console.log(`[问题]: ${question}`);
  console.log("=".repeat(80));

  const scoreResults = await vectorStore.similaritySearchWithScore(question, 2);
  console.log(scoreResults);

  console.log("\n [检索到的文档及相识度评分]");
  // similaritySearchWithScore 返回固定结构：[[Document, score], ...]
  scoreResults.forEach(([doc, score], i) => {
    const similarity = score ? (1 - score).toFixed(2) : "N/A";

    console.log(`\n 文档 ${i + 1} 相似度: ${similarity}`);
    console.log(`内容: ${doc.pageContent}`);
    if (doc.metadata && Object.keys(doc.metadata).length > 0) {
      console.log(`元数据: ${JSON.stringify(doc.metadata)}`);
    }
  });

  const retrievedDocs = scoreResults.map(([doc]) => doc);
  const content = retrievedDocs
    .map((doc, i) => `[片段 ${i + 1}]\n ${doc.pageContent}`)
    .join("\n----\n");
  const prompt = `
    你是一个文章辅助阅读助手，请根据以下文章内容回答问题：
    文章内容:
    ${content}

    问题: ${question}
    回答:
  `;
  const response = await model.invoke(prompt);
  console.log(`\n [AI回答]: ${response.content}`);
  console.log(response.content);
}

