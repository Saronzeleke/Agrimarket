import Link from "next/link";

interface InformationalSection {
  heading: string;
  paragraphs: string[];
}

interface InformationalLink {
  label: string;
  href: string;
  external?: boolean;
}

interface InformationalPageProps {
  title: string;
  description: string;
  sections: InformationalSection[];
  links?: InformationalLink[];
}

export function InformationalPage({
  title,
  description,
  sections,
  links = [],
}: InformationalPageProps) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="container-custom py-[32px] sm:py-[40px] lg:py-[48px]">
        <nav aria-label="Breadcrumb" className="mb-[24px] flex items-center gap-[8px] text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--primary)]">Home</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-[var(--text-primary)]">{title}</span>
        </nav>

        <header className="max-w-3xl border-b border-[var(--border)] pb-[28px]">
          <p className="mb-[8px] text-sm font-semibold uppercase text-[var(--primary)]">AgriMarket</p>
          <h1 className="text-3xl font-bold leading-tight text-[var(--text-primary)]">{title}</h1>
          <p className="mt-[12px] max-w-2xl text-base leading-7 text-[var(--text-secondary)]">{description}</p>
        </header>

        <div className="mt-[28px] grid gap-[32px] lg:grid-cols-[minmax(0,680px)_minmax(200px,1fr)]">
          <article className="space-y-[24px]">
            {sections.map((section) => (
              <section key={section.heading} className="border-b border-[var(--border)] pb-[20px] last:border-0">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">{section.heading}</h2>
                <div className="mt-[8px] space-y-[12px]">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-6 text-[var(--text-secondary)]">{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </article>

          {links.length > 0 && (
            <aside aria-label="Related links" className="h-fit border-t border-[var(--border)] pt-[16px] lg:sticky lg:top-[96px] lg:border-l lg:border-t-0 lg:pl-[24px] lg:pt-0">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Explore</h2>
              <ul className="mt-[12px] space-y-[12px]">
                {links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--primary)] hover:underline">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-sm text-[var(--primary)] hover:underline">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}