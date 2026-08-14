export function StorefrontFooter({ store }: { store: { name: string } }) {
  return (
    <footer
      className="mt-auto border-t px-6 py-10"
      style={{ borderColor: "var(--store-primary, #e5e7eb)10" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 text-center">
        <p className="text-sm font-semibold">{store.name}</p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {store.name} &middot; Dibuat dengan{" "}
          <a
            href="https://mainyuk.my.id"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline-offset-2 hover:underline"
            style={{ color: "var(--store-primary)" }}
          >
            mainyuk.my.id
          </a>
        </p>
      </div>
    </footer>
  );
}
