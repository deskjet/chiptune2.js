/*
	chiptune3 (worklet version)
	based on: https://deskjet.github.io/chiptune2.js/

	2 ways to use:
	- new ChiptuneJsPlay() : Uses new AudioContext() and outputs to gain and speakers
	- new ChiptuneJsPlay(ctx) : Uses given ctx and only outputs to gain
*/

export class ChiptuneJsPlayer {
	constructor(ctx) {

		if (ctx) {
			if (!ctx.destination) {
				//console.error('This is not an audio context.')
				throw('ChiptuneJsPlayer: This is not an audio context')
			}
			this.context = ctx
			this.destination = false
		} else {
			this.context = new AudioContext()
			this.destination = this.context.destination	// output to speakers
		}
		// make gainNode
		this.gain = this.context.createGain()
		this.gain.gain.value = 1

		this.config = {repeatCount: -1}
		this.handlers = []

		// worklet
		this.context.audioWorklet.addModule('/chiptune/chiptune3.worklet.js')
		.then(()=>{
			this.processNode = new AudioWorkletNode(this.context, 'libopenmpt-processor', {
				numberOfInputs: 0,
				numberOfOutputs: 1,
				outputChannelCount: [2]
			})
			// message port
			this.processNode.port.onmessage = this.handleMessage_.bind(this)
			this.fireEvent('onInitialized')

			// audio routing
			this.processNode.connect(this.gain)
			if (this.destination) this.gain.connect(this.destination)	// also connect to output if no gainNode was given
		})
		.catch(e=>console.error(e))
	}

	// msg from worklet
	handleMessage_(msg) {
		switch (msg.data.cmd) {
			case 'meta':
				this.meta = msg.data.meta
				this.duration = msg.data.meta.dur
				this.fireEvent('onMetadata', this.meta)
				break
			case 'pos':
				//this.meta.pos = msg.data.pos
				this.currentTime = msg.data.pos
				this.fireEvent('onProgress', this.currentTime)
				break
			case 'end':
				this.fireEvent('onEnded')
				break
			case 'err':
				this.fireEvent('onError', {type: msg.data.val})
				break
			default:
				console.log('Received unknown message',msg.data)
		}
	}

	// handlers
	fireEvent(eventName, response) {
		const handlers = this.handlers
		if (handlers.length) {
			handlers.forEach(function (handler) {
				if (handler.eventName === eventName) {
					handler.handler(response)
				}
			})
		}
	}
	addHandler(eventName, handler) { this.handlers.push({eventName: eventName, handler: handler}) }
	onInitialized(handler) { this.addHandler('onInitialized', handler) }
	onEnded(handler) { this.addHandler('onEnded', handler) }
	onError(handler) { this.addHandler('onError', handler) }
	onMetadata(handler) { this.addHandler('onMetadata', handler) }
	onProgress(handler) { this.addHandler('onProgress', handler) }

	// methods
	postMsg(cmd, val) {
		if (this.processNode)
			this.processNode.port.postMessage({cmd:cmd,val:val})
	}
	load(url) {
		fetch(url)
		.then(response => response.arrayBuffer())
		.then(arrayBuffer => this.play(arrayBuffer))
		.catch(e=>{this.fireEvent('onError', {type: 'Load'})})
	}
	play(val) { this.postMsg('play', val) }
	stop() { this.postMsg('stop') }
	pause() { this.postMsg('pause') }
	unpause() { this.postMsg('unpause') }
	togglePause() { this.postMsg('togglePause') }
	setRepeatCount(val) { this.postMsg('repeatCount', val) }
	setPitch(val) { this.postMsg('setPitch', val) }
	setTempo(val) { this.postMsg('setTempo', val) }
	setPos(val) { this.postMsg('setPos', val) }
	setVol(val) { this.gain.gain.value = val }
	selectSubsong(val) { this.postMsg('selectSubsong', val) }
	// compatibility
	seek(val) { this.setPos(val) }
	getCurrentTime() { return this.currentTime }
}
