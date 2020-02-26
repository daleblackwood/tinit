const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

let project = {};
let verbose = false;

async function run() {
  let folder = (process.argv[2] || process.cwd()) .replace(/\\/g, "/");
  if (folder.charAt(0) !== "." && folder.charAt(0) !== "/") {
    folder = process.cwd() + "/" + folder;
  }
  project.path = path.resolve(folder);
  project.name = path.basename(project.path);
  log("Setting up project in " + project.path + "...");
  await setupProject();
}

async function setupProject() {
  const projectPath = await requireFolder(project.path);
  await copyFolder(__dirname + "/template", project.path, false);

  const packagePath = projectPath + "/package.json";
  const packageStr = await readText(packagePath);
  const packageJson = JSON.parse(packageStr);

  project = {
    ...packageJson,
    ...project
  };
  project.name = await requireInput("Enter a project name", moduleParser, project.name);
  project.description = await requireInput("Enter a project description", stringParser, project.description);
  project.author = await requireInput("Enter an author", stringParser, project.author);
  project.license = await requireInput("Enter a license", stringParser, project.license);

  await writeText(packagePath, JSON.stringify(project, null, 2));
}

async function requireFolder(folderPath) {
  const pathExists = await promisify(fs.exists)(folderPath);
  if (pathExists === false) {
    const parentPath = path.dirname(folderPath);
    const parentExists = await promisify(fs.exists)(parentPath);
    if (parentExists === false) {
        throw new Error("Parent directory " + parentPath + " doesn't exist");
    }
    await promisify(fs.mkdir)(folderPath);
  }
  const pathStat = await promisify(fs.stat)(folderPath);
  if (pathStat.isDirectory() === false) {
    throw new Error("Path " + folderPath + " exists but is not a directory");
  }
  return path.resolve(folderPath);
}

async function requireInput(prompt, validator, defaultValue) {
  return new Promise(resolve => {
    function handleInput(text) {
      process.stdin.removeAllListeners();
      text = text.toString().trim() || defaultValue;
      try {
        text = validator(text);
      } catch (e) {
        log("Invalid: " + e);
        return tryInput();
      }
      resolve(text);
    }
    function tryInput() {
      let promptText = prompt;
      if (defaultValue) {
        promptText += " (" + defaultValue + ")";
      }
      promptText += ": ";
      log(promptText);
      process.openStdin();
      process.stdin.addListener("data", handleInput);
    }
    tryInput();
  });
}

function moduleParser(x) {
  if (typeof x !== "string")
    throw "string required";
  if (x.length < 2)
    throw "too short";
  if (x !== x.toLowerCase())
    throw "lowercase only";
  if (x.match(/\s/))
    throw "cannot contain whitespace";
  return x;
}

function stringParser(x) {
  return (x || "").trim();
}

async function copyFolder(fromPath, toPath, allowOverwrite) {
  await requireFolder(toPath);
  const files = await promisify(fs.readdir)(fromPath);
  for (const file of files) {
      const fromFile = fromPath + "/" + file;
      const toFile = toPath + "/" + file;
      const fromStat = await promisify(fs.stat)(fromFile);
      if (fromStat.isDirectory()) {
        await copyFolder(fromFile, toFile);
      } else {
        const toExists = await promisify(fs.exists)(toFile);
        if (toExists && allowOverwrite !== true)
            continue;
        if (verbose) {
          log("> writing " + toFile + "...");
        }
        await promisify(fs.copyFile)(fromFile, toFile);
      }
  }
}

async function readText(filePath) {
  return await promisify(fs.readFile)(filePath, { encoding: "utf-8" });
}

async function writeText(filePath, text) {
  await requireFolder(path.dirname(filePath));
  await promisify(fs.writeFile)(filePath, text, { encoding: "utf-8" });
}

function log(text) {
  if (text instanceof Error) {
      text = "Error: " + (text.stack || text.message || text);
  }
  process.stdout.write(text + "\n");
}

if (module === require.main) {
  (async function() {
    try {
        await run();
        process.exit(0);
    } catch (e) {
        log(e);
        process.exit(1);
    }
  })();
} else {
  throw new Error("tinit module should not be required - global or npx please");
}