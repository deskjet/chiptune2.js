import fs from 'fs'
import { minify } from 'terser'

main()
async function main() {
	const config = {
		compress: {
			dead_code: true,
			drop_console: false,
			drop_debugger: true,
			keep_classnames: false,
			keep_fargs: true,
			keep_fnames: false,
			keep_infinity: false
		},
		mangle: {
			eval: false,
			keep_classnames: false,
			keep_fnames: false,
			toplevel: false,
			safari10: false
		},
		module: false,
		sourceMap: false,
		output: {
			comments: ''
		}
	}
	let code = fs.readFileSync('chiptune3.js', 'utf8')
	code = code.replace('./chiptune3.worklet.js','./chiptune3.worklet.min.js')
	let minified = await minify(code, config)
	fs.writeFileSync('chiptune3.min.js', minified.code)

	code = fs.readFileSync('chiptune3.worklet.js', 'utf8')
	minified = await minify(code, config)
	fs.writeFileSync('chiptune3.worklet.min.js', minified.code)
}