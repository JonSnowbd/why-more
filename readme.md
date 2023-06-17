## Why-More

The overview is simple:

1) Call either `why-more build` or `why-more dev` and every svelte component in
the top level of the `src` folder of your project is turned into a page in a `dist` folder

Thats the whole process. No multiple steps. No config files. One dependency.

## Usage

Make your project folder

1) `npm init`
2) `npm i --save why-more`
3) `"build": "why-more build [your_input_folder] [your_output_folder]"` in your `package.json` scripts section
4) `"dev": "why-more dev [your_input_folder] [your_output_folder]"` in your `package.json` scripts section
5) Write svelte files in the input folder
6) `npm run dev` or `npm run build` in your project
7) Enjoy.

## In dev

Its good enough for the `build` subcommand, the `dev` subcommand is something I'll be making later.

## What

Why-More is just a cli(not global, make sure youre using script or npx) that 
builds svelte components, and provides a preview for them.

This is not intended to build websites, or pages that link into eachother.
The use case is very quick simple tooling and documentation.

## Why

Imagine a file format for interactive documentation and tools that is completely self contained,
runs on every platform with only one dependency that every OS has, totals about
200kb on the heavy end of use, and sub 100ms build times.

Compiling a single svelte component into a self contained html file fulfills all that. 
Simply import your css, images, svelte components and there is nothing between you
and writing the most universal tooling.