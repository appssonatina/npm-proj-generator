const process = require("process");
const childProcess = require("child_process");
const fs = require("fs");

const cmdArgs = buildCmdArguments();

const finalDir = cmdArgs.directory + cmdArgs.projectName;

try {
  fs.mkdirSync(finalDir);
} catch (err) {
  console.log(err);
  process.exit(-1);
}

const proc = childProcess.spawn("/bin/sh");

proc.stdout.on("data", (data) => {
  console.log(data.toString());
});

proc.stderr.on("data", (data) => {
  console.error(data.toString());
});

proc.stdin.write(`cd ${finalDir}\n`);
proc.stdin.write("npm init --yes\n");
proc.stdin.write("npm install --save-dev eslint\n");
proc.stdin.write("npm install --save-dev --save-exact prettier\n");
proc.stdin.write("npm install --save-dev eslint-config-google\n");
proc.stdin.write("npm install --save-dev eslint-config-prettier\n");
proc.stdin.write("npm install --save-dev eslint-plugin-prettier\n");
proc.stdin.end();

fs.writeFileSync(
  `${finalDir}/vscode.code-workspace`,
  `{
	"folders": [
		{
			"path": "."
		}
	],
	"settings": {
		"editor.codeActionsOnSave": {
			"source.fixAll": true
		}		
	}
}
`
);

fs.writeFileSync(
  `${finalDir}/.eslintrc.js`,
  `module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: ["google", "plugin:prettier/recommended"],
  parserOptions: {
    ecmaVersion: 11,
    sourceType: "module",
  },
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": "error",
  },
};
`
);

/**
 * Build object with the revelant command line args
 *
 * @return {object} directory, projectName
 */
function buildCmdArguments() {
  const result = {};
  const argArray = process.argv.slice(2);

  const dirSwitchIdx = argArray.indexOf("-d");
  if (dirSwitchIdx >= 0) {
    if (dirSwitchIdx == argArray.length - 1) {
      throw Error("invalid directory name");
    }

    result.directory = argArray.splice(dirSwitchIdx, 2)[1];
  } else {
    result.directory = "";
  }

  if (!argArray.length) {
    throw Error("project name required");
  }

  result.projectName = argArray[0];

  return result;
}
