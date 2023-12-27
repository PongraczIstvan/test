//import fb from 'node-firebird';
import { FirebirdPool } from 'ts-firebird';
import Config from './fb_config';
import { pool, Database, ConnectionPool } from 'node-firebird';

function getDatabase(pool:ConnectionPool): Promise<Database> {
  return new Promise((resolve, reject) => {
    pool.get((err: any, db: Database) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(db);
    });
  });
}
function queryDatabase(db: Database): Promise<any> {
  return new Promise((resolve, reject) => {
   
      db.query('select fok_tetel.fok1 FOK, cast(sum(fok_tetel.osszeg) as numeric(15,2)) osszeg from fok_tetel group by fok_tetel.fok1',
       [], (err: any, result: any) => {
        if (err) {
          db.detach();
          reject(err);
          return;
        }        
        resolve(result);
      });
    });
  }


async function test2() {
  console.log(`Start ${new Date().toISOString()}`);  
  console.log(Config);
  const pl = pool(5, Config);

  try {
    const db = await getDatabase(pl);
    console.log('Connected to database');    
    const result = await queryDatabase(db);
    console.log('Query executed');
    console.log(result);
    db.detach();    
  } catch (err) {
    console.error('HIBA !!!');
    console.error(err);
  }
  pl.destroy();
}

async function test() {
  const pool = new FirebirdPool(5, Config);

  try{
  const tr = await pool.getTransaction();
/*
  const sql=`select fok_tetel.fok1 FOK, sum(fok_tetel.osszeg) osszeg
  from fok_tetel     
   group by fok_tetel.fok1
  `;
*/
  const sql=`select fok_tetel.fok1 FOK, fok_tukor.fok_neve, cast(sum(iif(fok_tetel.jelleg=0, fok_tetel.osszeg,0)) as numeric(15,2)) tartozik_osszeg, cast(sum(iif(fok_tetel.jelleg=1, fok_tetel.osszeg,0)) as numeric(15,2))
kovetel_osszeg,cast(sum(iif(fok_tetel.jelleg=0, fok_tetel.osszeg,-fok_tetel.osszeg)) as numeric(15,2)) egyenleg
from fok_tetel
   left outer join fok_tukor on (fok_tetel.kapcs_ev = fok_tukor.kapcs_ev) and (fok_tetel.fok1 = fok_tukor.fok)

where
   (
      (fok_tetel.kapcs_ev = ?)
   and (fok_tetel.datum between ? and ?)
   )
group by fok_tetel.fok1 , fok_tukor.fok_neve
order by fok_tetel.fok1
ROWS ? to ?`;
  // console.log(new Date('2022-01-01T00:00:00.000Z'));
    const param: any[] = ['2022',new Date('2022-01-01T00:00:00.000Z'), new Date('2022-01-31T00:00:00.000Z'), 1, 500];

    const result = await tr.query(sql, param,true);
    console.log(result);
  }
  catch(e){
    
    if (e instanceof Error) {
      console.error('Ez egy Error típusú hiba:', e.name, e.message);      
      if ('gdscode' in e) {
        console.error("gdscode:", e.gdscode);       // 335544569
      }
    } else if (e instanceof TypeError) {
      console.error('Ez egy TypeError típusú hiba:', e);
    } else {
      console.error('Ismeretlen hiba típus:', e);
    }
  } 
  //tr.commit();
  pool.destroy();
  
}
async function main() {
console.log('Start');
//await test2();
await test();

}

main();

