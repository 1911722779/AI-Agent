# MCP(Model Context Protocol 模型上下文协议)                    

- llm with tools

    构建了 read write listtDirectory exec tool
    llm + tools = Agent

 
- mini-cursor
    MCP with tools 不太满意
    大厂将自己的服务以mcp 的方式向外提供
    - 集成第三方mcp 服务，mcp其实就是tool
    - ndoe 调用java/python/rust 等其他语言的tool 
    - 远程的tool
    
## MCP  Anthorpic
就是tool，
Model Context Protocol Anthorpic
在大量的将本地，跨语言、第三方的tool 集成到Agent 里来的时候，让llm 强大的同时，也会带来一定的复杂性（对接连调）
让大家都按一个约定来

## MCP 协议来开发，将我们的服务或资源输出出去

## MCP 协议 还有通信部分
    - stdio 本地命令行
    - http 远程调用

## MCP 最大的特点就是可以跨进程调用工具
    - 子进程 node:child-process
    - 跨进程 java/rust
    - 远程进程 
    目的都是让llm 完成更强大的任务
    繁杂（本地、跨语言、跨部门、远程）不同的通信方式（stdio，http）
    规范的提供工具和资源

## 编写满足mcp 协议规范的Tool

- Model Context Protocol
    tool result , ToolMessage Context 上下文
- Anthorpic 24年底发布 25年底贡献给开源社区
- sdk @modelcontextprotocol/sdk 

## mcp 三者关系
- mcp hosts 
    cursor/vite Agent host
- mcp clients
    mcp 规范的tools
- mcp server
    mcp tool 运行的服务器容器
    
- 工作流程
    - MCP hosts 配置文件 SDD
    - initialize 发送一起请求
        得到mcp server 提供的tools 列表和详细
    - host prompt 任务
    - 检索mcp 配置文件
    - client tool 通信方式
    - mcp server 执行并返回结果
    - llm ToolMessage

## MCP 开发流程
- new McpServer 创建了mcp server 实例
- server.register Tool/Resource/Prompt 名字，描述，函数
- 通信方式 StdioServerTransport HttpServerTransport
- server.connect(transport)
- host mcp 配置

## mcp 直接入住Agent 程序

- 怎么把mcp tools 集成到程序里面
    mcp 是可拔插的