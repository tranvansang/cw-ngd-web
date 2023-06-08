import * as d3 from 'd3'

const margin = {top: 10, right: 8, bottom: 30, left: 32},
	width = 460 - margin.left - margin.right,
	height = 390 - margin.top - margin.bottom;

export function makeChartFrame(elm: SVGElement) {
	// set the dimensions and margins of the graph
	// append the svg object to the body of the page
	const svg = d3.select(elm)
		.append('svg')
		.attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
		// .attr('width', width + margin.left + margin.right)
		// .attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', `translate(${margin.left}, ${margin.top})`)

	// // add title
	// svg.append('text')
	// 	.attr('x', width / 2)
	// 	.attr('y', 0 - (margin.top / 2))
	// 	.attr('text-anchor', 'middle')
	// 	.text(title);

	const graphGroup = svg.append('g')
	const axesGroup = svg.append('g')

	return {svg, graphGroup, axesGroup}
}

export type ChartPayload = ReturnType<typeof makeChartFrame>

function createOrUpdate(g, name) {
	return g.select(`.${name}`).empty()
		? g.append('g').attr('class', name)
		: g.select(`.${name}`)
}

export function makeAxes({axesGroup}: ChartPayload, {minY, maxY, minX, maxX}: Record<string, number>) {
	// Add Y axis
	const yAxis = d3.scaleLinear()
		.domain([minY, maxY])
		.range([height, 0]);
	createOrUpdate(axesGroup, 'y-axis')
		.call(d3.axisLeft(yAxis));

	// add y gridlines
	createOrUpdate(axesGroup, 'y-gridlines')
		.call(d3.axisLeft(yAxis)
			.tickSize(-width)
			.tickFormat('' as any)
		)
		.attr('opacity', 0.2)
		.attr('stroke-width', 1)

	// Add X axis
	const xAxis = d3.scaleLinear()
		.domain([minX, maxX])
		.range([0, width]);
	createOrUpdate(axesGroup, 'x-axis')
		.attr('transform', `translate(0, ${height})`)
		.call(d3.axisBottom(xAxis));

	return {xAxis, yAxis}
}
