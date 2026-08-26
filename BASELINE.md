# REQ-2026-001-004 Demo 迭代基线

- 知识状态：当前评审 Demo 基线
- 最近核验：2026-08-26
- 对应需求：REQ-2026-001、REQ-2026-002、REQ-2026-003、REQ-2026-004
- 对应 PRD：`../../requirements/prd/REQ-2026-001-004-导航与配电箱增强-PRD-V1.5-20260826.docx`
- 唯一迭代目录：`workspace/demo/REQ-2026-001-004-gvp-navigation-cabinet/`

## 后续迭代规则

1. 用户继续修改这组需求的 Demo 时，默认直接编辑本目录，不创建同名、日期版或“final”平行目录。
2. 修改前先读取本文件、`README.md`、最新 PRD 和 `context/ui-design-guidelines.md`。
3. 评审结论发生变化时，先更新最新 PRD 或需求记录，再同步 Demo；不得仅凭 Demo 把交互写成已发布事实。
4. 保持 `#navigation`、`#devices`、`#history` 三个入口兼容，除非用户明确调整信息架构。
5. 修改静态资源后同步更新 `index.html` 和 `start-demo.ps1` 中的构建标识，避免浏览器继续使用旧缓存。
6. 每次迭代同步更新 `README.md` 的覆盖范围、假设和验证记录；新增、删除或重命名文件时同步更新上级 `AGENTS.md` 索引。
7. 交付前至少验证 JavaScript 语法、PowerShell 启停脚本和本地 HTTP 资源；涉及关键交互时进行真实点击或浏览器回归。

## 固定启动入口

在本目录双击 `启动Demo.cmd`，或执行：

```powershell
.\start-demo.ps1 -OpenBrowser
```

默认地址：`http://127.0.0.1:4173/?v=20260826-cabinet-filter#navigation`

## 边界

- 这是脱敏 Mock 数据驱动的评审 Demo，不连接生产接口。
- Demo 展示产品要求和评审假设，不证明功能已经开发、测试、验收或发布。
- 未来若用户明确要求独立里程碑版本，应复制后新增版本说明，同时保留本文件对“当前基线”的唯一指向。
