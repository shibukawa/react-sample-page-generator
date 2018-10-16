import * as clc from "cli-color";
import * as finder from "find-package-json";
import { dirname } from "path";

import { generateDocPage } from "./generate_doc";
import { generateNavigator } from "./generate_navigator";
import { generateSamplePage } from "./generate_sample";
import { documentParser, exampleParser, projectParser } from "./parser";

export async function main() {
    const f = finder();
    const { filename } = f.next();
    const projectPath = dirname(filename);
    console.log(
        `${clc.blueBright("reading project settings:")} ${projectPath}`
    );
    const [project, samples, documents] = await Promise.all([
        projectParser(projectPath),
        exampleParser(projectPath, true),
        documentParser(projectPath, true)
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
