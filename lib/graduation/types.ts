export type BeltRef = {
  id: string;
  kind: "adult" | "kids";
  slug: string;
  ordinal: number;
};

export type GraduationEventInput = {
  id?: string;
  resulting_belt_id: string;
  resulting_degree: number;
  graduated_at: string;
  was_skip: boolean;
  skip_reason: string | null;
  weight_kg?: number | null;
  created_at?: string;
};
