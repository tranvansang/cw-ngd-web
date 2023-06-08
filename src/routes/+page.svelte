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
	const minX = 0, minY = 0, maxY = 100, maxX = 200
	// set the dimensions and margins of the graph
	const margin = {top: 32, right: 30, bottom: 30, left: 60},
		width = 460 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;


	let el

	onMount(() => {
		const toDraw = runList
		// append the svg object to the body of the page
		const svg = d3.select(el)
			.append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', `translate(${margin.left}, ${margin.top})`)

		// add title
		svg.append('text')
			.attr('class', 'title')
			.attr('x', width / 2)
			.attr('y', 0 - (margin.top / 2))
			.attr('text-anchor', 'middle')
			.text('Training Accuracy');

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

		const line = d3.line().x(({x}) => xAxis(x)).y(({y}) => yAxis(y))

		for (const singleTrain of toDraw) {
			// Add the line
			svg.append('path')
				.datum(singleTrain.train.map((acc, idx) => ({x: idx, y: acc})))
				.attr('fill', 'none')
				.attr('stroke', 'steelblue')
				.attr('stroke-width', 1.5)
				.attr('d', line)
				.attr('opacity', 0.7)
		}
	})
</script>

<style lang="postcss">
	.chart svg {
		font: 10px sans-serif;
		background-color: steelblue;
		text-align: right;
		padding: 3px;
		margin: 1px;
		color: white;
	}
</style>

<h1>CW NGD Visualization</h1>
<div bind:this={el} class="chart"></div>
