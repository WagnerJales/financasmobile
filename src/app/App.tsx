import React, { useEffect, useMemo, useState } from "react";
import { db } from "../db/db";
import { LancamentoForm } from "../features/LancamentoForm";
import { LancamentoList } from "../features/LancamentoList";
import { buildDefaultFilters, type Filters, applyFilters } from "../features/filters";
import { Tipo, Prioridade } from "../domain/enums";
import type { Lancamento } from "../domain/lancamento";

export function App() {
  const [items, setItems] = useState<Lancamento[]>([]);
  const [filters, setFilters] = useState<Filters>(buildDefaultFilters());
  const [editing, setEditing] = useState<Lancamento | null>(null);

  async function refresh() {
    const all = await db.lancamentos.orderBy("dataVencimento").toArray();
    setItems(all);
  }

  useEffect(() => {
    refresh().catch(console.error);
  }, []);

  const filtered = useMemo(() => applyFilters(items, filters), [items, filters]);

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>Finanças (Local)</h1>
          <p className="muted">Dados ficam no seu navegador (IndexedDB). Faça backup JSON regularmente.</p>
        </div>

        <div className="headerActions">
          <button className="btn" onClick={() => { setEditing(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
            + Novo
          </button>

          <button className="btn" onClick={async () => {
            const data = await db.exportJson();
            downloadFile(`financas-backup-${new Date().toISOString().slice(0,10)}.json`, data);
          }}>
            Backup JSON
          </button>

          <label className="btn fileBtn">
            Restaurar JSON
            <input
              type="file"
              accept="application/json"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const text = await f.text();
                await db.importJson(text);
                await refresh();
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </header>

      <section className="card">
        <h2>{editing ? "Editar lançamento" : "Novo lançamento"}</h2>
        <LancamentoForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await refresh(); }}
        />
      </section>

      <section className="card">
        <h2>Filtros</h2>

        <div className="grid">
          <div className="field">
            <label>Mês Ref (YYYY-MM)</label>
            <input value={filters.mesRef ?? ""} placeholder="ex.: 2026-02"
              onChange={(e) => setFilters({ ...filters, mesRef: e.target.value.trim() || null })}
            />
          </div>

          <div className="field">
            <label>Texto (descrição)</label>
            <input value={filters.search ?? ""} placeholder="buscar..."
              onChange={(e) => setFilters({ ...filters, search: e.target.value || null })}
            />
          </div>

          <div className="field">
            <label>Tipo</label>
            <select value={filters.tipo ?? ""} onChange={(e) => setFilters({ ...filters, tipo: (e.target.value as Tipo) || null })}>
              <option value="">(todos)</option>
              <option value={Tipo.ROTINA}>ROTINA</option>
              <option value={Tipo.TEMPORARIO}>TEMPORARIO</option>
              <option value={Tipo.EXTRA}>EXTRA</option>
            </select>
          </div>

          <div className="field">
            <label>Prioridade</label>
            <select value={filters.prioridade ?? ""} onChange={(e) => setFilters({ ...filters, prioridade: (e.target.value as Prioridade) || null })}>
              <option value="">(todas)</option>
              <option value={Prioridade.NECESSIDADE}>NECESSIDADE</option>
              <option value={Prioridade.DESEJO}>DESEJO</option>
              <option value={Prioridade.SUPERFLUO}>SUPERFLUO</option>
              <option value={Prioridade.AS_3}>AS_3</option>
            </select>
          </div>

          <div className="field">
            <label>Status</label>
            <select value={filters.status ?? ""} onChange={(e) => setFilters({ ...filters, status: (e.target.value as any) || null })}>
              <option value="">(todos)</option>
              <option value="PENDENTE">PENDENTE</option>
              <option value="PAGO">PAGO</option>
              <option value="ATRASADO">ATRASADO</option>
            </select>
          </div>

          <div className="field">
            <label>Somente atrasados</label>
            <input type="checkbox" checked={filters.onlyOverdue}
              onChange={(e) => setFilters({ ...filters, onlyOverdue: e.target.checked })}
            />
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Lançamentos</h2>
        <LancamentoList
          items={filtered}
          onEdit={(it) => { setEditing(it); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          onRefresh={refresh}
        />
      </section>

      <footer className="footer muted">
        <small>Web estático no GitHub Pages. Sem login/sync. Use Backup JSON.</small>
      </footer>
    </div>
  );
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
