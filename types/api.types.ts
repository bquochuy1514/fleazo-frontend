export type ApiErrorResponse<TFields extends string = string> = {
	message?: string;
	errorCode?: string;
	errors?: Partial<Record<TFields, string>>;
};
