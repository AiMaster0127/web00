---
description: LP制作案件をAIチームで一気通貫で進める
argument-hint: <案件スラッグ>
---

`clients/$1/` のLP制作を開始します。

1. `clients/$1/brief.md` を読む。存在しなければ、`clients/_template/` からコピーして作るようユーザーに伝えて止まる
2. `lp-director` サブエージェントに委譲し、案件スラッグ `$1` を渡す
3. ディレクターが要件の不足を報告してきたら、**実装に進まず**、質問リストをユーザーに提示して止まる

ユーザーからの補足指示: $ARGUMENTS
