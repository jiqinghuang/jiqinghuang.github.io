# jiqinghuang.github.io

JQ 的个人网站 — [jiqinghuang.github.io](https://jiqinghuang.github.io/)

> 最后更新: 2026-09-18

## 页面结构

- **首页** — 个人简介与导航入口
- **关于我** — 简历、技能、工作经历、教育背景
- **项目** — 项目卡片索引页，链接到各项目详情
  - [量化交易策略系统](https://github.com/jiqinghuang/trading_strategy)（10 种趋势跟踪策略回测）
  - [保证金模型](https://github.com/jiqinghuang/margin_model)（黄金 & 白银 Wind 期货指数 VaR）
  - [前端之路：HTML / CSS 教程](project-frontend-tutorial.html)（离线优先中文前端教程，含实时练习场、无障碍指南和综合项目；[在线教程](https://jiqinghuang.github.io/html-and-css-tutorial/)）
- **投资专栏** — 交易相关文章
  - [你交易，有人在数钱](article-trading-fees.html) — 手续费复利反噬与机器学习正则化类比
  - [狼与屠夫](article-wolves-butcher.html) — 从《聊斋志异》看交易博弈的两种误判
  - [纹丝不动的艺术](article-sitting-still.html) — 大涨大跌中持有不动的好坏论证

## 特色

- **高斯积分解锁门**：联系方式用一道高斯积分题守护，答对才显示邮箱
- **中英双语**：所有页面支持中英文切换
- **响应式 + 终端风格**：JetBrains Mono + 命令提示符风首页

## 技术栈

纯静态站点：HTML5 + CSS3 + Vanilla JS，GitHub Pages 部署。无框架，无构建步骤。

## 数据更新（由本地脚本自动完成）

两个项目页的图表与数字**不手改**，由相邻仓库的同步脚本自动刷新（仅本地文件，不自动推送 Git）：

```bash
# 量化策略页：跑全部策略 → 复制图表 → 更新 project-quant-trading.html
python ../trading_strategy/update_local_website.py

# 保证金模型页：跑模型管道 → 复制图表 → 更新 project-margin-model.html
python ../margin_model/sync_to_website.py
```

- 图表写入 `assets/plots/`，**png 与 webp 成对更新**（页面 `<picture>` 以 webp 优先）
- 页面统计数字、回测表格、`<img>` 宽高由脚本替换，替换失败会报错而不是静默跳过
- 数据源为 Wind 商品期货指数 parquet，由 `trading_strategy/excel_to_parquet.py` 增量更新

## 相关项目

- **[量化交易策略系统](https://github.com/jiqinghuang/trading_strategy)** — 10 种趋势跟踪策略回测框架
- **[保证金模型](https://github.com/jiqinghuang/margin_model)** — 黄金 & 白银 Wind 期货指数 VaR 保证金计算
- **[前端之路：HTML / CSS 教程](https://github.com/jiqinghuang/html-and-css-tutorial)** — 离线优先中文前端教程；[在线教程](https://jiqinghuang.github.io/html-and-css-tutorial/)
