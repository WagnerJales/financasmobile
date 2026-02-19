export enum Tipo {
  ROTINA = "ROTINA",
  TEMPORARIO = "TEMPORARIO",
  EXTRA = "EXTRA",
}

export enum Prioridade {
  NECESSIDADE = "NECESSIDADE",
  DESEJO = "DESEJO",
  SUPERFLUO = "SUPERFLUO",
  AS_3 = "AS_3",
}

export type Status = "PENDENTE" | "PAGO" | "ATRASADO";
