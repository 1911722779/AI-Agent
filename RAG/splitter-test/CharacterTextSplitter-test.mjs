import "dotenv/config";
import {
  CharacterTextSplitter,
  RecursiveCharacterTextSplitter
} from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
// 日志文档
const logDocument = new Document({
  pageContent: `
  （日志文本内容，按字符进行切割）
  `,
  metadata: {
    source: "CharacterTextSplitter-test",
    tag: "log",
    testcase: "CharacterTextSplitter"
  }
});

const logSplitter = new CharacterTextSplitter({
  separators: ["\n","。","，"],
  chunkSize: 200,
  chunkOverlap: 20,
});

const logChunks = await logSplitter.splitDocuments(logDocument);
console.log(logChunks);

const enc  = getEncoding("cl100k_base");
splitDocuments.forEach(doc=>{
  console.log(doc);
  console.log('character length',doc.pageContent.length);
  console.log('token length',enc.encode(doc.pageContent).length);
})