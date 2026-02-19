import React, { useMemo, useState } from "react";
import { db } from "../db/db";
import { Tipo, Prioridade } from "../domain/enums";
import type { Lancamento } from "../domain/lancamento";

export function LancamentoForm(props: {
  initial: Lancamento | null;
  onSaved: () => Promise<void>;
  onCancel: () => void;
}) {
  const isEdit = !!props.initial;

  const [mesRef, setMesRef] = useState(props.initial?.mesRef ?? defaultMesRef());
  const [descricao, setDescricao] = useState(props.initial?.descricao ?? "");
  const [dataVencimento, setDataVencimento] = useState(props.initial?.dataVencimento ?? todayISO());
  const [dataPagamento, setDataPagamento] = useState(props.initial?.dataPagamento ?? "");
  const [valor, setValor] = useState(String(props.initial?.valor ?? ""));
  const [tipo, setTipo] = useState<Tipo>(props.initial?.tipo ?? Tipo.ROTINA);
  const [prioridade, setPrioridade] = useState<Prioridade>(props.initial?.prioridade ?? Prioridade.NECESSIDADE);
  const [fonte, setFonte] = useState(props.initial?.fonte ?? "NUBANK");
  const [modo, setModo] = useState(props.initial?.modo ?? "PIX");
  const [observacoes, setObservacoes] = useState(props.initial?.observacoes ?? "");
  const [error, setError] = useState<string | null>(null);

  const parsedValor = useMemo(() => parseBRLNumber(valor), [valor]);

  async function save() {
    setError(null);

    if (!mesRefMatch(mesRef)) return setError("MES REF inválido. Use YYYY-MM (ex.: 2026-02).");
    if (!descricao.trim()) return setError("DESPESA (descrição) é obrigatória.");
    if (!dateISO(dataVencimento)) return setError("DATA VENC inválida.");
    if (dataPagamento && !dateISO(dataPagamento)) return setError("DATA PG inválida.");
    if (!Number.isFinite(parsedValor) || parsedValor <= 0) return setError("Valor inválido (> 0).");

    const now = new Date().toISOString();

    if (isEdit && props.initial) {
      await db.lancamentos.update(props.initial.id, {
        mesRef,
        descricao: descricao.trim(),
        dataVencimento,
        dataPagamento: dataPagamento ? dataPagamento : null,
        valor: parsedValor,
        tipo,
        prioridade,
        fonte: fonte.trim() || "N/A",
        modo: modo.trim() || "N/A",
        observacoes: observacoes.trim() || null,
        updatedAt: now,
      });
    } else {
      const item: Lancamento = {
        id: crypto.randomUUID(),
        mesRef,
        descricao: descricao.trim(),
        dataVencimento,
        dataPagamento: dataPagamento ? dataPagamento : null,
        valor: parsedValor,
        tipo,
        prioridade,
        fonte: fonte.trim() || "N/A",
        modo: modo.trim() || "N/A",
        observacoes: observacoes.trim() || null,
        createdAt: now,
        updatedAt: now,
      };
      await db.lancamentos.add(item);
    }

    await props.onSaved();
  }

  return (
    <div>
      {error ? <p style={{ color: "#b00020", marginTop: 0 }}><strong>Erro:</strong> {error}</p> : null}

      <div className="grid">
        <div className="field">
          <label>MES REF (YYYY-MM)</label>
          <input value={mesRef} onChange={(e) => setMesRef(e.target.value)} />
        </div>

        <div className="field">
          <label>DESPESA (descrição)</label>
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </div>

        <div className="field">
          <label>R$ (valor)</label>
          <input inputMode="decimal" placeholder="ex.: 150.00" value={valor} onChange={(e) => setValor(e.target.value)} />
        </div>

        <div className="field">
          <label>DATA VENC</label>
          <input type="date" value={dataVencimento} onChange={(e) => setDataVencimento(e.target.value)} />
        </div>

        <div className="field">
          <label>DATA PG (opcional)</label>
          <input type="date" value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)} />
        </div>

        <div className="field">
          <label>TIPO</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value as Tipo)}>
            <option value={Tipo.ROTINA}>ROTINA</option>
            <option value={Tipo.TEMPORARIO}>TEMPORARIO</option>
            <option value={Tipo.EXTRA}>EXTRA</option>
          </select>
        </div>

        <div className="field">
          <label>PRIORIDADE</label>
          <select value={prioridade} onChange={(e) => setPrioridade(e.target.value as Prioridade)}>
            <option value={Prioridade.NECESSIDADE}>NECESSIDADE</option>
            <option value={Prioridade.DESEJO}>DESEJO</option>
            <option value={Prioridade.SUPERFLUO}>SUPERFLUO</option>
            <option value={Prioridade.AS_3}>AS_3</option>
          </select>
        </div>

        <div className="field">
          <label>FONTE</label>
          <input value={fonte} onChange={(e) => setFonte(e.target.value)} placeholder="ex.: NUBANK" />
        </div>

        <div className="field">
          <label>MODO</label>
          <input value={modo} onChange={(e) => setModo(e.target.value)} placeholder="ex.: PIX" />
        </div>

        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label>Observações</label>
          <input value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="opcional" />
        </div>
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn" onClick={save}>{isEdit ? "Salvar alterações" : "Adicionar"}</button>
        {isEdit ? <button className="btn" onClick={props.onCancel}>Cancelar edição</button> : null}
      </div>
    </div>
  );
}

function todayISO() { return new Date().toISOString().slice(0, 10); }
function defaultMesRef() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function mesRefMatch(s: string) { return /^\d{4}-(0[1-9]|1[0-2])$/.test(s.trim()); }
function dateISO(s: string) { return /^\d{4}-\d{2}-\d{2}$/.test(s); }

function parseBRLNumber(input: string): number {
  const raw = input.trim();
  if (!raw) return NaN;

  const hasComma = raw.includes(",");
  const hasDot = raw.includes(".");
  let normalized = raw;

  if (hasComma && hasDot) {
    const lastComma = raw.lastIndexOf(",");
    const lastDot = raw.lastIndexOf(".");
    const decSep = lastComma > lastDot ? "," : ".";
    const thouSep = decSep === "," ? "." : ",";
    normalized = raw.split(thouSep).join("").replace(decSep, ".");
  } else if (hasComma && !hasDot) {
    normalized = raw.replace(/\./g, "").replace(",", ".");
  } else {
    normalized = raw.replace(/,/g, "");
  }

  const n = Number(normalized);
  return Number.isFinite(n) ? n : NaN;
}
