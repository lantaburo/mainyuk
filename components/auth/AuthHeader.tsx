import Image from "next/image";
import Link from "next/link";

export function AuthHeader() {
  return (
    <div className="mb-8 flex justify-center">
      <Link href="/">
        <Image
          src="/logo-mark.png"
          alt="klikweb.id"
          width={438}
          height={95}
          className="h-8 w-auto"
          priority
        />
      </Link>
    </div>
  );
}
