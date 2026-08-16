# Backend

## Schema 同步方式

`.env` 的 `DB_SYNCHRONIZE` 決定怎麼把 entity 反映到資料庫：

| 值 | 行為 |
|---|---|
| `true`（預設開發） | 伺服器啟動時自動對齊 schema：加 entity、改欄位後**重啟即可建表／改表**，不會產生 migration 檔 |
| `false` | 關閉自動同步，必須自己產生並執行 migration |

用途：開發時用 `true` 省步驟；正式環境或想留下 schema 變更紀錄時改 `false`，走下方 Migration。

> 注意：`synchronize` 已建過的表，再跑 `migration:generate` 會顯示「No changes」，因為 DB 已與 entity 一致。

## Migration

當 `DB_SYNCHRONIZE=false` 時，修改 entity 後在 `backend/` 依序執行：

```bash
# 產生 migration（請把 MigrationName 改成有意義的名稱，例如 AddSoftDelete）
npx typeorm migration:generate ./db/migrations/MigrationName -d ./db/data-source.js -o --esm

# 套用到資料庫
npm run migration:run
```

還原上一次 migration：

```bash
npm run migration:revert
```
