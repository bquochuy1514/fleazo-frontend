// src/types/api.types.ts
export type ApiErrorResponse<TFields extends string = string> = {
	message?: string;
	errors?: Partial<Record<TFields, string>>;
};
