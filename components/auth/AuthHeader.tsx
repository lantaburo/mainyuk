import Link from "next/link";

export function AuthHeader() {
  return (
    <div className="mb-8 flex justify-center">
      <Link href="/">
        <img
          src="/logo-mark.png"
          alt="klikweb.id"
          className="h-8 w-auto"
        />
      </Link>
    </div>
  );
}
