<script lang="ts">
	import '../app.css'
	import {onMount} from 'svelte'
	import * as d3 from 'd3'
	import {bgPalette, lightColors, palette} from './color'
	import {gen_run_list, rawLoopData} from './dataUtil'
	import {makeAxes, makeChartFrame} from './d3'
	import type {ChartPayload} from './d3'
	import jcls from 'jcls'

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

	let forcedColorizedProp
	let selectedPropValues = Object.fromEntries(Object.entries(allProps).map(([key, values]) => [key, new Set(values)]))
	$: filteredRunList = runList.filter(({props}) => Object.entries(props).every(([key, value]) => selectedPropValues[key].has(value)))
	// first prop with multiple selected values
	$: colorizedProp = forcedColorizedProp ?? Object
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

	let trainingChart
	let testingChart
	let strokeOpacity = .7

	function drawOneGraph({graphGroup}: ChartPayload, {xAxis, yAxis}, graphList, key) {
		const line = d3.line()
			.x((_, x) => xAxis(x))
			.y(y => yAxis(y))
		// Add the line
		const p = graphGroup
			.selectAll('path')
			.data(graphList)
		p.merge(
			p.enter()
				.append('path')
		).attr('fill', 'none')
			.attr('stroke-width', 1)
			.attr('d', ({[key]: yList}) => line(yList))
			.attr('opacity', strokeOpacity)
			.attr('stroke', ({props}) => colorizedProp ? palette[allProps[colorizedProp].indexOf(props[colorizedProp])] : 'steelblue')
		p.exit()
			.remove()
	}

	let trainingFrame, testingFrame, trainAxes, testAxes
	function drawTwoGraphs() {
		drawOneGraph(trainingFrame, trainAxes, filteredRunList, 'train')
		drawOneGraph(testingFrame, testAxes, filteredRunList, 'val')
	}

	let mounted
	let minY = 0, maxY = 100, minX = 0, maxX = 200
	$: if (minX > maxX) minX = maxX
	$: if (minY > maxY) minY = maxY
	function drawAxes() {
		trainAxes = makeAxes(trainingFrame, {minY, maxY, minX, maxX})
		testAxes = makeAxes(testingFrame, {minY, maxY, minX, maxX})
	}
	$: minY, maxY, minX, maxX, mounted && drawAxes()
	$: selectedPropValues, colorizedProp, strokeOpacity, trainAxes, testAxes, mounted && drawTwoGraphs()

	onMount(() => {
		trainingFrame = makeChartFrame(trainingChart)
		testingFrame = makeChartFrame(testingChart)
		mounted = true
	})

	$: allDeselected = Object.values(selectedPropValues).every(s => s.size === 0)
</script>

<div class="flex">
	<div class="grow basis-0">
		<div class="text-center text-4xl">
			Training Accuracy
		</div>
		<div bind:this={trainingChart} class="[&>svg]:w-full"></div>
	</div>
	<div class="grow basis-0">
		<div class="text-center text-4xl">
			Testing Accuracy
		</div>
		<div bind:this={testingChart} class="[&>svg]:w-full"></div>
	</div>
</div>

<div class="flex gap-2">
	<div class="grid grid-cols-[max-content,max-content] mx-2 gap-1">
		{#each Object.entries(allProps) as [name, values]}
			<div class="flex gap-1 items-center">
				<input type="checkbox" on:change={() => {
				if (forcedColorizedProp === name) forcedColorizedProp = undefined
				else forcedColorizedProp = name
			}} checked={forcedColorizedProp === name}/>
				<label for="prop-{name}" class="font-bold">{name}: </label>
			</div>
			<div id="prop-{name}" class="flex gap-2">
				{#each values as value}
					<button
						type="button"
						class={jcls(
							'px-2 py-1 rounded-md',
							filteredRunList.filter(({props}) => props[name] === value).length
								? jcls(
									'elevation-4',
									colorizedProp === name
										? jcls(
											bgPalette[allProps[name].indexOf(value)],
											!lightColors.has(palette[allProps[name].indexOf(value)]) && 'text-white',
										)
										: 'bg-blue-500 text-white'
								)
								: 'bg-blue-200 text-gray-500'
						)}
						on:click={() => {
						if (selectedPropValues[name].has(value)) selectedPropValues[name].delete(value)
						else selectedPropValues[name].add(value)
						selectedPropValues = selectedPropValues
					}}
					>{value}</button>
				{/each}
			</div>
		{/each}
	</div>
	<div>
		<button on:click={() => {
			if (allDeselected) {
				for (const [name, values] of Object.entries(allProps)) {
					for (const value of values) {
						selectedPropValues[name].add(value)
					}
				}
			} else {
				for (const [name, values] of Object.entries(allProps)) {
					for (const value of values) {
						selectedPropValues[name].delete(value)
					}
				}
			}
			selectedPropValues = selectedPropValues
		}}>
			{allDeselected ? 'Select All' : 'De-select All'}
		</button>
		<div>
			Opacity: <input bind:value={strokeOpacity} type="range" name="strokeOpacity" min="0" max="1" step="0.05"/> ({strokeOpacity})
		</div>
		<div>
			Min Y: <input bind:value={minY} type="range" name="minY" min="0" max="100" step="1"/> ({minY})
		</div>
		<div>
			Max Y: <input bind:value={maxY} type="range" name="maxY" min="0" max="100" step="1"/> ({maxY})
		</div>
		<div>
			Min X: <input bind:value={minX} type="range" name="minX" min="0" max="200" step="1"/> ({minX})
		</div>
		<div>
			Max X: <input bind:value={maxX} type="range" name="maxX" min="0" max="200" step="1"/> ({maxX})
		</div>
	</div>
</div>
