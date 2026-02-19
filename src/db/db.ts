import Dexie, { type Table } from "dexie";
import type { Lancamento } from "../domain/lancamento";
import { DB_NAME, DB_VERSION, LANCAMENTOS_SCHEMA } from "./schema";

class FinancasDB extends Dexie {
  lancamentos!: Table<Lancamento, string>;

  constructor() {
    super(DB_NAME);
    this.version(DB_VERSION).stores({
      lancamentos: LANCAMENTOS_SCHEMA,
    });
  }

  async exportJson(): Promise<string> {
    const lancamentos = await this.lancamentos.toArray();
    return JSON.stringify(
      { exportedAt: new Date().toISOString(), version: DB_VERSION, lancamentos },
      null,
      2
    );
  }

  async importJson(jsonText: string): Promise<void> {
    const parsed = JSON.parse(jsonText) as { lancamentos?: Lancamento[] };
    const lancamentos = parsed.lancamentos ?? [];

    await this.transaction("rw", this.lancamentos, async () => {
      await this.lancamentos.clear();
      if (lancamentos.length) await this.lancamentos.bulkPut(lancamentos);
    });
  }
}

export const db = new FinancasDB();
