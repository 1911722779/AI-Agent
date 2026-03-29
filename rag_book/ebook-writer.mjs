import "dotenv/config";
import { parse } from 'path';
import {
  MilvusClient,
  DataType,
  MetricType,
  IndexType,
} from '@zilliz/milvus2-sdk-node';
import {
  OpenAIEmbeddings
} from '@langchain/openai';
import {
  EPubLoader
} from '@langchain/community/document_loaders/fs/epub';
import {
  RecursiveCharacterTextSplitter
} from '@langchain/textsplitters';

const COLLECTION_NAME = 'ebook_copy';
const VECTION_DIM = 1024;
const CHUNK_SIZE = 200;
const CHUNK_OVERLAP = 50;
const EPUB_FILE = './天龙八部.epub';

const ADDRESS = process.env.MILVUS_ADDRESS;
const TOKEN = process.env.MILVUS_TOKEN;

const BOOK_NAME = parse(EPUB_FILE).name;
console.log(BOOK_NAME);

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

async function ensureBookCollection(bookId) {
  try {
    const hasCollection = await client.hasCollection({
      collection_name: COLLECTION_NAME,
    })
    if (!hasCollection.value) {
      console.log(`${COLLECTION_NAME} 集合不存在，创建集合`);
      // Milvus 需要调用 createCollection 才会真正创建集合
      await client.createCollection({
        collection_name: COLLECTION_NAME,
        // schema
        fields: [
          { name: 'id', data_type: DataType.VarChar, max_length: 100, is_primary_key: true },
          { name: 'book_id', data_type: DataType.VarChar, max_length: 100 },
          { name: 'book_name', data_type: DataType.VarChar, max_length: 100 },
          { name: 'chapter_num', data_type: DataType.Int32 },
          { name: 'index', data_type: DataType.Int32 },
          { name: 'content', data_type: DataType.VarChar, max_length: 10000 },
          { name: 'vector', data_type: DataType.FloatVector, dim: VECTION_DIM },
        ],
      });
      console.log('集合创建成功');
      await client.createIndex({
        collection_name: COLLECTION_NAME,
        field_name: 'vector',
        index_type: IndexType.IVF_FLAT,
        metric_type: MetricType.COSINE,
        params: {
          nlist: VECTION_DIM,
        }
      });
      console.log('索引创建成功');
    }
    try {
      await client.loadCollection({
        collection_name: COLLECTION_NAME,
      });
      console.log('集合加载成功');
    } catch (err) {
      console.log('集合已处于加载状态');
    }
  } catch (err) {
    console.error('创建集合失败', err.message);
    throw err;
  }
}

async function loadAndProcessEPubStreaming(bookId) {
  try {
    console.log('开始加载EPUN 文件');
    const loader = new EPubLoader(
      EPUB_FILE,
      {
        // 是否拆分章节
        splitChapters: true
      }
    );
    const documents = await loader.load();
    // 切割器 切割文档
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP,
      // 默认 \n\n 段落换行 \n 换行符 。 ，
      // separators: ['。', '，', '！', '？']
    });
    let totalInserted = 0;
    for (let chapterIndex = 0; chapterIndex < documents.length; chapterIndex++) {
      const chapter = documents[chapterIndex];
      const chapterContent = chapter.pageContent;
      console.log(`正在处理第${chapterIndex + 1}/${documents.length}章`);
      const chunks = await textSplitter.splitText(chapterContent);
      console.log(`拆分为${chunks.length}个片段`);
      if (chunks.length === 0) {
        console.log('没有拆分出任何片段，跳过空章节\n');
        continue;
      }
      console.log('生成向量并插入中...');
      const insertedCount = await insertChunkBatch(chunks, bookId, chapterIndex + 1);
      totalInserted += insertedCount;
      console.log(`本章插入 ${insertedCount} 个片段，累计 ${totalInserted} 个片段`);
    }
    console.log(`全部章节处理完成，累计插入 ${totalInserted} 个片段`);
    return totalInserted;
  } catch (err) {
    console.error('加载EPUN 文件失败', err.message);
    throw err;
  }
}

async function insertChunkBatch(chunks, bookId, chapterNum) {
  try {
    if (chunks.length === 0) {
      return 0;
    }
    // 性能优化 embedding 并发
    // 返回结果是符合 schema 的数组
    const insertData = await Promise.all(
      chunks.map(async (chunk, chunkIndex) => {
        const vector = await getEmbedding(chunk);
        // 生成唯一id 返回一个对象
        return {
          id: `${bookId}-${chapterNum}-${chunkIndex}`,
          book_id: bookId,
          book_name: BOOK_NAME,
          chapter_num: chapterNum,
          index: chunkIndex,
          content: chunk,
          vector
        }
      })
    )
    const insertResult = await client.insert({
      collection_name: COLLECTION_NAME,
      data: insertData,
    })
    return Number(insertResult.insert_cnt) || 0;
  } catch (err) {
    console.log('插入片段失败：', err?.message ?? err);
    throw err;
  }
}

async function main() {
  try {
    console.log('电子书处理');
    console.log('连接milvus');
    await client.connectPromise;
    console.log('连接成功');

    const bookId = 1;
    await ensureBookCollection(bookId);
    await loadAndProcessEPubStreaming(bookId);
  } catch (err) {
    console.error('ebook-writer 运行失败：', err?.message ?? err);
  }
}

main();