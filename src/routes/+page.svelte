<script lang="ts">
	import '../app.css'
	import {onMount} from 'svelte'
	import * as d3 from 'd3'
	import {bgPalette, palette} from './color'
	import {gen_run_list, rawLoopData} from './dataUtil'
	import {makeChartFrame} from './d3'
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
	$: selectedPropValues, colorizedProp, mounted && drawTwoGraphs()

	onMount(() => {
		trainingFrame = makeChartFrame(trainingChart, 'Training Accuracy')
		testingFrame = makeChartFrame(testingChart, 'Testing Accuracy')
		mounted = true
	})

	$: allDeselected = Object.values(selectedPropValues).every(s => s.size === 0)
</script>

<div class="flex">
	<div bind:this={trainingChart} class="[&>svg]:w-full grow basis-0"></div>
	<div bind:this={testingChart} class="[&>svg]:w-full grow basis-0"></div>
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
							filteredRunList.filter(({props}) => props[name] === value).length > 1
								? selectedPropValues[name].has(value)
									? jcls(
										'text-white elevation-4',
										colorizedProp === name
											? bgPalette[allProps[name].indexOf(value)]
											: 'bg-blue-500'
									) : 'bg-blue-300 text-gray-500' // not used
								: 'bg-blue-200 text-gray-500',
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
	</div>
</div>
