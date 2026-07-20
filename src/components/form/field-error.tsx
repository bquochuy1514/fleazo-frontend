// Always renders the <p>, even with no message — reserves a fixed height
// so the layout doesn't jump when an error appears/disappears between
// submits (was causing a visible jitter on repeated failed logins).
export function FieldError({ message }: { message?: string }) {
	return <p className="mt-1.5 min-h-5 text-sm text-destructive">{message}</p>;
}
