const pluginRss = require('@11ty/eleventy-plugin-rss')
const markdownIt = require('markdown-it')

const filters = require('./src/_11ty/filters/filters.js')
const transforms = require('./src/_11ty/transform/transforms.js')
const shortcodes = require('./src/_11ty/shortcodes/shortcodes.js')
const iconsprite = require('./src/_11ty/icon-sprite/iconsprite.js')

module.exports = function (eleventyConfig) {
    /**
     * Plugins
     * @link https://www.11ty.dev/docs/plugins/
     */
    eleventyConfig.addPlugin(pluginRss)

    /**
     * Shortcodes
     * @link https://www.11ty.io/docs/shortcodes/
     */
    Object.keys(shortcodes).forEach((shortcodeName) => {
        eleventyConfig.addShortcode(shortcodeName, shortcodes[shortcodeName])
    })

    eleventyConfig.addNunjucksAsyncShortcode('iconsprite', iconsprite)

    /**
     * Filters
     * @link https://www.11ty.io/docs/filters/
     */
    Object.keys(filters).forEach((filterName) => {
        eleventyConfig.addFilter(filterName, filters[filterName])
    })

    /**
     * Transforms
     * @link https://www.11ty.io/docs/config/#transforms
     */
    Object.keys(transforms).forEach((transformName) => {
        eleventyConfig.addTransform(transformName, transforms[transformName])
    })

    /**
     * Watch and Serve Config
     * @link https://www.11ty.dev/docs/watch-serve/
     */
    eleventyConfig.addWatchTarget('./src/assets')

    /**
     * Set custom markdown library instance
     * @link https://www.11ty.dev/docs/languages/markdown/#optional-set-your-own-library-instance
     */

    eleventyConfig.setLibrary(
        'md',
        markdownIt({
            html: true,
            breaks: true,
            linkify: true,
            typographer: true
        })
    )

    /**
     * Layouts
     * @link https://www.11ty.dev/docs/layouts/#layout-aliasing
     */
    eleventyConfig.addLayoutAlias('base', 'base-base.njk')
    eleventyConfig.addLayoutAlias('resume', 'base-resume.njk')

    /**
     * Collections
     * @link https://www.11ty.dev/docs/collections/#advanced-custom-filtering-and-sorting
     */
    const collections = ['work', 'education', 'project']
    collections.forEach((name) => {
        eleventyConfig.addCollection(name, function (collection) {
            const folderRegex = new RegExp(`\/${name}\/`)
            const inEntryFolder = (item) =>
                item.inputPath.match(folderRegex) !== null
            const byStartDate = (a, b) => {
                if (a.data.start && b.data.start) {
                    return a.data.start - b.data.start
                }
                return 0
            }
            return collection
                .getAllSorted()
                .filter(inEntryFolder)
                .sort(byStartDate)
        })
    })

    /**
     * Passthrough File Copy
     * @link https://www.11ty.dev/docs/copy/
     */
    eleventyConfig.addPassthroughCopy('src/robots.txt')
    eleventyConfig.addPassthroughCopy('src/assets/images')
    eleventyConfig.addPassthroughCopy('src/assets/fonts')

    /**
     * Deep-Merge
     * @link https://www.11ty.dev/docs/data-deep-merge/#data-deep-merge
     */
    eleventyConfig.setDataDeepMerge(true)

    return {
        dir: {
            input: 'src',
            data: '_data',
            output: 'dist',
            layouts: '_layouts',
            includes: '_includes'
        },
        templateFormats: ['njk', 'md', '11ty.js'],
        htmlTemplateEngine: 'njk',
        markdownTemplateEngine: 'njk'
    }
}
