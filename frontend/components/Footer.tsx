export function Footer({ name }: { name: string }) {
  return (
    <footer className="border-t border-line py-10">
      <p className="mx-auto max-w-5xl px-6 text-sm text-muted">
        {name} · Claremont Colleges
      </p>
    </footer>
  );
}
