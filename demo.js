import {LDR} from 'https://DrSnuggles.github.io/LDR/ldr-zip.min.js'
import {kkRows} from 'https://DrSnuggles.github.io/kkRows/js/kk-rows.min.js'
import {Visualizer} from 'https://DrSnuggles.github.io/visualizer/visualizer.min.js' 
import {dnd} from './dnd.js'
import {ChiptuneJsPlayer} from './chiptune3.min.js'

let isLoading = false

function setMetadata() {
	const metadata = player.meta
	if(!metadata) return
	document.getElementById('title').innerHTML = metadata['title']

	var subsongs = player.meta.songs
	document.getElementById('subsongs').style.display = (subsongs.length > 1) ? 'block' : 'none'
	if(subsongs.length > 1) {
		var select = document.getElementById('subsong')
		// remove old
		for (let i = select.options.length-1; i > -1; i--) select.removeChild(select.options[i])
		var elt = document.createElement('option')
		elt.textContent = 'Play all subsongs'
		elt.value = -1
		select.appendChild(elt)
		for(var i = 0; i < subsongs.length; i++) {
			var elt = document.createElement('option')
			elt.textContent = subsongs[i]
			elt.value = i
			select.appendChild(elt)
		}
		select.selectedIndex = 0
		player.selectSubsong(-1)
	}

	document.getElementById('seekbar').value = 0
	updateDuration()

	document.getElementById('library-version').innerHTML = 'Version: '+ player.meta.libopenmptVersion +' ('+ player.meta.libopenmptBuild +')'
}

function updateDuration() {
	//var sec_num = player.duration()
	var sec_num = player.meta.dur
	var minutes = Math.floor(sec_num / 60)
	var seconds = Math.floor(sec_num % 60)
	if (seconds < 10) {seconds = '0' + seconds }
	document.getElementById('duration').innerHTML = minutes + ':' + seconds
	document.getElementById('seekbar').max = sec_num
}

// init ChiptunePlayer
function initPlayer() {
	window.player = new ChiptuneJsPlayer({repeatCount: 0})
	player.gain.gain.value = 0.5
	window.viz = new Visualizer(player.gain, myCanvas, {fft:11})

	// listen to events
	player.onEnded((ev) => {
		if(document.getElementById('autoplay').checked) {
			nextSong()
		}
	})
	player.onMetadata((meta) => {
		player.meta = meta
		setMetadata(document.getElementById('modfilename').innerHTML)
	})
	player.onProgress((dat) => {
		document.getElementById('seekbar').value = dat.pos
	})
	player.onError((err) => {
		nextSong()
	})

	// need to wait till player finished init
	function lateInit() {
		if (!player.processNode) {
			setTimeout(()=>{lateInit()},100)
			return
		}
		// ready!
		nextSong()
	}
	lateInit()

}

window.nextSong = (url) => {
	if (isLoading) return
	if (url == undefined) {
		url = songSel.worker.postMessage({msg:'getRandom', callback:'songSelCallback'})
		return
	}
	const parts = url.split('/')
	document.getElementById('modfilename').innerText = parts[parts.length-1]

	isLoading = true
	LDR.loadURL(url, (o)=>{
		if (!o.dat) return // not yet ready (damn, i need a 2nd callback both in one is not nice)
		const buffer = o.dat

		player.play(buffer)
		isLoading = false

		pitch.value = 1
		tempo.value = 1
		sizeInKB.innerText = (buffer.byteLength/1024).toFixed(2)
	})
}

// stupid no audio till user interaction policy thingy
function userInteracted() {
	removeEventListener('keydown', userInteracted)
	removeEventListener('click', userInteracted)
	removeEventListener('touchend', userInteracted)
	removeEventListener('contextmenu', userInteracted)

	audioModal.classList.add('fadeOut')

	initPlayer()

}
addEventListener('keydown', userInteracted)
addEventListener('click', userInteracted)
addEventListener('touchend', userInteracted)
addEventListener('contextmenu', userInteracted)


