# "react-sample-page-generator"

![Screenshot](https://raw.githubusercontent.com/shibukawa/react-sample-page-generator/master/screenshot/screenshot.png "Screenshot")

This tool is a document generator for React components. This tool generates pages of Next.js from sample pages and Markdown documents. It natively supports TypeScript.

## Usage

At first, you should create Next.js project with TypeScript support:

```sh
# Initialize
$ mkdir your-project
$ npm init -y

# Next.js
$ npm install --save react react-dom next

# Next.js TypeScript support
$ npm install --save @zeit/next-typescript

# Material UI
$ npm install --save @material-ui/core @material-ui/icons

# Other components
$ npm install --save react-markdown react-syntax-highlighter @types/react-syntax-highlighter
```

Enable TypeScript plugin. You should add "next.config.js", ".babelrc", and "tsconfig.json". The following page describes it.

* [@zeit/next-typescript RADME](https://github.com/zeit/next-plugins/tree/master/packages/next-typescript)

Then add samples and documents (markdown).

* Sample files should be in ``/samples`` folder and they should have extension ".tsx" or ".jsx".
* Sample files should be in ``/docs`` folder and they should have extension ".md".
* "README" or "README.md" will be an index page.

TypeScript should have the following structure:

```ts
/*@
# SVG Sample

This sample shows SVG component.
Comment should start "/*@" and has markdown document.
*/

// Use "export default" to return React componet/view function (This is a rule of Next.js)
export default function() {
    return (
        <svg height="400" width="450" xmlns="http://www.w3.org/2000/svg">
            <path
                id="lineAB"
                d="M 100 350 l 150 -300"
                stroke="red"
                stroke-width="3"
                fill="none"
            />
        </svg>
    );
}
```

You can generate pages like this:

```sh
$ react-sample-page-generator
writing: src/_navigator.tsx
writing: pages/document.tsx
writing: pages/index.tsx
writing: pages/basic_sample.tsx
writing: pages/advance_sample.tsx
```

# Related Projects

* [Storybook](https://storybook.js.org/)
* [docz](https://www.docz.site/)

They are very good tools. But, I created this tool to reuse configs (babel/tsconfig etc) with actual production softwares.

# License

MIT
