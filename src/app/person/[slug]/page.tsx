import { notFound } from "next/navigation";
import { PersonProfile } from "@/components/PersonProfile";
import { findPerson, PEOPLE_BY_SLUG } from "@/lib/people";

export function generateStaticParams() {
  return [...PEOPLE_BY_SLUG.keys()].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const person = findPerson(slug);
  return { title: person ? `${person.name} — Influence Tracker` : "Influence Tracker" };
}

export default async function PersonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const person = findPerson(slug);
  if (!person) notFound();
  return <PersonProfile person={person} />;
}
