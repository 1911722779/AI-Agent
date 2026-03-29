import "dotenv/config";
import {
  MilvusClient,
  DataType,
  MetricType,
  IndexType,
} from '@zilliz/milvus2-sdk-node';
import {
  OpenAIEmbeddings
} from '@langchain/openai';

const ADDRESS = process.env.MILVUS_ADDRESS;
const TOKEN = process.env.MILVUS_TOKEN;
const COLLECTION_NAME = 'ebook_copy';
const VECTION_DIM = 1024;

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDING_MODEL_NAME,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
  dimensions: VECTION_DIM,
})

const client = new MilvusClient({
  address: ADDRESS,
  token: TOKEN,
})

async function getEmbedding(text) {
  const result = await embeddings.embedQuery(text);
  return result;
}

async function main() {
  try {
    console.log('Connection to Milvus...');
    await client.connectPromise;
    try {
      await client.loadCollection({
        collection_name: COLLECTION_NAME,
      })
    } catch (err) {
      console.log('Collection is already loaded');
    }
    const query = '段誉会什么武功？';
    const queryVector = await getEmbedding(query);
    const searchResult = await client.search({
      collection_name: COLLECTION_NAME,
      vector: queryVector,
      limit: 3,
      metric_type: MetricType.COSINE,
      output_fields: ['id', 'book_id', 'book_name', 'chapter_num', 'index', 'content'],
    })

    searchResult.results.forEach((Item, index) => {
      console.log(`\n 第 ${index + 1}个结果：Score: ${Item.score.toFixed(2)}`);
      console.log(`ID: ${Item.id}`);
      console.log(`Book ID: ${Item.book_id}`);
      console.log(`Book Name: ${Item.book_name}`);
      console.log(`Chapter Number: ${Item.chapter_num}`);
      console.log(`Index: ${Item.index}`);
      console.log(`Content: ${Item.content}`);
    })
  }
  catch (err) {
    console.error('Connection to Milvus failed:', err.message);
  }
}

main();