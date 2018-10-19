#!/usr/bin/env node
import * as clc from "cli-color";
import * as commandLineArgs from "command-line-args";
import * as commandLineUsage from "command-line-usage";
import * as finder from "find-package-json";
import { dirname, join } from "path";
import { install } from "source-map-support";

import { generateDocPage } from "./generate_doc";
import { generateNavigator } from "./generate_navigator";
import { generateSamplePage } from "./generate_sample";
import { documentParser, exampleParser, projectParser } from "./parser";

export async function main() {
    // add source map support
    install();

    const f = finder();
    const { filename } = f.next();
    const projectPath = dirname(filename);
    console.log(
        `${clc.blueBright("reading project settings:")} ${projectPath}`
    );
    const cliOptions = [
        {
            name: "projectdir",
            alias: "p",
            defaultValue: projectPath,
            description: "Directory to find README/CONTRIBUTING/LICENSE file.",
            typeLabel: "{underline dir}"
        },
        {
            name: "sampledir",
            alias: "s",
            defaultValue: join(projectPath, "samples"),
            description: "Directory to find sample files (.tsx)",
            typeLabel: "{underline dir}"
        },
        {
            name: "docdir",
            alias: "d",
            defaultValue: join(projectPath, "docs"),
            description: "Directory to find markdown files (.md)",
            typeLabel: "{underline dir}"
        },
        {
            name: "help",
            alias: "h",
            type: Boolean,
            description: "Display this usage guide."
        }
    ];
    const opts = commandLineArgs(cliOptions);
    if (opts.help) {
        const usage = commandLineUsage([
            {
                header: "react-sample-page-generator",
                content:
                    "Generates sample page web page from saple codes and markdowns."
            },
            {
                header: "Synopsis",
                content: [
                    "$ react-sample-page-generator [{bold --projectdir} {underline dir}] [{bold --sampledir} {underline dir}] [{bold --docdir} {underline dir}]",
                    "$ react-sample-page-generator {bold --help}"
                ]
            },
            {
                header: "Options",
                optionList: cliOptions
            }
        ]);
        console.error(usage);
        return;
    }
    const [project, samples, documents] = await Promise.all([
        projectParser(opts.projectdir),
        exampleParser(opts.sampledir, true),
        documentParser(opts.projectdir, opts.docdir, true)
    ]);
    await Promise.all([
        (async () => {
            generateNavigator(projectPath);
            console.log(`${clc.greenBright("writing:")} src/_navigator.tsx`);
        })(),
        ...samples.map(async sample => {
            console.log(
                `${clc.greenBright("writing:")} pages/${sample.path}.tsx`
            );
            await generateSamplePage(
                project,
                documents,
                samples,
                sample.path,
                projectPath
            );
        }),
        ...documents.map(async document => {
            console.log(
                `${clc.greenBright("writing:")} pages/${document.path}.tsx`
            );
            await generateDocPage(
                project,
                documents,
                samples,
                document.path,
                projectPath
            );
        })
    ]);
}

main();
