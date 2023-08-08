// This file handles the CSS build.
// It will run Sass and compile all styles defined in the main entry file.

// main entry point name
const ENTRY_FILE_NAME = 'main.scss'

const path = require('path')
const sass = require('node-sass')
const CleanCSS = require('clean-css')
const cssesc = require('cssesc')
const isProd = process.env.ELEVENTY_ENV === 'production'

module.exports = class {
    async data() {
        const entryPath = path.join(__dirname, `/${ENTRY_FILE_NAME}`)
        return {
            permalink: `/assets/styles/main.css`,
            eleventyExcludeFromCollections: true,
            entryPath
        }
    }

    // Compile Sass to CSS,
    // Embed Source Map in Development
    async compile(config) {
        return new Promise((resolve, reject) => {
            if (!isProd) {
                config.sourceMap = true
                config.sourceMapEmbed = true
                config.outputStyle = 'expanded'
            }
            return sass.render(config, (err, result) => {
                if (err) {
                    return reject(err)
                }
                resolve(result.css.toString())
            })
        })
    }

    // Minify & Optimize with CleanCSS in Production
    async minify(css) {
        return new Promise((resolve, reject) => {
            if (!isProd) {
                resolve(css)
            }
            const minified = new CleanCSS().minify(css)
            if (!minified.styles) {
                return reject(minified.error)
            }
            resolve(minified.styles)
        })
    }

    // display an error overlay when CSS build fails.
    // this brilliant idea is taken from Mike Riethmuller / Supermaya
    // @see https://github.com/MadeByMike/supermaya/blob/master/site/utils/compile-scss.js
    renderError(error) {
        return `
        /* Error compiling stylesheet */
        *,
        *::before,
        *::after {
            box-sizing: border-box;
        }
        html,
        body {
            margin: 0;
            padding: 0;
            min-height: 100vh;
            font-family: inherit;
            font-size: 1rem;
        } 
        body::before,
        body::after { 
            content: '${cssesc(error)}'; 
        }`
    }

    // render the CSS file
    async render({ entryPath }) {
        try {
            const css = await this.compile({ file: entryPath })
            const result = await this.minify(css)
            return result
        } catch (err) {
            // if things go wrong
            if (isProd) {
                // throw and abort in production
                throw new Error(err)
            } else {
                // otherwise display the error overlay
                console.error(err)
                const msg = err.formatted || err.message
                return this.renderError(msg)
            }
        }
    }
}
