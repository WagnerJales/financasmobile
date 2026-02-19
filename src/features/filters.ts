import type { Prioridade, Tipo, Status } from "../domain/enums";
import type { Lancamento } from "../domain/lancamento";
import { computeStatus } from "../domain/rules";

export type Filters = {
  mesRef: string | null;
  search: string | null;
  tipo: Tipo | null;
  prioridade: Prioridade | null;
  status: Status | null;
  onlyOverdue: boolean;
};

export function buildDefaultFilters(): Filters {
  return { mesRef: null, search: null, tipo: null, prioridade: null, status: null, onlyOverdue: false };
}

export function applyFilters(items: Lancamento[], f: Filters): Lancamento[] {
  const q = (f.search ?? "").trim().toLowerCase();

  return items.filter((it) => {
    if (f.mesRef && it.mesRef !== f.mesRef) return false;
    if (f.tipo && it.tipo !== f.tipo) return false;
    if (f.prioridade && it.prioridade !== f.prioridade) return false;

    const st = computeStatus(it);
    if (f.onlyOverdue && st !== "ATRASADO") return false;
    if (f.status && st !== f.status) return false;

    if (q) {
      const hay = `${it.descricao} ${it.fonte} ${it.modo} ${it.observacoes ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