init()
function init() {
	const allowedExt = 'mptm mod s3m xm it 669 amf ams c67 dbm digi dmf dsm dsym dtm far fmt ice j2b m15 mdl med mms mt2 mtm mus nst okt plm psm pt36 ptm sfx sfx2 st26 stk stm stx stp symmod ult wow gdm mo3 oxm umx xpk ppm mmcmp'.split(' ')
	// removed: imf 
	let data = []

	let url = 'https://modland.com/allmods.zip'
	LDR.loadURL(url, (o)=>{
		if (!o.dat) return // not finished yet
		o.dat = o.dat['allmods.txt']
		const decoder = new TextDecoder()
		const txt = decoder.decode(o.dat)
		let rows = txt.split('\n')
		console.log(rows.length +' entries in '+ url)
		let found = 0
		for (let i = 0; i < rows.length; i++) {
			const cols = rows[i].split('\t')
			if (cols.length < 2) continue
			const tmp = cols[1].split('.')
			const ext = (tmp[tmp.length-1] == 'zip') ? tmp[tmp.length-2] : tmp[tmp.length-1] 	//last = ZIP
			if (allowedExt.indexOf(ext) !== -1)	{
				const parts = cols[1].split('/')
				const songname = parts[parts.length-1].replace('.zip','').replace('.'+ext,'') // songname is always the last part
				let tracker, artist
				// modland
				tracker = parts[0]
				artist = (parts.length == 5) ? parts[2] : parts[1]
				data.push( ['https://modland.com/pub/modules/'+cols[1], tracker, artist, songname, (cols[0]/1024).toFixed(2)] )
				found++
			}
		}
		console.log(found +' ('+(found/rows.length*100).toFixed(2)+'%) entries can be played by libopenmpt')			

		data = data.sort()
		
		// set html
		document.body.innerHTML = `<div id="info">
			<button onclick="player.togglePause()">Pause / Play</button>
			<input id="autoplay" type="checkbox" checked="checked" onchange="player.setRepeatCount(this.checked ? 0 : -1)"/> <label for="autoplay">Automatically play random tune when finished</label>
			<br/>
			<small id="library-version">&nbsp;</small>
			<br/>
			Filename: <span id="modfilename"></span> (<span id="sizeInKB"></span> kB)
			<br/>
			Title: <span id="title"></span> (<span id="duration"></span>)
			<br/>
			Position: <input id="seekbar" title="Position" type="range" min="0" max="100" value="0" oninput="player.setPos(this.value)"/>
			<br/>
			Volume: <input id="volume" title="Volume" type="range" min="0" max="1" value="0.5" step="0.0001" oninput="player.setVol(this.value)" ondblclick="this.value = 0.5"/>
			<br/>
			Pitch: <input id="pitch" title="Pitch" type="range" min="0.0001" max="2" value="1" step="0.0001" oninput="player.setPitch(this.value)" ondblclick="this.value = 1"/>
			<br/>
			Tempo: <input id="tempo" title="Tempo" type="range" min="0.0001" max="2" value="1" step="0.0001" oninput="player.setTempo(this.value)" ondblclick="this.value = 1"/>
			<br/>
			<div id="subsongs" style="display:none">Subsongs: <select id="subsong" onchange="player.selectSubsong(this.value)"></select></div>
			</div>
		<canvas id="myCanvas"></canvas>
		<kk-rows id="songSel" cb="songSelCallback" hide="0" head="Tracker|Artist/Year|Song|KB" css="td:nth-child(5){text-align:right}"></kk-rows>
		<!-- for audio playback policy -->
		<div id="audioModal">👉 💻 👂 🎶</div>`

		document.getElementById('songSel').setAttribute('data', JSON.stringify(data) )
		// kkRows clicked/getRandom callback
		window.songSelCallback = (r) => {
			nextSong( r.rng ? r.rng[0] : r[0] )
		}

		LDR.background = true

		oncontextmenu = (ev) => {
			nextSong()
			ev.preventDefault()
		}

		// dnd
		dnd(window, (aB) => {
			modfilename.innerHTML = ''
			sizeInKB.innerHTML = ''
			player.play(aB)
			setMetadata()
		})
	})
}
