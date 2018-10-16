import { join } from "path";
import { documentParser, exampleParser, projectParser } from "../src/parser";

const projectFolder = join(__dirname, "..", "testsample");

describe("parser", () => {
    it("parse docs folder", async () => {
        const docs = await documentParser(projectFolder);
        expect(docs).toStrictEqual([
            { name: "README", path: "index" },
            { name: "Test1", path: "0.test1" },
            { name: "Test2", path: "1.test2" }
        ]);
    });

    it("parse example folder", async () => {
        const examples = await exampleParser(projectFolder);
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
