import { APP_TIME_ZONE } from "@/lib/dates/constants";

/** Próximos N dias na listagem do aluno (**SPT-7.1**). */
export const SESSION_LIST_HORIZON_DAYS = 7;

/** Janela rolante de geração de instâncias (**SPT-4.3**). */
export const SESSION_GENERATION_HORIZON_DAYS = 14;

/** Horas antes de `start_time` em que check-in abre (**SPT-5.1**, D3). */
export const CHECKIN_WINDOW_HOURS_BEFORE = 6;

/** Dia da semana ISO 8601: 1 = segunda … 7 = domingo (**D-F12**). */
export const ISO_WEEKDAY_MIN = 1;
export const ISO_WEEKDAY_MAX = 7;

export { APP_TIME_ZONE };
