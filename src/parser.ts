import { readdir, readFile, stat, Stats } from "fs";
import { join, parse } from "path";
import { promisify } from "util";

import * as packageRepo from "package-repo";
import * as toTitleCase from "to-title-case";
import * as ts from "typescript";

const readdirAsync = promisify(readdir);
const readFileAsync = promisify(readFile);
const statAsync = promisify(stat);

export interface IPage {
    name: string;
    path: string;
    importPath?: string;
    source?: string;
    doc?: string;
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
            const title = parseMarkdown(source);
            if (title !== null) {
                const entry: IPage = {
                    name: title,
                    path: `${filename.slice(0, filename.length - 3)}`
                };
                if (withSource) {
                    entry.source = source;
                }
                result.push(entry);
            }
        }
    }

    return result;
}

function parseMarkdown(sourceText: string): string | null {
    for (const line of sourceText.split(/\r?\n/)) {
        const match = line.match(/^#\s+(.+)$/);
        if (match) {
            return match[1].trim();
        }
    }
    return null;
}

interface IMarkdown {
    title: string;
    markdownSource: string;
    typeScriptSource: string;
}

function findMarkdownDoc(node: ts.Node, sourceText: string): IMarkdown | null {
    const comments: ts.CommentRange[] = [];
    const leadingComments = ts.getLeadingCommentRanges(sourceText, node.pos);
    if (leadingComments) {
        comments.push(...leadingComments);
    }
    const trailingComments = ts.getTrailingCommentRanges(sourceText, node.end);
    if (trailingComments) {
        comments.push(...trailingComments);
    }
    for (const comment of comments) {
        const commentText = sourceText.slice(comment.pos, comment.end);
        const match = /\/\*@([\s|\S]*)\*\//g.exec(commentText);
        if (match) {
            const markdown = match[1];
            const title = parseMarkdown(markdown);
            const typeScriptSource = (
                sourceText.slice(0, comment.pos) + sourceText.slice(comment.end)
            ).trim();
            if (title !== null) {
                return {
                    title,
                    markdownSource: markdown,
                    typeScriptSource
                };
            }
        }
    }

    return null;
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
            const sourceText = await readFileAsync(filepath, "utf8");
            const sourceFile = ts.createSourceFile(
                filename,
                sourceText,
                ts.ScriptTarget.ES2018,
                true
            );
            let found = false;
            function parseTS(source: ts.SourceFile) {
                function parseNode(node: ts.Node) {
                    const markdown = findMarkdownDoc(node, sourceText);
                    if (markdown) {
                        found = true;
                        const path = parse(filename).name;
                        const entry: IPage = {
                            name: markdown.title,
                            path,
                            importPath: `../samples/${path}`
                        };
                        if (withSource) {
                            entry.source = markdown.typeScriptSource;
                            entry.doc = markdown.markdownSource;
                        }
                        result.push(entry);
                    } else {
                        ts.forEachChild(node, parseNode);
                    }
                }
                parseNode(source);
            }
            parseTS(sourceFile);
            if (!found) {
                const path = parse(filename).name;
                const entry: IPage = {
                    name: toTitleCase(path),
                    path,
                    importPath: `../samples/${path}`
                };
                if (withSource) {
                    entry.source = sourceText.trim();
                }
                result.push(entry);
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
