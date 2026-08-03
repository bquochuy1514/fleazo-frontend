import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Official Google "G" mark paths — not redrawn or recolored (brand-asset rule).
function GoogleIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 20 20" className={className} aria-hidden="true">
			<path
				fill="#4285F4"
				d="M19.6 10.23c0-.68-.06-1.36-.17-2H10v3.79h5.4a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.9-1.75 2.97-4.32 2.97-7.31Z"
			/>
			<path
				fill="#34A853"
				d="M10 20c2.7 0 4.96-.89 6.62-2.42l-3.23-2.5c-.9.6-2.05.96-3.39.96-2.6 0-4.8-1.76-5.59-4.12H1.06v2.59A10 10 0 0 0 10 20Z"
			/>
			<path
				fill="#FBBC05"
				d="M4.41 11.92A5.99 5.99 0 0 1 4.09 10c0-.67.11-1.32.32-1.92V5.49H1.06A10 10 0 0 0 0 10c0 1.61.39 3.14 1.06 4.51l3.35-2.59Z"
			/>
			<path
				fill="#EA4335"
				d="M10 3.96c1.47 0 2.79.5 3.82 1.5l2.87-2.87C14.95.98 12.7 0 10 0 6.09 0 2.71 2.24 1.06 5.49l3.35 2.6C5.2 5.72 7.4 3.96 10 3.96Z"
			/>
		</svg>
	);
}

// Exported so (auth)/google-callback/page.tsx reads/clears the same key.
export const POST_LOGIN_NEXT_KEY = 'fz:post-login-next';

// Real navigation (<a>, not next/link): must leave the app for Google's
// consent screen and return via server redirect. Closes at (auth)/google-callback.
export function GoogleAuthButton({
	// Where ProtectedGuard sent the visitor to /dang-nhap from, if anywhere.
	// Stored in sessionStorage (not a query param) since this round trip
	// leaves the app for Google and back; google-callback reads/clears it.
	next,
}: {
	next?: string | null;
}) {
	const googleLoginUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`;

	return (
		<a
			href={googleLoginUrl}
			onClick={() => {
				if (next) sessionStorage.setItem(POST_LOGIN_NEXT_KEY, next);
			}}
			className={cn(
				buttonVariants({ variant: 'outline' }),
				'h-11 w-full gap-2.5 text-[15px]',
			)}
		>
			<GoogleIcon className="size-[18px]" />
			Đăng nhập với Google
		</a>
	);
}
