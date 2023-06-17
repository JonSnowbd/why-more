#!/usr/bin/env node

const fs = require("fs");
const http = require("http");
const path = require("path");
const es = require("esbuild");
const ess = require("esbuild-svelte");
const process = require("process");

// The harness contains the whole thing. If you want a custom harness
// just edit this to whatever you want. <style/> and <script/> will be
// replaced with the bundles.
const harness = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style/>
  </head>

  <body>
    <script/>
  </body>
</html>
`;

function get_js_harness(app_name) {
  return `
import ${app_name} from './${app_name}.svelte'
new ${app_name}({
  target: document.body
});
  `
}

var build_dev = false
var input_folder = "./src"
var output_folder = "./dist"

process.argv.forEach((val, i) => {
  console.log(val)
  if(i == 2) {
    if(val == "build") { build_dev = false; }
    else if(val == "dev") { build_dev = true; }
    else { console.error("First arg is either 'build' or 'dev'"); process.exit(1); }
  }
  if(i == 3) {
    input_folder = val;
  }
  if(i == 4) {
    output_folder = val;
  }
})

if(!fs.existsSync("node_modules")) {
  console.error("Failed to find node_modules. Are you in the correct folder, and ran `npm i`?")
  process.exit(1)
}
if(!fs.existsSync("node_modules/.cache/whymore")) {
  fs.mkdirSync("node_modules/.cache/whymore", {recursive: true})
}

async function compile_app(target) {
  if(fs.existsSync("node_modules/.cache/whymore/bundle/stdin.js")) {
    fs.rmSync("node_modules/.cache/whymore/bundle/stdin.js");
  }
  if(fs.existsSync("node_modules/.cache/whymore/bundle/stdin.css")) {
    fs.rmSync("node_modules/.cache/whymore/bundle/stdin.css");
  }
  var start_time = process.hrtime()
  process.stdout.write("- Packaging "+target+"... ");
  var i = path.parse(target);
  var abs_path = path.resolve(path.dirname(target))

  // A bit jank but hey it works. Use stdin to pipe in a js harness that
  // imports the svelte component and then mounts it to body.
  await es.build({
    mainFields: ["svelte", "browser", "module", "main"],
    outdir: path.resolve(path.join(process.cwd(), "node_modules/.cache/whymore/")),
    format: "esm",
    bundle: true,
    splitting: false,
    minify: true,
    absWorkingDir: abs_path,
    plugins: [ess()],
    stdin: {
      contents: get_js_harness(i.name),
      resolveDir: abs_path,
    }
  }).catch((err) => {
    process.stdout.write("Failed.");
    return;
  })

  // And then package it and its css and into the html harness.
  // Easy as that, completely self contained html page.
  var final_content = harness;

  if(fs.existsSync("node_modules/.cache/whymore/stdin.js")) {
    final_content = final_content.replace("<script/>", "<script type='module'>"+fs.readFileSync("node_modules/.cache/whymore/stdin.js").toString()+"</script>");
  } else {
    final_content = final_content.replace("<script/>", "");
  }
  if(fs.existsSync("node_modules/.cache/whymore/stdin.css")) {
    final_content = final_content.replace("<style/>", "<style>"+fs.readFileSync("node_modules/.cache/whymore/stdin.css").toString()+"</style>");
  } else {
    final_content = final_content.replace("<style/>", "");
  }

  await fs.promises.writeFile(path.join(output_folder, i.name+".html"), final_content);
  process.stdout.write(" Done in "+process.hrtime(start_time)[1]/1000000.0+"ms\n");
}

console.log("\nWhy More is running.\nCLI Usage: [build|dev] [input folder] [output folder]\n");

async function build_mode() {
  var items = fs.readdirSync(input_folder);
  for(const item of items) {
    if(path.extname(item) == ".svelte") {
      await compile_app(path.join(input_folder, item))
    }
  }
}

async function serve_mode() {
  console.log("Beginning dev server...")
}

if(build_dev) {
  serve_mode()
} else {
  build_mode()
}