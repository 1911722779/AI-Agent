# RAG

- llm 的知识来源
训练的时候会给它数据集。
- llm 的幻觉
问了llm 不知道的问题时，它会认真地胡乱回答，这就是llm 的幻觉。
- RAG 可以解决llm 的幻觉。
  - llm 会自己thinking planning
  - RAG类似于临时抱佛脚的检索增强
  - Augument Promopt
  - 如果没有匹配到问题相关内容，就回复不知道

## RAG

- Retriever
  - 原始的promopt embedding
  - 知识库 提前嵌入(embedding) 好了的
  - cosine 相识度计算
- 知识库
  - 专家知识库
  - 企业私有/安全知识库
  - 各种类型的文件，txt pdf MP3 video
  - 大的文件进行切片，document 文档碎片
  - embedding化
- Augumented 增强
  - 原始的Prompt 基础上 增加检索出来的几段相关文档
- Generation 生成
  - llm 拿到增强过的promopt 再进行解答

## 向量表达

- 关键词的文本匹配不能实现语义搜索
  - 查询文中提到的水果？ 苹果、香蕉、荔枝等
- 向量 Vector [0.1,0.2,0.3......]  
  - 用数字表达一个存储的信息
- 语义搜索的流程
  - 向量每个维度有独特的语义（实用性、硬度等特性）
  - 可视化 空间
  - cosine 计算
  

