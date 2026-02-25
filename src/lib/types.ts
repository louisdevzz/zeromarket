export interface ToolEntry {
  name: string;
  description: string;
  wasm_url: string;
  manifest_url: string;
}

export interface SkillPackage {
  namespace: string;
  name: string;
  version: string;
  description: string;
  long_description?: string;
  tags: string[];
  author: string;
  homepage?: string;
  repository?: string;
  downloads: number;
  published_at: string;
  tools: ToolEntry[];
  readme?: string;
  verified?: boolean;
}

/** Shape returned by GET /api/v1/packages/:namespace/:name */
export interface RegistryPackageIndex {
  name: string;
  version: string;
  description: string;
  tools: Pick<ToolEntry, "name" | "wasm_url" | "manifest_url">[];
}
