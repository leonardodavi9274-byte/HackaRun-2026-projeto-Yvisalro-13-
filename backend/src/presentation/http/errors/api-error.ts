export type FieldError = { field: string; code: string; message: string };
export class ApiError extends Error {
 readonly statusCode: number; readonly code: string; readonly fields?: FieldError[]; readonly retryAfter?: number;
 constructor(statusCode: number, code: string, message: string, fields?: FieldError[], retryAfter?: number) {
  super(message); this.name="ApiError"; this.statusCode=statusCode; this.code=code; this.fields=fields; this.retryAfter=retryAfter;
 }
}
