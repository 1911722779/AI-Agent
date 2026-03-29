import {
  getEncodingNameForModel,
  getEncoding
} from "js-tiktoken";
// AIGC 生成的文本 要计算token 的数量 按token 不断推理生成的

const modelName = "gpt-4";
const encodingName = getEncodingNameForModel(modelName);
console.log(encodingName, '////');

const enc = getEncoding(encodingName);
// 不同语言的字符语义一样，但长度不一样，token 按语义（算力）来计算开销
console.log('apple', enc.encode('apple'),
  enc.encode('apple').length);
console.log('苹果', enc.encode('苹果'),
  enc.encode('苹果').length);
console.log('吃饭', enc.encode('吃饭'),
  enc.encode('吃饭').length);
