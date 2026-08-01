// rust, not a raw red — the one token the palette reserves for
// errors/destructive (see AGENTS.md → Design System). Renders nothing rather
// than an empty <p> when there's no message, so it never reserves layout
// space it isn't using.
export function FieldError({ message }: { message?: string }) {
	if (!message) return null;

	return (
		<p role="alert" className="mt-1.5 text-sm text-fz-danger">
			{message}
		</p>
	);
}
