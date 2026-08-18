import 'dotenv/config';
import app from './app.js';
import AppDataSource from './db/data-source.js';

const PORT = Number(process.env.PORT) || 8080;

AppDataSource.initialize()
  .then(() => {
    console.log('資料庫連線成功');
    app.listen(PORT, () => {
      console.log(`✅ Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('資料庫連線失敗，服務不啟動：', err.message);
    process.exit(1);
  });
