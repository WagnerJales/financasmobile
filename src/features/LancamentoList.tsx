import React from "react";
import type { Lancamento } from "../domain/lancamento";
import { computeStatus, currencyBRL } from "../domain/rules";
import { db } from "../db/db";

export function LancamentoList(props: {
  items: Lancamento[];
  onEdit: (it: Lancamento) => void;
  onRefresh: () => Promise<void>;
}) {
  const { items, onEdit, onRefresh } = props;

  async function markPaid(it: Lancamento) {
    const today = new Date().toISOString().slice(0, 10);
    await db.lancamentos.update(it.id, { dataPagamento: today, updatedAt: new Date().toISOString() });
    await onRefresh();
  }

  async function unpay(it: Lancamento) {
    await db.lancamentos.update(it.id, { dataPagamento: null, updatedAt: new Date().toISOString() });
    await onRefresh();
  }

  async function remove(it: Lancamento) {
    if (!confirm(`Excluir "${it.descricao}"?`)) return;
    await db.lancamentos.delete(it.id);
    await onRefresh();
  }

  if (!items.length) return <p className="muted">Nenhum lançamento encontrado.</p>;

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="table">
        <thead>
          <tr>
            <th>Mês</th><th>Despesa</th><th>Venc.</th><th>Pg.</th><th>Valor</th>
            <th>Tipo</th><th>Prioridade</th><th>Fonte</th><th>Modo</th>
            <th style={{ textAlign: "right" }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => {
            const st = computeStatus(it);
            const pillClass = st === "PAGO" ? "pill success" : st === "ATRASADO" ? "pill danger" : "pill warn";
            return (
              <tr key={it.id}>
                <td>{it.mesRef}</td>
                <td>
                  <div><strong>{it.descricao}</strong></div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    <span className={pillClass}>{st}</span>
                    {it.observacoes ? <> · {it.observacoes}</> : null}
                  </div>
                </td>
                <td>{it.dataVencimento}</td>
                <td>{it.dataPagamento ?? ""}</td>
                <td>{currencyBRL(it.valor)}</td>
                <td><span className="pill">{it.tipo}</span></td>
                <td><span className="pill">{it.prioridade}</span></td>
                <td>{it.fonte}</td>
                <td>{it.modo}</td>
                <td>
                  <div className="rowActions">
                    <button className="btn" onClick={() => onEdit(it)}>Editar</button>
                    {st !== "PAGO" ? (
                      <button className="btn" onClick={() => markPaid(it)}>Marcar pago</button>
                    ) : (
                      <button className="btn" onClick={() => unpay(it)}>Desfazer</button>
                    )}
                    <button className="btn" onClick={() => remove(it)}>Excluir</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
