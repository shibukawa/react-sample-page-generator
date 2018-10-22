import { join } from "path";
import { documentParser, exampleParser, projectParser } from "../src/parser";

describe("parser - ok", () => {
    const projectFolder = join(__dirname, "..", "testsamples", "successsample");

    it("parse docs folder", async () => {
        const docs = await documentParser(
            projectFolder,
            join(projectFolder, "docs")
        );
        expect(docs).toStrictEqual([
            { name: "Readme", path: "index" },
            { name: "Test1", path: "0.test1" },
            { name: "Test2", path: "1.test2" }
        ]);
    });

    it("parse sample folder", async () => {
        const examples = await exampleParser(join(projectFolder, "samples"));
        expect(examples).toStrictEqual([
            {
                name: "Sample1",
                path: "sample1",
                importPath: "../samples/sample1"
            },
            {
                name: "Sample2",
                path: "sample2",
                importPath: "../samples/sample2"
            }
        ]);
    });

    it("parse project folder", async () => {
        const project = await projectParser(projectFolder);
        expect(project.name).toBe("testsample");
        expect(project.homepage).toBe(
            "https://github.com/shibukawa/testsample"
        );
        expect(project.homepageType).toBe("github");
    });
});

describe("parser - empty", () => {
    const projectFolder = join(__dirname, "..", "testsamples", "emptysample");

    it("parse docs folder", async () => {
        const docs = await documentParser(
            projectFolder,
            join(projectFolder, "docs")
        );
        expect(docs).toStrictEqual([]);
    });

    it("parse sample folder", async () => {
        const examples = await exampleParser(join(projectFolder, "samples"));
        expect(examples).toStrictEqual([]);
    });

    it("parse project folder", async () => {
        const project = await projectParser(projectFolder);
        expect(project.name).toBe("testsample");
        expect(project.homepage).toBeUndefined();
        expect(project.homepageType).toBe("other");
    });
});
