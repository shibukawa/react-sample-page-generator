import { writeFile } from "fs";
import { join } from "path";
import { promisify } from "util";

import * as ejs from "ejs";

import { IPage, IProject } from "./parser";

const writeFileAsync = promisify(writeFile);

const template = `
import React, { Component } from "react";
import { Navigator, IDocument, ISample } from "../src/_navigator";
import Markdown from "react-markdown";

const docs: IDocument[] = <%- JSON.stringify(docs) %>;
const samples: ISample[] = <%- JSON.stringify(samples) %>;
const source = <%- JSON.stringify(source) %>;
const currentPath = <%- JSON.stringify(currentPath) %>;

export default class SamplePage extends Component {
    public render() {
        return (
            <Navigator docs={docs} samples={samples} currentPath={currentPath} project={<%- JSON.stringify(project) %>}>
                <Markdown source={source}/>
            </Navigator>
        );
    }
}
`;

export async function generateDocPage(
    project: IProject,
    docs: IPage[],
    samples: IPage[],
    currentPath: string,
    projectPath: string
): Promise<string> {
    const currentDoc = docs.find(doc => {
        return doc.path === currentPath;
    });
    if (!currentDoc) {
        throw new Error(`currentPath is invalid: ${currentPath}`);
    }
    const filteredDocs = docs.map(doc => {
        return {
            name: doc.name,
            path: doc.path
        };
    });
    const filteredSamples = samples.map(sample => {
        return {
            name: sample.name,
            path: sample.path
        };
    });
    const src = ejs.render(template, {
        docs: filteredDocs,
        samples: filteredSamples,
        source: currentDoc.source,
        currentPath,
        project
    });

    await writeFileAsync(join(projectPath, "pages", `${currentPath}.tsx`), src);

    return src;
}
