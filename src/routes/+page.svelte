<script lang="ts">
	import '../app.css'
	import {onMount} from 'svelte'
	import * as d3 from 'd3'
	import {bgPalette, lightColors, palette, tableauPalette} from './color'
	import type {RunPayload} from './dataUtil'
	import {gen_run_list, rawLoopData} from './dataUtil'
	import type {ChartPayload} from './d3'
	import {makeAxes, makeChartFrame} from './d3'
	import jcls from 'jcls'

	// list
	const runList = rawLoopData.flatMap(([jids, matrix, props = {}]) => [...gen_run_list(jids, matrix, props)])

	type Condition = Record<string, Set<string>>

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
	function isRunMatchedCondition(condition: Condition, {props}: RunPayload) {
		return Object.entries(props).every(([key, value]) => condition[key].has(value))
	}
	$: filteredRunList = runList.filter(isRunMatchedCondition.bind(null, selectedPropValues))
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

	let fixedColors = new Map<Condition, [string, boolean]>()
	$: fixedColorAllShown = [...fixedColors.values()].every(([, shown]) => shown)

	function getFixedColorOfRun(run) {
		return [...fixedColors.entries()].find(([condition]) => isRunMatchedCondition(condition, run))?.[1]
	}

	let trainingChart
	let testingChart
	let strokeOpacity = .7

	function drawOneGraph({graphGroup}: ChartPayload, {xAxis, yAxis}, graphSet, key) {
		const line = d3.line()
			.x((_, x) => xAxis(x))
			.y(y => yAxis(y))
		// Add the line
		const p = graphGroup
			.selectAll('path')
			.data([...graphSet])
		p.merge(
			p.enter()
				.append('path')
		).attr('fill', 'none')
			.attr('stroke-width', 1)
			.attr('d', ({[key]: yList}) => line(yList))
			.attr('opacity', strokeOpacity)
			.attr('stroke', run => getFixedColorOfRun(run)?.[0] ?? (colorizedProp
				? palette[allProps[colorizedProp].indexOf(run.props[colorizedProp]) % palette.length]
				: 'steelblue')
			)
		p.exit()
			.remove()
	}

	let trainingFrame, testingFrame, trainAxes, testAxes
	function drawTwoGraphs() {
		const withFixedColors = new Set(filteredRunList)
		for (const run of runList) {
			const fixedColor = getFixedColorOfRun(run)
			if (fixedColor) {
				if (fixedColor[1]) withFixedColors.add(run)
				else withFixedColors.delete(run)
			}
		}
		drawOneGraph(trainingFrame, trainAxes, withFixedColors, 'train')
		drawOneGraph(testingFrame, testAxes, withFixedColors, 'val')
	}

	let mounted
	let minY = 0, maxY = 100, minX = 0, maxX = 100
	$: if (minX > maxX) minX = maxX
	$: if (minY > maxY) minY = maxY
	function drawAxes() {
		trainAxes = makeAxes(trainingFrame, {minY, maxY, minX, maxX})
		testAxes = makeAxes(testingFrame, {minY, maxY, minX, maxX})
	}
	$: minY, maxY, minX, maxX, mounted && drawAxes()
	$: selectedPropValues, colorizedProp, strokeOpacity, trainAxes, testAxes, fixedColorAllShown, fixedColors, mounted && drawTwoGraphs()

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
	<div class="grid grid-cols-[repeat(3,max-content)] mx-2 gap-x-2 gap-y-1">
		{#each Object.entries(allProps) as [name, values]}
			<button type="button" on:click={() => {
				if (selectedPropValues[name].size === 0) {
					selectedPropValues[name] = new Set(values)
				} else {
					selectedPropValues[name].clear()
				}
				selectedPropValues = selectedPropValues
			}}>{ selectedPropValues[name].size ? 'x' : 'v' }</button>
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
							selectedPropValues[name].has(value)
								? jcls(
									'elevation-4',
									filteredRunList.filter(({props}) => props[name] === value).length // we check if there is any run with this value first and force the color to be blue. Because if there is no run with this value, there is no need to colorize it.
										? colorizedProp === name
											? jcls(
												bgPalette[allProps[name].indexOf(value) % bgPalette.length],
												(!lightColors.has(palette[allProps[name].indexOf(value) % palette.length]) && 'text-white')
											)
											: 'bg-blue-500 text-white'
										: 'bg-blue-500 text-red-300' // no data of this filter
								)
								: 'bg-blue-200 text-white'
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
		}} class="elevation-4">
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
			Min X: <input bind:value={minX} type="range" name="minX" min="0" max="100" step="1"/> ({minX})
		</div>
		<div>
			Max X: <input bind:value={maxX} type="range" name="maxX" min="0" max="100" step="1"/> ({maxX})
		</div>
	</div>
	<div>
		<div class="flex gap-2">
			<button type="button" on:click={() => {
			// get new color
			function getColor() {
				outer: for (const color of tableauPalette) {
					for (const [fixedColor] of fixedColors.values()) {
						if (color === fixedColor) continue outer
					}
					return color
				}
			}
			const color = getColor() ?? tableauPalette[0]
			const condition = Object.fromEntries(Object.entries(selectedPropValues).map(([name, values]) => [name, new Set(values)]))
			fixedColors.set(condition, [color, true])
			fixedColors = fixedColors
		}} disabled={!filteredRunList.filter(run => !getFixedColorOfRun(run)).length} class="elevation-4">Add</button>
			<button type="button" on:click={() => {
				for (const [condition, [color,]]of fixedColors.entries()) {
					fixedColors.set(condition, [color, !fixedColorAllShown])
				}
				fixedColors = fixedColors
			}} class="elevation-4">{fixedColorAllShown ? 'Hide' : 'Show'}</button>
			<button type="button" on:click={() => {
				fixedColors.clear()
				fixedColors = fixedColors
			}} class="elevation-4">Clear</button>
		</div>
		{#each [...fixedColors.entries()] as [condition, [color, show]]}
			<div class="flex gap-2 items-center">
				<button type="button" class="text-2xl" on:click={() => {
					fixedColors.delete(condition)
					fixedColors = fixedColors
				}}>x</button>
				<input type="checkbox" class="-mb-[.25rem]" on:change={() => {
				fixedColors.set(condition, [color, !show])
				fixedColors = fixedColors
			}} checked={show}/>
				<div class="font-bold text-xl" style="color: {color};">
					{
						Object
							.entries(condition)
							.filter(([name, values]) => runList.some(run => isRunMatchedCondition(condition, run) && values.has(run.props[name])))
							.map(([name, values]) => `${name} (${[...values].join(', ')})`)
							.join(' x ')
					}
				</div>
			</div>
		{/each}
	</div>
</div>
