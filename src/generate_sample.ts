import * as ejs from "ejs";
import { writeFile } from "fs";
import { join } from "path";
import { promisify } from "util";

import { IPage, IProject } from "./parser";

const writeFileAsync = promisify(writeFile);

const template = `
import React, { Component } from "react";
import { Navigator, IDocument, ISample } from "../src/_navigator";
import Paper from '@material-ui/core/Paper';
import Markdown from "react-markdown";
import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import { dark } from 'react-syntax-highlighter/styles/prism';

import Fixture from <%- JSON.stringify(importPath) %>;

const docs: IDocument[] = <%- JSON.stringify(docs) %>;
const samples: ISample[] = <%- JSON.stringify(samples) %>;
const source = <%- JSON.stringify(source) %>;
const currentPath = <%- JSON.stringify(currentPath) %>;
const doc = <%- JSON.stringify(doc) %>;

export default class SamplePage extends Component {
    public render() {
        return (
            <Navigator docs={docs} samples={samples} currentPath={currentPath} project={<%- JSON.stringify(project) %>}>
                {doc ? <Markdown source={doc}/> : <h1>{<%- JSON.stringify(name) %>}</h1>}
                <Paper>
                    <Fixture />
                </Paper>
                <h2>Source Code</h2>
                <SyntaxHighlighter language='typescript' style={dark} showLineNumbers={true}>{source}</SyntaxHighlighter>
            </Navigator>
        );
    }
}
`;

export async function generateSamplePage(
    project: IProject,
    docs: IPage[],
    samples: IPage[],
    currentPath: string,
    projectPath: string
): Promise<string> {
    const currentSample = samples.find(doc => {
        return doc.path === currentPath;
    });
    if (!currentSample) {
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
        source: currentSample.source,
        name: currentSample.name,
        doc: currentSample.doc,
        currentPath,
        project,
        importPath: currentSample.importPath
    });

    await writeFileAsync(join(projectPath, "pages", `${currentPath}.tsx`), src);

    return src;
}
