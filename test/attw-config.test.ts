import { readFile } from "node:fs/promises";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import {
    attwConfigPath,
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
        expect.assertions(2);

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
});
