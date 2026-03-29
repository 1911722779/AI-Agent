import {
  MilvusClient,
  IndexType,
  MetricType,
  DataType,
} from '@zilliz/milvus2-sdk-node';
import 'dotenv/config';
import {
  OpenAIEmbeddings
} from '@langchain/openai';

const VECTOR_DIM = 1536;
const COLLECTION_NAME = 'ai_diary';

// .env 里应当提供：MILVUS_TOKEN / MILVUS_ADDRESS
const TOKEN = process.env.MILVUS_TOKEN;
const ADDRESS = process.env.MILVUS_ADDRESS;

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.EMBEDDING_MODEL_NAME,
  configuration: {
    baseURL: process.env.OPENAI_BASE_URL,
  },
  dimensions: VECTOR_DIM,
})

const client = new MilvusClient({
  address: ADDRESS,
  token: TOKEN,
})

// 嵌入模型，将文本转换为向量的函数封装
async function getEmbeddings(text) {
  const result = await embeddings.embedQuery(text);
  return result;
}

async function main() {
  console.log('正在链接Milvus...');
  const checkHealth = await client.checkHealth();
  if (!checkHealth.isHealthy) {
    console.error('Milvus连接失败：', checkHealth.reasons);
    return;
  }
  console.log('连接成功，集群状态正常...');

  await client.loadCollection({
    collection_name: COLLECTION_NAME,
  })

  const query = '我想看看关于户外活动的日记';

  const queryVector = await getEmbeddings(query);
  const searchResult = await client.search({
    collection_name:COLLECTION_NAME,
    vector:queryVector,
    limit:3,
    metric_type:MetricType.COSINE,
    output_fields:['id','content','date','mood','tags']
  })

  searchResult.results.forEach(result=>{
    console.log(`\n 日记ID: ${result.id}`);
    console.log(`内容: ${result.content}`);
    console.log(`日期: ${result.date}`);
    console.log(`心情: ${result.date}`);
    console.log(`标签: ${result.tags}`);
  })

  console.log('\n 搜索结果：')
  console.log(`共找到 ${ searchResult.results.length } 条相关日记`)
  

  /*
  await client.createCollection({
    collection_name: COLLECTION_NAME,
    fields: [
      {
        name: 'id', data_type: DataType.VarChar, max_length: 50, is_primary_key: true
      },
      {
        name: 'vector', data_type: DataType.FloatVector, dim: VECTOR_DIM
      },
      {
        name: 'content', data_type: DataType.VarChar, max_length: 5000
      },
      {
        // Milvus SDK 不支持 DataType.Date，这里按字符串存 yyyy-mm-dd
        name: 'date', data_type: DataType.VarChar, max_length: 20
      },
      {
        name: 'mood', data_type: DataType.VarChar, max_length: 50
      },
      {
        name: 'tags', data_type: DataType.Array, element_type: DataType.VarChar, max_capacity: 10, max_length: 50
      }
    ]
  });

  await client.createIndex({
    collection_name: COLLECTION_NAME,
    field_name: 'vector', // 常用的查询字段
    index_type: IndexType.IVF_FLAT,
    metric_type: MetricType.COSINE,
    params: {
      nlist: VECTOR_DIM,
    }
  })

  await client.loadCollection({
    collection_name: COLLECTION_NAME,
  })
  console.log('\nInsertion diary entries...');
  const diaryContents = [
    {
      id: 'diary_001',
      content: '今天天气很好，去公园散步了，心情也很不错。看到了很多美丽的风景，也拍了很多照片。',
      date: '2026-01-10',
      mood: 'happy',
      tags: ['生活', '散步']
    },
    {
      id: 'diary_002',
      content: '今天天气不好，心情也很差。工作上遇到了很多问题，心情很糟糕。',
      date: '2026-01-11',
      mood: 'sad',
      tags: ['工作', '问题']
    },
    {
      id: 'diary_003',
      content: '今天陪家人去看望外婆，聊了很多家里的趣事。回家后一起做晚饭，心里特别温暖。',
      date: '2026-01-12',
      mood: 'warm',
      tags: ['家人', '晚饭']
    },
    {
      id: 'diary_004',
      content: '周末和朋友约了咖啡，边喝边聊最近的生活。傍晚一起散步，感觉压力都放下了。',
      date: '2026-01-13',
      mood: 'relaxed',
      tags: ['朋友', '咖啡', '散步']
    },
    {
      id: 'diary_005',
      content: '今天把房间收拾得干干净净，顺便做了运动，还读了几页书。虽然有点累，但很充实、很有成就感。',
      date: '2026-01-14',
      mood: 'productive',
      tags: ['日常', '运动', '阅读']
    }
  ];

  console.log('Generation embeddings...');

  const diaryData = await Promise.all(
    diaryContents.map(async (diary) => ({
      ...diary,
      vector: await getEmbeddings(diary.content),
    }))
  );
  const insertRes = await client.insert({
    collection_name: COLLECTION_NAME,
    data: diaryData,
  })
  console.log(`插入成功： ${insertRes.insert_cnt} 条数据 `);
  */

  /*
    const data = [
      {
        vector: [0.1, 0.2, 0.3, 0.4],
        content: '这是第一条数据'
      },
      {
        vector: [0.5, 0.6, 0.7, 0.8],
        content: '这是第二条数据'
      }
    ];
  */
}


/*
async function main() {
  const client = new MilvusClient({
    address: process.env.MILVUS_ADDRESS,
    token: process.env.MILVUS_TOKEN,
  });
  console.log('正在连接Milvus...');

  const checkHealth = await client.checkHealth();
  if (!checkHealth.isHealthy) {
    console.error('Milvus连接失败', checkHealth.reasons);
    return;
  }
  console.log('连接成功，集群状态正常...');

  /*
  // table collection(表)
  const COLLECTION_NAME = 'test';
  const DIMENSION = 4; // 向量维度

  try {
    await client.createCollection({
      collection_name: COLLECTION_NAME,
      dimension: DIMENSION,
      auto_id: true,
    });
    console.log(`Collection ${COLLECTION_NAME} 创建成功...`);
    await client.createIndex({
      collection_name: COLLECTION_NAME,
      field_name: 'vector',
      index_type: IndexType.AUTOINDEX,
      metric_type: MetricType.COSINE,
    })
    console.log(`Index 创建成功...`);
  } catch (err) {
    console.log(`Collection ${COLLECTION_NAME} 已存在...`);
  }


  const data = [
    {
      vector: [0.1, 0.2, 0.3, 0.4],
      content: '这是第一条数据'
    },
    {
      vector: [0.5, 0.6, 0.7, 0.8],
      content: '这是第二条数据'
    }
  ];
  const insertRes = await client.insert({
    collection_name: COLLECTION_NAME,
    data
  });
  console.log(`插入成功 ${insertRes.IDs.length} 条数据 `);


  const searchRes = await client.search({
    collection_name: COLLECTION_NAME,
    data: [[0.1, 0.2, 0.3, 0.4]],
    limit: 1,
    output_fields: ['content'],
  })
  console.log(`搜索结果：${JSON.stringify(searchRes)}`);
  const searchRes2 = await client.search({
    collection_name: COLLECTION_NAME,
    data: [[0.5, 0.3, 0.3, 0.4]],
    limit: 1,
    output_fields: ['content'],
  })
  console.log(`搜索结果：${JSON.stringify(searchRes2)}`);
}
*/



main();