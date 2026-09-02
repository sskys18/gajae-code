import type { SourceMeta } from "../../capability/types";
import type { MCPServerConfig } from "../../runtime-mcp/types";
import type { AsideCliProbe } from "../../slash-commands/helpers/aside";

type McpSourceMeta = Pick<SourceMeta, "provider" | "providerName" | "level">;

export interface AsideBrowserBackendResult {
	configs: Record<string, MCPServerConfig>;
	sources: Record<string, McpSourceMeta>;
	warning?: string;
}

/**
 * Adds the Aside MCP server when the Aside browser backend is selected.
 * An omitted probe represents the native backend or an existing user registration.
 */
export function applyAsideBrowserBackend(
	configs: Record<string, MCPServerConfig>,
	sources: Record<string, McpSourceMeta>,
	probe: AsideCliProbe | undefined,
): AsideBrowserBackendResult {
	if (probe === undefined || configs.aside !== undefined) return { configs, sources };

	if (!probe.ok) {
		return {
			configs,
			sources,
			warning: `browser.backend is "aside" but the Aside CLI was not found (searched: ${probe.searched.join(", ")}). Install it: ${probe.manualInstallCommand}. No browser tool is available this session.`,
		};
	}

	return {
		configs: {
			...configs,
			aside: { type: "stdio", command: probe.path, args: ["mcp"] },
		},
		sources: {
			...sources,
			aside: { provider: "native", providerName: "GJC browser.backend", level: "user" },
		},
	};
}
