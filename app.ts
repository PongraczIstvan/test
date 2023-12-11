//import fb from 'node-firebird';
import Config from './fb_config';
import { pool } from 'node-firebird';
function queryDatabase(pool: any): Promise<any> {
  return new Promise((resolve, reject) => {
    pool.get((err: any, db: any) => {
      if (err) {
        reject(err);
        return;
      }

      db.query('SELECT * FROM AFA_KODOK order by 1 DESC', [], (err: any, result: any) => {
        if (err) {
          db.detach();
          reject(err);
          return;
        }

        db.detach();
        resolve(result);
      });
    });
  });
}

async function test() {
  console.log(`Start ${new Date().toISOString()}`);  
  const pl = pool(5, Config);

  try {
    const result = await queryDatabase(pl);
    console.log(result);
    pl.destroy();
  } catch (err) {
    console.error('HIBA !!!');
    console.error(err);
    pl.destroy();
  }
}

test();
