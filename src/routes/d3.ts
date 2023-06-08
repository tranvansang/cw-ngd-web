import * as d3 from 'd3'

export function makeChartFrame(elm, title: string) {
	const minX = 0, minY = 0, maxY = 100, maxX = 200
	// set the dimensions and margins of the graph
	const margin = {top: 32, right: 8, bottom: 30, left: 32},
		width = 460 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;

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
