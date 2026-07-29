export function StorefrontFooter({ store }: { store: { name: string } }) {
  return (
    <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} {store.name} · Dibuat dengan klikweb.id
    </footer>
  );
}
