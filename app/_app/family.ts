import type { createClient } from "@/lib/supabase/server";

// One row per patient_id the logged-in user controls — themselves first
// (when they have their own patient record) followed by their dependents
// ordered by creation. Painel pages use this to extend their queries from
// "= my patient_id" to "IN (mine + dependents)".

export type FamilyPerson = {
  patient_id: string;
  name: string;
  isSelf: boolean;
  relationship: string | null;
};

export const RELATIONSHIP_LABEL: Record<string, string> = {
  filho: "filho",
  filha: "filha",
  mae: "mãe",
  pai: "pai",
  irmao: "irmão",
  irma: "irmã",
  conjuge: "cônjuge",
  tutelado: "tutelado",
  outro: "familiar",
};

export async function loadPatientFamily(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<{
  ownPatientId: string | null;
  patientIds: string[];
  persons: FamilyPerson[];
}> {
  const { data: own } = await supabase
    .from("patients")
    .select("id, profile:profiles!patients_profile_id_fkey(full_name)")
    .eq("profile_id", userId)
    .maybeSingle();

  const { data: deps } = await supabase
    .from("patients")
    .select("id, full_name, relationship")
    .eq("guardian_profile_id", userId)
    .is("profile_id", null)
    .order("created_at", { ascending: true });

  const persons: FamilyPerson[] = [];
  let ownPatientId: string | null = null;

  if (own) {
    const profile = Array.isArray(own.profile) ? own.profile[0] : own.profile;
    persons.push({
      patient_id: own.id,
      name: profile?.full_name ?? "Eu",
      isSelf: true,
      relationship: null,
    });
    ownPatientId = own.id;
  }

  for (const d of deps ?? []) {
    persons.push({
      patient_id: d.id,
      name: d.full_name ?? "(sem nome)",
      isSelf: false,
      relationship: d.relationship,
    });
  }

  return {
    ownPatientId,
    patientIds: persons.map((p) => p.patient_id),
    persons,
  };
}

/** Lookup map: patient_id -> FamilyPerson. */
export function familyLookup(persons: FamilyPerson[]): Map<string, FamilyPerson> {
  return new Map(persons.map((p) => [p.patient_id, p]));
}
