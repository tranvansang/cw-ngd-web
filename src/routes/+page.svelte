<script lang="ts">
	import '../app.css'
	import {onMount} from 'svelte'
	import * as d3 from 'd3'
	import {rawData} from './data'

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
				momentum: ['0', '9', '99'],
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
				momentum: ['0', '9', '99'],
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
				momentum: ['0', '9'],
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

	function drawOneGraph({group, xAxis, yAxis}, graphList) {
		const line = d3.line()
			.x((_, x) => xAxis(x))
			.y(y => yAxis(y))
		// Add the line
		const p = group
			.selectAll('path')
			.data(graphList)
		p.enter()
			.append('path')
			.attr('fill', 'none')
			.attr('stroke', 'steelblue')
			.attr('stroke-width', 1.5)
			.attr('d', line)
			.attr('opacity', 0.7)
		p.exit()
			.remove()
	}

	let trainingFrame, testingFrame

	function drawTwoGraphs() {
		drawOneGraph(
			trainingFrame,
			runList.filter(({props}) => Object.entries(props).every(([key, value]) => selectedPropValues[key].has(value))).map(({train}) => train),
		)
		drawOneGraph(
			testingFrame,
			runList.filter(({props}) => Object.entries(props).every(([key, value]) => selectedPropValues[key].has(value))).map(({val}) => val)
		)
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
					class="px-1 py-0.5 rounded-md {selectedPropValues[name].has(value) ? 'bg-blue-500 text-white' : 'bg-blue-100 text-gray-500'}"
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
