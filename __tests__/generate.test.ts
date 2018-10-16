import { stat } from "fs";
import { join } from "path";

import { generateDocPage } from "../src/generate_doc";
import { generateSamplePage } from "../src/generate_sample";

const projectFolder = join(__dirname, "..", "testsample");

async function exists(filename: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
        stat(join(projectFolder, filename), err => {
            resolve(!err);
        });
    });
}

const project = {
    name: "testproject",
    homepage: "http://github.com/shibukawa/testsample"
};

const testDocSource = `
# Test Document

This is a sample page.
`;

const testSampleSource = `
// Test Sample

export default function() {
    return <div />;
}
`;

describe("generator", () => {
    it("doc page generate", async () => {
        const result = await generateDocPage(
            project,
            [{ name: "TestDoc", path: "index", source: testDocSource }],
            [],
            "index",
            projectFolder
        );

        expect(await exists("/pages/index.tsx")).toBeTruthy();
        expect(result.includes("# Test Document")).toBeTruthy();
    });

    it("doc page generate", async () => {
        const result = await generateSamplePage(
            project,
            [],
            [
                {
                    name: "Test Sample",
                    path: "sample",
                    source: testSampleSource,
                    importPath: "../samples/sample1"
                }
            ],
            "sample",
            projectFolder
        );
        expect(await exists("/pages/index.tsx")).toBeTruthy();
        expect(result.includes('<h1>{"Test Sample"}</h1>')).toBeTruthy();
    });
});
