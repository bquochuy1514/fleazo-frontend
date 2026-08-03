// rust, not a raw red — the palette's error/destructive token. Renders
// nothing (not an empty <p>) when there's no message.
export function FieldError({ message }: { message?: string }) {
	if (!message) return null;

	return (
		<p role="alert" className="mt-1.5 text-sm text-fz-danger">
			{message}
		</p>
	);
}
