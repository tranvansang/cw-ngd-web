<script lang="ts">
	import '../app.css'
	import {onMount} from 'svelte'
	import * as d3 from 'd3'
	import {rawData} from './data'

	// https://www.w3.org/wiki/CSS/Properties/color/keywords
	// Basic Colors
	const basicColors = [
		// Named	Numeric	Color name	Hex rgb	Decimal
		'black', //	#000000	0,0,0
		'silver', //	#C0C0C0	192,192,192
		'gray', //	#808080	128,128,128
		'white', //	#FFFFFF	255,255,255
		'maroon', //	#800000	128,0,0
		'red', //	#FF0000	255,0,0
		'purple', //	#800080	128,0,128
		'fuchsia', //	#FF00FF	255,0,255
		'green', //	#008000	0,128,0
		'lime', //	#00FF00	0,255,0
		'olive', //	#808000	128,128,0
		'yellow', //	#FFFF00	255,255,0
		'navy', //	#000080	0,0,128
		'blue', //	#0000FF	0,0,255
		'teal', //	#008080	0,128,128
		'aqua', //	#00FFFF	0,255,255
	]
	// Extended colors
	const extendedColors = [
		// Named	Numeric	Color name	Hex rgb	Decimal
		'aliceblue', //	#f0f8ff	240,248,255
		'antiquewhite', //	#faebd7	250,235,215
		'aqua', //	#00ffff	0,255,255
		'aquamarine', //	#7fffd4	127,255,212
		'azure', //	#f0ffff	240,255,255
		'beige', //	#f5f5dc	245,245,220
		'bisque', //	#ffe4c4	255,228,196
		'black', //	#000000	0,0,0
		'blanchedalmond', //	#ffebcd	255,235,205
		'blue', //	#0000ff	0,0,255
		'blueviolet', //	#8a2be2	138,43,226
		'brown', //	#a52a2a	165,42,42
		'burlywood', //	#deb887	222,184,135
		'cadetblue', //	#5f9ea0	95,158,160
		'chartreuse', //	#7fff00	127,255,0
		'chocolate', //	#d2691e	210,105,30
		'coral', //	#ff7f50	255,127,80
		'cornflowerblue', //	#6495ed	100,149,237
		'cornsilk', //	#fff8dc	255,248,220
		'crimson', //	#dc143c	220,20,60
		'cyan', //	#00ffff	0,255,255
		'darkblue', //	#00008b	0,0,139
		'darkcyan', //	#008b8b	0,139,139
		'darkgoldenrod', //	#b8860b	184,134,11
		'darkgray', //	#a9a9a9	169,169,169
		'darkgreen', //	#006400	0,100,0
		'darkgrey', //	#a9a9a9	169,169,169
		'darkkhaki', //	#bdb76b	189,183,107
		'darkmagenta', //	#8b008b	139,0,139
		'darkolivegreen', //	#556b2f	85,107,47
		'darkorange', //	#ff8c00	255,140,0
		'darkorchid', //	#9932cc	153,50,204
		'darkred', //	#8b0000	139,0,0
		'darksalmon', //	#e9967a	233,150,122
		'darkseagreen', //	#8fbc8f	143,188,143
		'darkslateblue', //	#483d8b	72,61,139
		'darkslategray', //	#2f4f4f	47,79,79
		'darkslategrey', //	#2f4f4f	47,79,79
		'darkturquoise', //	#00ced1	0,206,209
		'darkviolet', //	#9400d3	148,0,211
		'deeppink', //	#ff1493	255,20,147
		'deepskyblue', //	#00bfff	0,191,255
		'dimgray', //	#696969	105,105,105
		'dimgrey', //	#696969	105,105,105
		'dodgerblue', //	#1e90ff	30,144,255
		'firebrick', //	#b22222	178,34,34
		'floralwhite', //	#fffaf0	255,250,240
		'forestgreen', //	#228b22	34,139,34
		'fuchsia', //	#ff00ff	255,0,255
		'gainsboro', //	#dcdcdc	220,220,220
		'ghostwhite', //	#f8f8ff	248,248,255
		'gold', //	#ffd700	255,215,0
		'goldenrod', //	#daa520	218,165,32
		'gray', //	#808080	128,128,128
		'green', //	#008000	0,128,0
		'greenyellow', //	#adff2f	173,255,47
		'grey', //	#808080	128,128,128
		'honeydew', //	#f0fff0	240,255,240
		'hotpink', //	#ff69b4	255,105,180
		'indianred', //	#cd5c5c	205,92,92
		'indigo', //	#4b0082	75,0,130
		'ivory', //	#fffff0	255,255,240
		'khaki', //	#f0e68c	240,230,140
		'lavender', //	#e6e6fa	230,230,250
		'lavenderblush', //	#fff0f5	255,240,245
		'lawngreen', //	#7cfc00	124,252,0
		'lemonchiffon', //	#fffacd	255,250,205
		'lightblue', //	#add8e6	173,216,230
		'lightcoral', //	#f08080	240,128,128
		'lightcyan', //	#e0ffff	224,255,255
		'lightgoldenrodyellow', //	#fafad2	250,250,210
		'lightgray', //	#d3d3d3	211,211,211
		'lightgreen', //	#90ee90	144,238,144
		'lightgrey', //	#d3d3d3	211,211,211
		'lightpink', //	#ffb6c1	255,182,193
		'lightsalmon', //	#ffa07a	255,160,122
		'lightseagreen', //	#20b2aa	32,178,170
		'lightskyblue', //	#87cefa	135,206,250
		'lightslategray', //	#778899	119,136,153
		'lightslategrey', //	#778899	119,136,153
		'lightsteelblue', //	#b0c4de	176,196,222
		'lightyellow', //	#ffffe0	255,255,224
		'lime', //	#00ff00	0,255,0
		'limegreen', //	#32cd32	50,205,50
		'linen', //	#faf0e6	250,240,230
		'magenta', //	#ff00ff	255,0,255
		'maroon', //	#800000	128,0,0
		'mediumaquamarine', //	#66cdaa	102,205,170
		'mediumblue', //	#0000cd	0,0,205
		'mediumorchid', //	#ba55d3	186,85,211
		'mediumpurple', //	#9370db	147,112,219
		'mediumseagreen', //	#3cb371	60,179,113
		'mediumslateblue', //	#7b68ee	123,104,238
		'mediumspringgreen', //	#00fa9a	0,250,154
		'mediumturquoise', //	#48d1cc	72,209,204
		'mediumvioletred', //	#c71585	199,21,133
		'midnightblue', //	#191970	25,25,112
		'mintcream', //	#f5fffa	245,255,250
		'mistyrose', //	#ffe4e1	255,228,225
		'moccasin', //	#ffe4b5	255,228,181
		'navajowhite', //	#ffdead	255,222,173
		'navy', //	#000080	0,0,128
		'oldlace', //	#fdf5e6	253,245,230
		'olive', //	#808000	128,128,0
		'olivedrab', //	#6b8e23	107,142,35
		'orange', //	#ffa500	255,165,0
		'orangered', //	#ff4500	255,69,0
		'orchid', //	#da70d6	218,112,214
		'palegoldenrod', //	#eee8aa	238,232,170
		'palegreen', //	#98fb98	152,251,152
		'paleturquoise', //	#afeeee	175,238,238
		'palevioletred', //	#db7093	219,112,147
		'papayawhip', //	#ffefd5	255,239,213
		'peachpuff', //	#ffdab9	255,218,185
		'peru', //	#cd853f	205,133,63
		'pink', //	#ffc0cb	255,192,203
		'plum', //	#dda0dd	221,160,221
		'powderblue', //	#b0e0e6	176,224,230
		'purple', //	#800080	128,0,128
		'red', //	#ff0000	255,0,0
		'rosybrown', //	#bc8f8f	188,143,143
		'royalblue', //	#4169e1	65,105,225
		'saddlebrown', //	#8b4513	139,69,19
		'salmon', //	#fa8072	250,128,114
		'sandybrown', //	#f4a460	244,164,96
		'seagreen', //	#2e8b57	46,139,87
		'seashell', //	#fff5ee	255,245,238
		'sienna', //	#a0522d	160,82,45
		'silver', //	#c0c0c0	192,192,192
		'skyblue', //	#87ceeb	135,206,235
		'slateblue', //	#6a5acd	106,90,205
		'slategray', //	#708090	112,128,144
		'slategrey', //	#708090	112,128,144
		'snow', //	#fffafa	255,250,250
		'springgreen', //	#00ff7f	0,255,127
		'steelblue', //	#4682b4	70,130,180
		'tan', //	#d2b48c	210,180,140
		'teal', //	#008080	0,128,128
		'thistle', //	#d8bfd8	216,191,216
		'tomato', //	#ff6347	255,99,71
		'turquoise', //	#40e0d0	64,224,208
		'violet', //	#ee82ee	238,130,238
		'wheat', //	#f5deb3	245,222,179
		'white', //	#ffffff	255,255,255
		'whitesmoke', //	#f5f5f5	245,245,245
		'yellow', //	#ffff00	255,255,0
		'yellowgreen', //	#9acd32	154,205,50
	]

	const palette = [
		'red', //	#FF0000	255,0,0
		'green', //	#008000	0,128,0
		'blue', //	#0000FF	0,0,255
		'aqua', //	#00FFFF	0,255,255
		'lime', //	#00FF00	0,255,0
		'fuchsia', //	#FF00FF	255,0,255
		'navy', //	#000080	0,0,128
		'purple', //	#800080	128,0,128
		'teal', //	#008080	0,128,128
		'gray', //	#808080	128,128,128
		// 'black', //	#000000	0,0,0
		// 'silver', //	#C0C0C0	192,192,192
		// 'white', //	#FFFFFF	255,255,255
		// 'maroon', //	#800000	128,0,0
		// 'olive', //	#808000	128,128,0
		// 'yellow', //	#FFFF00	255,255,0
	]
	const bgPalette = [
		'bg-[red]', //	#FF0000	255,0,0
		'bg-[green]', //	#008000	0,128,0
		'bg-[blue]', //	#0000FF	0,0,255
		'bg-[aqua]', //	#00FFFF	0,255,255
		'bg-[lime]', //	#00FF00	0,255,0
		'bg-[fuchsia]', //	#FF00FF	255,0,255
		'bg-[navy]', //	#000080	0,0,128
		'bg-[purple]', //	#800080	128,0,128
		'bg-[teal]', //	#008080	0,128,128
		'bg-[gray]', //	#808080	128,128,128
	]

	function parseRun(raw: string) {
		const lines = raw.split('\n')
		return {
			train: lines.filter((_, i) => i % 2 === 0).map(Number),
			val: lines.filter((_, i) => i % 2 === 1).map(Number),
		}
	}

	function *gen_run_list(
		jids: string[],
		matrix: Record<string, string[]>,
		props: Record<string, string>,
		base = 0,
	): Generator<{
		train: number[]
		val: number[]
		props: Record<string, string>
	}, void, unknown> {
		if (Object.keys(matrix).length) {
			const [key, values] = Object.entries(matrix)[0]
			for (let i = 0; i < values.length; i++) {
				yield *gen_run_list(
					jids,
					Object.fromEntries(Object.entries(matrix).filter(([k]) => k !== key)),
					{...props, [key]: values[i]},
					base * values.length + i,
				)
			}
		} else {
			yield {
				...parseRun(rawData[jids[base >> 3]][base & 7]),
				props,
			}
		}
	}

	const rawLoopData = [
		[
			[
				//msgd: momentum(3) x lr(4)
				'1997879', // msgd_0
				'1998385', // msgd_1
				'1997880', // msgd_1
			],
			{
				weightDecay: ['0', '1e-4'],
				momentum: ['0', '0.9', '0.99'],
				learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
			},
			{optimizer: 'msgd'}
		],
		[
			[
				//adam: lr(4)
				'1997881', // adam_0
			],
			{
				weightDecay: ['0', '1e-4'],
				learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
			},
			{optimizer: 'adam'}
		],
		[
			[
				//cwngd: momentum(3) x lr(4) x damping(4)
				'1997882', // cwngd_0
				'1997883', // cwngd_1
				'1997884', // cwngd_2
				'1997885', // cwngd_3
				'1997886', // cwngd_4
				'1997887', // cwngd_5
				'1997888', // cwngd_6
				'1997889', // cwngd_7
				'1997890', // cwngd_8
				'1997891', // cwngd_9
				'1997892', // cwngd_10
				'1997893', // cwngd_11
			],
			{
				weightDecay: ['0', '1e-4'],
				momentum: ['0', '0.9', '0.99'],
				learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
				damping: ['1e-3', '1e-4', '1e-5', '1e-6'],
			},
			{optimizer: 'cwngd'}
		],
		[
			[
				//kfac: weight_decay(2) x clipping(2) x momentum(2) x lr(3) x damping(4)
				'1998922', // kfac_0
				'1998923', // kfac_1
				'1998924', // kfac_2
				'1998925', // kfac_3
				'1998926', // kfac_4
				'1998927', // kfac_5
				'1998928', // kfac_6
				'1998929', // kfac_7
				'1998930', // kfac_8
				'1998931', // kfac_9
				'1998932', // kfac_10
				'1998933', // kfac_11
			],
			{
				weightDecay: ['0', '1e-4'],
				clipping: ['0', '1e-1'],
				momentum: ['0', '0.9'],
				learningRate: ['1e-3', '1e-2', '1e-1'],
				damping: ['1e-3', '1e-4', '1e-5', '1e-6'],
			},
			{optimizer: 'kfac'}
		],
	]
	// list
	const runList = rawLoopData.flatMap(([jids, matrix, props]) => [...gen_run_list(jids, matrix, props)])

	// collect properties
	const allProps: Record<string, string[]> = {}
	for (const {props} of runList) {
		for (const [key, value] of Object.entries(props)) {
			if (!allProps[key]) {
				allProps[key] = []
			}
			if (!allProps[key].includes(value)) {
				allProps[key].push(value)
			}
		}
	}

	// sort props values if they are all numbers
	for (const [key, values] of Object.entries(allProps)) {
		if (values.every(v => !isNaN(+v))) {
			allProps[key] = values.sort((a, b) => +a - +b)
		}
	}

	let selectedPropValues = Object.fromEntries(Object.entries(allProps).map(([key, values]) => [key, new Set(values)]))
	$: filteredRunList = runList.filter(({props}) => Object.entries(props).every(([key, value]) => selectedPropValues[key].has(value)))
	// first prop with multiple selected values
	$: colorizedProp = Object
		.entries(selectedPropValues)
		.find(
			(
				[name, values]
				// there are at least 2 values with each having at least 1 run
			) => [...values].filter(
				v => filteredRunList.some(({props}) => props[name] === v)
			).length > 1
		)?.[0]
	// colorize by the index in the original list of prop values, to keep the same color for the same value

	const minX = 0, minY = 0, maxY = 100, maxX = 200
	// set the dimensions and margins of the graph
	const margin = {top: 32, right: 8, bottom: 30, left: 32},
		width = 460 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;


	let trainingChart
	let testingChart

	function makeChartFrame(elm, title: string) {
		// append the svg object to the body of the page
		const svg = d3.select(elm)
			.append('svg')
			.attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
			// .attr('width', width + margin.left + margin.right)
			// .attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left}, ${margin.top})`)

		// add title
		svg.append('text')
			.attr('class', 'title')
			.attr('x', width / 2)
			.attr('y', 0 - (margin.top / 2))
			.attr('text-anchor', 'middle')
			.text(title);

		// Add X axis --> it is a date format
		const xAxis = d3.scaleLinear()
			.domain([minX, maxX])
			.range([0, width]);
		svg.append('g')
			.attr('transform', `translate(0, ${height})`)
			.call(d3.axisBottom(xAxis));

		// Add Y axis
		const yAxis = d3.scaleLinear()
			.domain([minY, maxY])
			.range([height, 0]);
		svg.append('g')
			.call(d3.axisLeft(yAxis));

		// add y gridlines
		svg.append('g')
			.attr('class', 'grid')
			.call(d3.axisLeft(yAxis)
				.tickSize(-width)
				.tickFormat('' as any)
			)
			.attr('opacity', 0.2)
			.attr('stroke-width', 1)

		const group = svg.append('g')

		return {svg, group, xAxis, yAxis}
	}

	function drawOneGraph({group, xAxis, yAxis}, graphList, key) {
		const line = d3.line()
			.x((_, x) => xAxis(x))
			.y(y => yAxis(y))
		// Add the line
		const p = group
			.selectAll('path')
			.data(graphList)
		p.merge(
			p.enter()
				.append('path')
		).attr('fill', 'none')
			.attr('stroke-width', 1.5)
			.attr('d', ({[key]: yList}) => line(yList))
			.attr('opacity', 0.7)
			.attr('stroke', ({props}) => colorizedProp ? palette[allProps[colorizedProp].indexOf(props[colorizedProp])] : 'steelblue')
		p.exit()
			.remove()
	}

	let trainingFrame, testingFrame
	function drawTwoGraphs() {
		drawOneGraph(trainingFrame, filteredRunList, 'train')
		drawOneGraph(testingFrame, filteredRunList, 'val')
	}

	let mounted
	$: selectedPropValues, mounted && drawTwoGraphs()

	onMount(() => {
		trainingFrame = makeChartFrame(trainingChart, 'Training Accuracy')
		testingFrame = makeChartFrame(testingChart, 'Testing Accuracy')
		mounted = true
	})
</script>

<div class="flex">
	<div bind:this={trainingChart} class="[&>svg]:w-full grow basis-0"></div>
	<div bind:this={testingChart} class="[&>svg]:w-full grow basis-0"></div>
</div>

<div class="grid grid-cols-[min-content,auto,min-content,auto] mx-2 gap-1">
	{#each Object.entries(allProps) as [name, values]}
		<label for="prop-{name}" class="font-bold">{name}: </label>
		<div id="prop-{name}" class="flex gap-2">
			{#each values as value}
				<button
					type="button"
					class="px-1 py-0.5 rounded-md {
					selectedPropValues[name].has(value)
						? colorizedProp === name
							? `${bgPalette[allProps[name].indexOf(value)]} text-white`
							: 'bg-blue-500 text-white'
						: 'bg-blue-100 text-gray-500'
					}"
					on:click="{() => {
						if (selectedPropValues[name].has(value)) selectedPropValues[name].delete(value)
						else selectedPropValues[name].add(value)
						selectedPropValues = selectedPropValues
					}}"
				>{value}</button>
			{/each}
		</div>
	{/each}
</div>
