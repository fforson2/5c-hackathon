const links = [
  ["Tracks", "#tracks"],
  ["Prizes", "#prizes"],
  ["Schedule", "#schedule"],
  ["FAQ", "#faq"],
  ["Teams", "#teams"],
] as const;

export function Header({ name }: { name: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="#top" className="font-semibold tracking-tight">
          {name}
        </a>
        <nav aria-label="Primary" className="flex items-center gap-5 text-sm">
          <ul className="hidden gap-5 text-muted sm:flex">
            {links.map(([label, href]) => (
              <li key={href}>
                <a href={href} className="transition-colors hover:text-fg">
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#register" className="underline decoration-accent underline-offset-4 hover:text-accent">
            Register
          </a>
        </nav>
      </div>
    </header>
  );
}
