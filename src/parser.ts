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
    projectFolder: string,
    documentFolder: string,
    withSource = false
): Promise<IPage[]> {
    const result: IPage[] = [];

    const projectFiles = [
        { name: "Readme", resultPath: "index", files: ["README", "README.md"] },
        {
            name: "License",
            resultPath: "license",
            files: ["LICENSE", "LICENSE.md"]
        },
        {
            name: "Contributing",
            resultPath: "contributing",
            files: ["CONTRIBUTING", "CONTRIBUTING.md"]
        },
        {
            name: "Change Log",
            resultPath: "changelog",
            files: ["CHANGELOG", "CHANGELOG.md", "HISTORY", "HISTORY.md"]
        }
    ];
    for (const { name, resultPath, files } of projectFiles) {
        for (const filename of files) {
            const filepath = join(projectFolder, filename);
            let fileStat: Stats;
            try {
                fileStat = await statAsync(filepath);
            } catch (_) {
                continue;
            }
            if (fileStat.isFile()) {
                const entry: IPage = {
                    name,
                    path: resultPath
                };
                if (withSource) {
                    entry.source = await readFileAsync(filepath, "utf8");
                }
                result.push(entry);
                break;
            }
        }
    }

    let fileEntries: string[] = [];
    try {
        fileEntries = await readdirAsync(documentFolder);
    } catch (e) {
        // no doc directory
        return result;
    }

    for (const filename of fileEntries) {
        if (!filename.endsWith(".md")) {
            continue;
        }
        const filepath = join(documentFolder, filename);
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
    sampleFolderPath: string,
    withSource = false
): Promise<IPage[]> {
    const result: IPage[] = [];

    let fileEntries: string[] = [];
    try {
        fileEntries = await readdirAsync(sampleFolderPath);
    } catch (e) {
        // no doc directory
        return result;
    }

    for (const filename of fileEntries) {
        if (!filename.endsWith(".jsx") && !filename.endsWith(".tsx")) {
            continue;
        }
        const filepath = join(sampleFolderPath, filename);
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
    const result = {
        name: project.name,
        homepage: "",
        homepageType: ""
    };
    let httpsUrl = "";
    try {
        const repo = packageRepo(path);
        if (repo) {
            httpsUrl = repo.https_url;
        }
    } catch (e) {
        return result;
    }

    if (httpsUrl.startsWith("https://github.com")) {
        result.homepage = httpsUrl;
        result.homepageType = "github";
    } else if (httpsUrl.startsWith("https://bitbucket.org")) {
        result.homepage = httpsUrl;
        result.homepageType = "bitbucket";
    } else {
        result.homepage = project.homepage;
        result.homepageType = "other";
    }
    return result;
}
