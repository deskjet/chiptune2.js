//
// DrSnuggles: Drop Handler
//
export function dnd(domListener, callback) {
	// preventDefaults on all drag related events
	let events = ['drop','dragdrop','dragenter','dragleave','dragover']
	events.forEach(ev => {
		domListener.addEventListener(ev, preventDefaults, false)
	})
	// handler on drop
	events = ['drop','dragdrop']
	events.forEach(ev => {
		domListener.addEventListener(ev, dropHandler, false)
	})
	function dropHandler(e) {
		let file = null
		if (e.dataTransfer.items) {
			for (let i = 0; i < e.dataTransfer.items.length; i++) {
				if (e.dataTransfer.items[i].kind === 'file') {
					file = e.dataTransfer.items[i].getAsFile()
					break	// just first file
				}
			}
		} else {
			for (let i = 0; i < e.dataTransfer.files.length; i++) {
				file = e.dataTransfer.files[i]
				break	// just first file
			}
		}

		if (!file) return
		
		const reader = new FileReader()
		reader.onloadend = (ev) => {
			callback( ev.target.result )
		}
		reader.readAsArrayBuffer(file)
	}
	function preventDefaults(ev) {
		ev.preventDefault()
	}
}
