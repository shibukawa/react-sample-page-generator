import { readdir, readFile, stat, Stats } from "fs";
import * as packageRepo from "package-repo";
import { join } from "path";
import { promisify } from "util";

const readdirAsync = promisify(readdir);
const readFileAsync = promisify(readFile);
const statAsync = promisify(stat);

export interface IPage {
    name: string;
    path: string;
    importPath?: string;
    source?: string;
}

export interface IProject {
    name: string;
    homepage?: string;
    homepageType?: string;
}

export async function documentParser(
    folderPath: string,
    withSource = false
): Promise<IPage[]> {
    const result: IPage[] = [];

    const readmeNames = ["README", "README.md"];

    for (const filename of readmeNames) {
        const filepath = join(folderPath, filename);
        let fileStat: Stats;
        try {
            fileStat = await statAsync(filepath);
        } catch (_) {
            continue;
        }
        if (fileStat.isFile()) {
            const entry: IPage = {
                name: "README",
                path: "index"
            };
            if (withSource) {
                entry.source = await readFileAsync(filepath, "utf8");
            }
            result.push(entry);
            break;
        }
    }

    for (const filename of await readdirAsync(join(folderPath, "docs"))) {
        if (!filename.endsWith(".md")) {
            continue;
        }
        const filepath = join(folderPath, "docs", filename);
        const fileStat = await statAsync(filepath);
        if (fileStat.isFile()) {
            const source = await readFileAsync(filepath, "utf8");
            for (const line of source.split(/\r?\n/)) {
                const match = line.match(/^#\s+(.+)$/);
                if (match) {
                    const entry: IPage = {
                        name: match[1].trim(),
                        path: `${filename.slice(0, filename.length - 3)}`
                    };
                    if (withSource) {
                        entry.source = source;
                    }
                    result.push(entry);
                    break;
                }
            }
        }
    }

    return result;
}

export async function exampleParser(
    folderPath: string,
    withSource = false
): Promise<IPage[]> {
    const result: IPage[] = [];

    for (const filename of await readdirAsync(join(folderPath, "samples"))) {
        if (!filename.endsWith(".jsx") && !filename.endsWith(".tsx")) {
            continue;
        }
        const filepath = join(folderPath, "samples", filename);
        const fileStat = await statAsync(filepath);
        if (fileStat.isFile()) {
            const source = await readFileAsync(filepath, "utf8");
            for (const line of source.split(/\r?\n/)) {
                const match = line.match(/^\/\/\s+(.+)$/);
                if (match) {
                    const path = filename.slice(0, filename.length - 4);
                    const entry: IPage = {
                        name: match[1].trim(),
                        path: `${path}`,
                        importPath: `../samples/${path}`
                    };
                    if (withSource) {
                        entry.source = source;
                    }
                    result.push(entry);
                    break;
                }
            }
        }
    }
    return result;
}

export async function projectParser(folderPath: string): Promise<IProject> {
    const path = join(folderPath, "package.json");
    const project = JSON.parse(await readFileAsync(path, "utf8"));
    const repo = packageRepo(path);

    const result = {
        name: project.name,
        homepage: "",
        homepageType: ""
    };

    if (repo && repo.https_url.startsWith("https://github.com")) {
        result.homepage = repo.https_url;
        result.homepageType = "github";
    } else if (repo && repo.https_url.startsWith("https://bitbucket.org")) {
        result.homepage = repo.https_url;
        result.homepageType = "bitbucket";
    } else {
        result.homepage = project.homepage;
        result.homepageType = "other";
    }
    return result;
}
