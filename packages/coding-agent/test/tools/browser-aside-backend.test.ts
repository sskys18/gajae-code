import { describe, expect, test } from "bun:test";
import type { SourceMeta } from "../../src/capability/types";
import type { MCPServerConfig } from "../../src/runtime-mcp/types";
import type { AsideCliProbe } from "../../src/slash-commands/helpers/aside";
import { applyAsideBrowserBackend } from "../../src/tools/browser/aside-backend";

type McpSourceMeta = Pick<SourceMeta, "provider" | "providerName" | "level">;

const sources: Record<string, McpSourceMeta> = {
	existing: { provider: "native", providerName: "Existing", level: "user" },
};

function unavailableProbe(): AsideCliProbe {
	return {
		ok: false,
		searched: ["/Users/test/.local/bin/aside", "PATH (aside)"],
		manualInstallCommand: "curl -fsSL https://releases.aside.com/install.sh | bash",
		url: "https://releases.aside.com/install.sh",
	};
}

describe("applyAsideBrowserBackend", () => {
	test("leaves conventional registrations untouched for the native backend", () => {
		const configs: Record<string, MCPServerConfig> = {
			filesystem: { type: "stdio", command: "filesystem" },
		};

		const result = applyAsideBrowserBackend(configs, sources, undefined);

		expect(result.configs).toBe(configs);
		expect(result.sources).toBe(sources);
		expect(result.warning).toBeUndefined();
	});

	test("injects the Aside MCP server when its CLI is available", () => {
		const result = applyAsideBrowserBackend({}, {}, { ok: true, path: "/opt/homebrew/bin/aside" });

		expect(result.configs.aside).toEqual({
			type: "stdio",
			command: "/opt/homebrew/bin/aside",
			args: ["mcp"],
		});
		expect(result.sources.aside).toEqual({ provider: "native", providerName: "GJC browser.backend", level: "user" });
	});

	test("preserves an existing user Aside registration", () => {
		const userAside: MCPServerConfig = { type: "stdio", command: "/custom/aside", args: ["mcp", "--custom"] };
		const configs = { aside: userAside };

		const result = applyAsideBrowserBackend(configs, sources, unavailableProbe());

		expect(result.configs.aside).toBe(userAside);
		expect(result.warning).toBeUndefined();
	});

	test("warns without a browser fallback when the Aside CLI is unavailable", () => {
		const probe = unavailableProbe();
		if (probe.ok) throw new Error("Expected unavailable Aside probe");
		const result = applyAsideBrowserBackend({}, {}, probe);

		expect(result.configs.aside).toBeUndefined();
		expect(result.warning).toContain('browser.backend is "aside"');
		expect(result.warning).toContain(probe.manualInstallCommand);
	});
});
