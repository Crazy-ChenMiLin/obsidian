### 1. 正常内网域名（无 Token）

- 主域名：**[taihu-intra.company.com](https://taihu-intra.company.com/)**（intra 是 “内部” 的常用标识，company 替换为公司简称更贴合实际）
- 备选：**[taihu-internal.cn](https://taihu-internal.cn/)**（适配国内内网常用.cn 后缀，简洁易记）

### 2. 带有 Token 的内网域名（自动附加身份凭证）

Token 作为身份参数附加在域名后，而非嵌入域名主体（符合 URL 规范）：

- 格式示例 1：**[taihu-intra.company.com?token=th_corp_employee_v2](https://taihu-intra.company.com/?token=th_corp_employee_v2)**（th 对应 “太湖” 首字母，v2 标识凭证版本）
- 格式示例 2：**[taihu-internal.cn/auth?token=corporate_taihu_auth_2024](https://taihu-internal.cn/auth?token=corporate_taihu_auth_2024)**（auth 明确身份校验路径，凭证名含 “太湖” 标识）