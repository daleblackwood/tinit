# tinit

**tinit** is a tiny Typescript standalone npm module factory designed for use 
with **npx**. Consider it an alternative to **npm init**.

With this tool, you can generate the minimum boilerplate for small Typescript
 modules, ready to emit Javascript compatible with npm.

### Requirements
- A globally installed Typescript compiler
- NodeJS 10+ with NPM

### Running with NPX (Recommended)
Go to your desired project folder's parent directory and type:

```npx tinit [modulename]```

When you run the wizard, you'll be asked a few questions, like with npm or 
yarn, including project name, description, author and license.

Once complete, you'll have a folder with:
- **index.js** - the module entry point, set to import from `./lib/`
- **package.json** - the generated package file
- **test.js** - a simple script for writing your tests in
- **tsconfig.json** - a build config set to emit javascript and
- **src/index.ts** - your module's entry point, write your module here

### Project Commands
Once you're set up, you can use the following commands to compile and run your
 project.
- `tsc -b` - Compiles your module through tsc into npm-ready javascript and 
  type definitions
- `tsc -w` - Compiles your module and watches for changes
- `npm test` - Runs the inbuilt test module
- `npm start` - Runs your module, once it's built

### Goals
Sometimes you may find yourself writing a small tool for node applications, in
Typescript, that isn't large enough to justify the need for a build system and 
test framework. This is for then.
- tinit should run without install
- tinit should generate the minimum output for a tsc build
- tinit should be ran only once, left behind forever
- tinit should not be a dependency or cause dependencies
- tinit should allow for testing