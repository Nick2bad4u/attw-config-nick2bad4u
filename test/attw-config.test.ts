import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
    attwConfigPath,
    type AttwProfile,
    attwProfiles,
    getAttwConfigPath,
    loadAttwConfig,
    parseAttwConfig,
} from "../src/attw-config.js";

describe("attw shared profiles", () => {
    it.each(attwProfiles)("loads the %s profile", async (profile) => {
        expect.assertions(5);

        const configPath = getAttwConfigPath(profile);
        const rawConfig: unknown = JSON.parse(
            await readFile(configPath, "utf8")
        );
        const config = await loadAttwConfig(profile);

        expect(path.isAbsolute(configPath)).toBe(true);
        expect(config).toStrictEqual(rawConfig);
        expect(config.profile).toBe(profile);
        expect(config.pack).toBe(true);
        expect(config).not.toHaveProperty("ignoreRules");
    });

    it("keeps .attw.json aligned with the esm-only compatibility default", async () => {
        expect.assertions(2);

        const defaultConfig: unknown = JSON.parse(
            await readFile(attwConfigPath, "utf8")
        );

        expect(path.isAbsolute(attwConfigPath)).toBe(true);
        expect(defaultConfig).toStrictEqual(await loadAttwConfig("esm-only"));
    });

    it("rejects invented profiles and shared rule suppressions", () => {
        expect.assertions(3);

        expect(() => getAttwConfigPath("cjs-only" as AttwProfile)).toThrow(
            RangeError
        );
        expect(() =>
            parseAttwConfig({ format: "auto", pack: true, profile: "cjs-only" })
        ).toThrow(TypeError);
        expect(() =>
            parseAttwConfig({
                format: "auto",
                ignoreRules: ["no-resolution"],
                pack: true,
                profile: "strict",
            })
        ).toThrow(TypeError);
    });

    it.each([
        ["esm-only", 0],
        ["node16", 1],
        ["strict", 1],
    ] as const)(
        "runs the real ATTW CLI with the %s packed-package profile",
        async (profile, expectedStatus) => {
            expect.assertions(4);

            const fixtureRoot = await mkdtemp(
                path.join(tmpdir(), "attw-config-consumer-")
            );

            try {
                const distRoot = path.join(fixtureRoot, "dist");
                await mkdir(distRoot);
                await Promise.all([
                    writeFile(
                        path.join(fixtureRoot, "package.json"),
                        `${JSON.stringify(
                            {
                                exports: {
                                    ".": {
                                        import: "./dist/index.js",
                                        types: "./dist/index.d.ts",
                                    },
                                },
                                files: ["dist"],
                                name: "attw-esm-only-consumer-fixture",
                                type: "module",
                                version: "1.0.0",
                            },
                            null,
                            2
                        )}\n`
                    ),
                    writeFile(
                        path.join(distRoot, "index.d.ts"),
                        "export declare const ok: true;\n"
                    ),
                    writeFile(
                        path.join(distRoot, "index.js"),
                        "export const ok = true;\n"
                    ),
                ]);

                const cliPath = fileURLToPath(
                    new URL(
                        "../node_modules/@arethetypeswrong/cli/dist/index.js",
                        import.meta.url
                    )
                );
                const configPath = getAttwConfigPath(profile);
                const result = spawnSync(
                    process.execPath,
                    [
                        cliPath,
                        "--config-path",
                        configPath,
                        "--quiet",
                    ],
                    {
                        cwd: fixtureRoot,
                        encoding: "utf8",
                    }
                );

                expect(result.status).toBe(expectedStatus);
                expect(result.error).toBeUndefined();
                expect(result.stderr).not.toContain(
                    "error while reading config file"
                );
                expect(configPath).toBe(getAttwConfigPath(profile));
            } finally {
                await rm(fixtureRoot, { force: true, recursive: true });
            }
        }
    );
});
