# 手写cursor 最小版本
- 千问点奶茶
    互联网计算向Ai Agent 推理，运行的一个划时代的产品，更复杂，更智能，更方便。
- OpenClaw 养虾
    一人公司
    虚拟数字人，多Agent
    编程Agent（例如cursor）
- 从llm promopt engineering -> Agentic（智能） Engineering（全栈）

- AI Agent 如何打造
    - 直接调用大模型？ 只是获得智能，生成代码 （LLM）
    - 你上周和它聊得消息，记不住 （Memory）
    - 让它访问一个网页，帮你整理数据 （Tool）
    - 想让他基于公司内部的私密文档做一些解答 （RAG）
    AI Agent = LLM + Memory + Tool + RAG

# Agent 是什么
其实就是给一个大模型拓展了Tool 和 Memory，它本来就可以思考和规划，在拓展了tool能力之后，它就可以自动去做事情，用memory管理记忆，在可以管理记忆的基础上，还可以使用RAG去查询内部知识来获取知识（context）

# Tool 工具

## 用react 创建一个todolist
- 任务 期待Cursor 编程Agent 完成
- llm 思考（thinking），规划（planning） aigc 生成代码
- tool 让llm扩展 有读写文件的能力
- tool bash 执行命令

## Langchain 
AI Agent 框架 提供了memory tool rag
后端功底（node） nest.js

AI Agent 全栈开发

# LLM with Tools

- llm 选择
    qwen-coder
- tools
    [read,write，exec] 的能力
- pnpm i @langchain/openai 适配了常见的模型

- 为什么mcp 需要配置
    - cursor/trae 编程Agent 支持MCP client
    - 读取mcp.json 需要的mcp tool
- 手写MCP tool
    - Client/Server 架构
    - tool 的基础上加上MCP 规范
    - tool 需要一个server 容器 @modelcontextprotocol/mcp/server... 提供
    mcp/server... 提供
    - registerTool
        description
    - connect transport