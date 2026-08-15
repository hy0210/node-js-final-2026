import dataSource from './data-source.js';
import Package from '../entities/Package.js';
import Skill from '../entities/Skill.js';

/** 清空：被 FK 指著的表最後刪
 *  不用 clear()（TRUNCATE 會被 FK 擋）、不用 delete({})（TypeORM 拒絕空條件）。 */
async function clearAll() {
  for (const name of ['Package', 'Skill']) {
    if (dataSource.hasMetadata(name)) {
      await dataSource.createQueryBuilder().delete().from(name).execute();
    }
  }
}

async function main() {
  await dataSource.initialize();
  await clearAll();

  const skillRepo = dataSource.getRepository(Skill);
  const packageRepo = dataSource.getRepository(Package);

  // 先種一些基礎資料
  await skillRepo.save([{ name: '重訓' }, { name: '瑜珈' }]);

  await packageRepo.save([
    { name: '7 堂組合包方案', credit_amount: 7, price: 1000 },
    { name: '14 堂組合包方案', credit_amount: 14, price: 2000 },
  ]);

  console.log('🌱 seed 完成');
  await dataSource.destroy();
}

main().catch((e) => {
  console.error('seed 失敗：', e.message);
  process.exit(1);
});
