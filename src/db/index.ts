import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'watchlist.db');

let sqlDb: SqlJsDatabase | null = null;

function saveDb() {
  if (sqlDb) {
    const data = sqlDb.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

export async function getDb(): Promise<SqlJsDatabase> {
  if (sqlDb) return sqlDb;

  const SQL = await initSqlJs();
  if (fs.existsSync(dbPath)) {
    const filebuffer = fs.readFileSync(dbPath);
    sqlDb = new SQL.Database(filebuffer);
  } else {
    sqlDb = new SQL.Database();
  }

  // Foreign keys support
  sqlDb.exec('PRAGMA foreign_keys = ON;');
  return sqlDb;
}

export function initDatabaseSync() {
  // Sync initializer for server startup
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (sqlDb && fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    sqlDb.exec(schemaSql);
    saveDb();
  }
}

export class DBWrapper {
  private static instance: SqlJsDatabase;

  static setDb(database: SqlJsDatabase) {
    this.instance = database;
  }

  static getDbInstance(): SqlJsDatabase {
    if (!this.instance) {
      throw new Error('Database not initialized. Call initDb() first.');
    }
    return this.instance;
  }

  static exec(sql: string) {
    const db = this.getDbInstance();
    db.exec(sql);
    saveDb();
  }

  static prepare(sql: string) {
    const db = this.getDbInstance();
    return {
      get: (...params: any[]) => {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        let result: any = null;
        if (stmt.step()) {
          result = stmt.getAsObject();
        }
        stmt.free();
        return result;
      },
      all: (...params: any[]) => {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const results: any[] = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },
      run: (...params: any[]) => {
        db.run(sql, params);
        let lastInsertRowid = 0;
        try {
          const res = db.exec('SELECT last_insert_rowid() as id');
          if (res && res.length > 0 && res[0].values && res[0].values.length > 0) {
            lastInsertRowid = Number(res[0].values[0][0]);
          }
        } catch (e) {
          console.error('Error getting last_insert_rowid:', e);
        }
        saveDb();
        return { lastInsertRowid };
      }
    };
  }
}

export const db = DBWrapper;
