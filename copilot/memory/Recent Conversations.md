## 询问使用的大模型
**Time:** 2026-04-12 09:44
**Summary:** 用户多次打招呼并询问“你是哪款大模型”，对话中出现两条错误提示（Copilot Plus 许可证未配置和 400 模型不支持）。AI 说明自己是 Obsidian Copilot，具体底层模型取决于用户在 Obsidian 中安装和配置的 AI 插件。AI 还提供了查看插件设置（Settings -> Community plugins/Installed plugins，查看 Provider/Model/API）并表示可协助解读的操作步骤。

## Java9 Compact Strings 笔记整理
**Time:** 2026-04-12 09:52
**Summary:** 用户要求将关于 Java 9 将 String 内部 char[] 改为 byte[]（Compact Strings）的笔记整理成清晰知识点，AI 已重构为概述、核心知识点（存储结构、运行时策略、示例）、优点、代价与注意点及实践建议等部分。关键结论：通过 byte[] + coder（LATIN1/UTF16）在多数英文/西欧场景可显著节省内存并保持随机访问效率，但增加实现复杂度与构造判定开销，且未采用 UTF‑8 因为变长编码会影响基于索引的性能；AI 建议可补充伪代码与面试要点以替换原文。
