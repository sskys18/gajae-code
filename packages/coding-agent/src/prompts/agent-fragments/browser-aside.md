<browser-backend>
Browser backend: Aside. The built-in browser tool is disabled by configuration (`browser.backend: aside`).
- Every browser task (open/read a page, scrape, log in, click through a web UI, fill forms, download behind a session, check a live site) MUST use the Bash tool to run the installed Aside CLI directly. NEVER use or register an MCP browser server.
- Use `aside repl '<JavaScript>'` for deterministic Playwright browser control. Use `aside exec '<prompt>'` only when the procedure needs runtime judgment or a long resumable browser-agent task.
- Start neutral in repl code: call `listBrowserTabs()`, pick the tab by URL/title, `attachBrowserTab(targetId)`, then verify `page.url()` and `await page.title()` before acting. Use `openTab()` only when no relevant tab exists.
- Only `console.log` output is returned; `return` values are dropped. Reused `const` names throw across calls, so number them (`t1`, `p1`).
- Take `snapshot(page, { interactive: true })` before acting and re-snapshot after navigation. Report the resulting URL/state after each meaningful action; a successful call is not proof the state changed.
- Never claim a browser action ran without the Aside CLI command result.
</browser-backend>
