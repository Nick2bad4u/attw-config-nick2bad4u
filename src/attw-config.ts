import type { UnknownRecord } from "type-fest";

import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { arrayJoin, keyIn } from "ts-extras";

/** Shape shared by the package-owned ATTW profile files. */
export interface AttwConfig {
    readonly format: "auto";
    readonly pack: true;
    readonly profile: AttwProfile;
}

/** Official ATTW analysis profiles supported by the package. */
export type AttwProfile =
    | "esm-only"
    | "node16"
    | "strict";

/** All public ATTW variants. */
export const attwProfiles: readonly AttwProfile[] = Object.freeze([
    "esm-only",
    "node16",
    "strict",
]);

/** Absolute path to the backwards-compatible default `.attw.json`. */
export const attwConfigPath: string = fileURLToPath(
    new URL("../.attw.json", import.meta.url)
);

const profilePaths: Readonly<Record<AttwProfile, string>> = {
    "esm-only": fileURLToPath(
        new URL("../profiles/esm-only.json", import.meta.url)
    ),
    node16: fileURLToPath(new URL("../profiles/node16.json", import.meta.url)),
    strict: fileURLToPath(new URL("../profiles/strict.json", import.meta.url)),
};

const isAttwProfile = (value: unknown): value is AttwProfile => {
    switch (value) {
        case "esm-only":
        case "node16":
        case "strict": {
            return true;
        }
        default: {
            return false;
        }
    }
};

const assertAttwProfile: (value: unknown) => asserts value is AttwProfile = (
    value
) => {
    if (!isAttwProfile(value)) {
        throw new RangeError(
            `Unknown ATTW profile: ${String(value)}. Expected one of: ${arrayJoin(attwProfiles, ", ")}.`
        );
    }
};

const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Return the absolute path to one bundled ATTW profile.
 *
 * @throws When `profile` is not an official ATTW profile name.
 */
export function getAttwConfigPath(profile: AttwProfile): string {
    const candidate: unknown = profile;
    assertAttwProfile(candidate);

    return profilePaths[candidate];
}

/** Load one bundled ATTW profile. */
export async function loadAttwConfig(
    profile: AttwProfile = "esm-only"
): Promise<AttwConfig> {
    const configPath = getAttwConfigPath(profile);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- package-owned path selected from a closed profile map
    const contents = await readFile(configPath, "utf8");
    const parsed: unknown = JSON.parse(contents);

    return parseAttwConfig(parsed);
}

/**
 * Validate unknown input as one of the package's ATTW profiles.
 *
 * @throws When fields are invalid or a shared rule suppression is present.
 */
export function parseAttwConfig(value: unknown): AttwConfig {
    if (!isRecord(value)) {
        throw new TypeError("Expected the ATTW configuration to be an object.");
    }

    if (
        value["format"] !== "auto" ||
        value["pack"] !== true ||
        !isAttwProfile(value["profile"])
    ) {
        throw new TypeError(
            "Expected ATTW format=auto, pack=true, and a supported profile."
        );
    }

    if (keyIn(value, "ignoreRules")) {
        throw new TypeError(
            "Shared ATTW profiles must not suppress rules with ignoreRules."
        );
    }

    return {
        format: "auto",
        pack: true,
        profile: value["profile"],
    };
}

// eslint-disable-next-line n/no-sync, security/detect-non-literal-fs-filename -- the default export must be immediately usable by config consumers
const bundledAttwConfig = readFileSync(attwConfigPath, "utf8");

/** Package-owned ESM-only default profile. */
const defaultAttwConfig: AttwConfig = parseAttwConfig(
    JSON.parse(bundledAttwConfig)
);

export default defaultAttwConfig;
