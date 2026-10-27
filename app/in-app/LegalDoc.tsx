import type { ReactNode } from "react";

type Section = { id?: string; title: string; content: ReactNode | null; list: ReactNode[] | null };

/** A legal page as the mobile app shows it: the app bar already has the
 *  page name, so this is just the text. */
export default function LegalDoc({
  title,
  effective,
  intro,
  sections,
}: {
  title: string;
  effective: string;
  intro: string;
  sections: Section[];
}) {
  return (
    <main className="ia-doc">
      <h1>{title}</h1>
      <p className="ia-date">Effective date: {effective}</p>
      <p className="ia-intro">{intro}</p>
      {sections.map((s) => (
        <section key={s.id ?? s.title} id={s.id} className="ia-sec">
          <h2>{s.title}</h2>
          {s.content && <p>{s.content}</p>}
          {s.list && (
            <ul>
              {s.list.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </main>
  );
}
