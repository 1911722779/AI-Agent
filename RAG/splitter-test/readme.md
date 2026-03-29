# Splitter 的理解

- loader 加载的大Document
  	paf doc 不是一个类型
- RecursiveCharacterTextSplitter
  	限定 Text类型
- splitter
  	先按照符号character 来切割 符合语义
		["。","，","？","!"]
		优先级。最优先
		chunk_size的靠近 递归的尝试，？！
		保持语义
		切断 overlap 牺牲一定的空间（chunk_size 10%） 重复

		先character 切割 再chunkSize 最后Overlap

- RAG 问题
	- 流程
	- loader
	- splitter 细节 三个参数
		父类是 TextSplitter 切割的是文本，mp3、mp4不适合切割
		一系列的子类 CharacterTextSplitter 按字符切割
			TokenTextSplitter 按token数量切割
			RecursiveTextSplitter 语义完整性特别好
			MarkdownTextSplitter 为什么属于 RecursiveTextSplitter 的zilei 
			# ## ### 标题递归

- CharacterTextSplitter 
	直接按Character separator 进行切割
- RecursiveCharacterTextSplitter
	更人性化，更努力
	尝试其他符号时，语义就弱下来了  overlap来弥补一下
