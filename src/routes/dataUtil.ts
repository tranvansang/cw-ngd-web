import {rawData} from './data'

function parseRun(raw: string) {
	const lines = raw.split('\n')
	return {
		train: lines.filter((_, i) => i % 2 === 0).map(Number),
		val: lines.filter((_, i) => i % 2 === 1).map(Number),
	}
}

export interface RunPayload {
	train: number[]
	val: number[]
	props: Record<string, string>
}

export function* gen_run_list(
	jids: string[],
	matrix: Record<string, string[]>,
	props: Record<string, string>,
	base = 0,
): Generator<RunPayload, void, unknown> {
	if (Object.keys(matrix).length) {
		const [key, values] = Object.entries(matrix)[0]
		for (let i = 0; i < values.length; i++) {
			yield* gen_run_list(
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

export const rawLoopData = [
	// [
	// 	[
	// 		//msgd: momentum(3) x lr(4)
	// 		'2071790', // msgd_0
	// 		'2071791', // msgd_1
	// 		'2071792', // msgd_1
	// 	],
	// 	{
	// 		weightDecay: ['0', '1e-4'],
	// 		momentum: ['0', '0.9', '0.99'],
	// 		learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
	// 	},
	// 	{optimizer: 'msgd'}
	// ],
	// [
	// 	[
	// 		// #adam: weight_decay(2) x lr(4)
	// 		'2071793', // adam_0
	// 	],
	// 	{
	// 		weightDecay: ['0', '1e-4'],
	// 		learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
	// 	},
	// 	{optimizer: 'adam'}
	// ],
	// [
	// 	[
	// 		'2093571', // cwngd_0
	// 		'2093572', // cwngd_1
	// 	],
	// 	{
	// 		learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
	// 		damping: ['1e-3', '1e-4', '1e-5', '1e-6'],
	// 	},
	// 	{optimizer: 'cwngd-simplified'}
	// ],
	// [
	// 	[
	// 		'2093595', // cwngd_0
	// 		'2093597', // cwngd_1
	// 	],
	// 	{
	// 		learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
	// 		damping: ['1e-3', '1e-4', '1e-5', '1e-6'],
	// 	},
	// 	{optimizer: 'adam-ngd'}
	// ],
	// [
	// 	[
	// 		'2095114',
	// 		'2095115',
	// 	],
	// 	{
	// 		learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
	// 		damping: ['1e-3', '1e-4', '1e-5', '1e-6'],
	// 	},
	// 	{optimizer: 'kfac'}
	// ],
	// [
	// 	[
	// 		'2095637',
	// 		'2095638',
	// 	],
	// 	{
	// 		learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
	// 		damping: ['1e-3', '1e-4', '1e-5', '1e-6'],
	// 	},
	// 	{optimizer: 'cwngd (fullbackward, old resnet)'}
	// ],
	// [
	// 	[
	// 		'2097702',
	// 		'2097703',
	// 	],
	// 	{
	// 		learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
	// 		damping: ['1e-3', '1e-4', '1e-5', '1e-6'],
	// 	},
	// 	{optimizer: 'cwngd (out-node, fullbackward)'}
	// ],
	// [
	// 	[
	// 		'2097739',
	// 		'2097740',
	// 	],
	// 	{
	// 		learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
	// 		damping: ['1e-3', '1e-4', '1e-5', '1e-6'],
	// 	},
	// 	{optimizer: 'cwngd (full vmap)'}
	// ],
	//

	// #optimizer with damping: optimizer(2) x batch_size(3) x lr(4) x damping(4)
	// [
	// 	[
	// 		'2099069', // # run_1_0
	// 		'2099070', // # run_1_1
	// 		'2099071', // # run_1_2
	// 		'2099072', // # run_1_3
	// 		'2099073', // # run_1_4
	// 		'2099074', // # run_1_5
	// 		'2099075', // # run_1_6
	// 		'2099076', // # run_1_7
	// 		'2099077', // # run_1_8
	// 		'2099078', // # run_1_9
	// 		'2099079', // # run_1_10
	// 		'2099080', // # run_1_11
	// 	],
	// 	{
	// 		optimizer: ['cwngd', 'kfac'],
	// 		batch_size: ['128', '512', '1024'],
	// 		learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
	// 		damping: ['1e-3', '1e-4', '1e-5', '1e-6'],
	// 	},
	// ],
	// #optimizer without damping: optimizer(2) x batch_size(3) x lr(4)
	// [
	// 	[
	// 		'2099081', // # run_2_0
	// 		'2099082', // # run_2_1
	// 		'2099083', // # run_2_2
	// 	],
	// 	{
	// 		optimizer: ['adam', 'sgd'],
	// 		batch_size: ['128', '512', '1024'],
	// 		learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
	// 	},
	// ],
	// // #cwngd old behavior: batch_size(3) x lr(4) x damping(4)
	// [
	// 	[
	// 		'2099385', //# run_1_0
	// 		'2099386', //# run_1_1
	// 		'2099387', //# run_1_2
	// 		'2099388', //# run_1_3
	// 		'2099389', //# run_1_4
	// 		'2099390', //# run_1_5
	// 	],
	// 	{
	// 		optimizer: ['cwngd old behavior'],
	// 		batch_size: ['128', '512', '1024'],
	// 		learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
	// 		damping: ['1e-3', '1e-4', '1e-5', '1e-6'],
	// 	},
	// ],
	// #cwngd old with correct backprops: batch_size(3) x lr(4) x damping(4)
	// [
	// 	[
	// 		'2099413', // # run_1_0
	// 		'2099414', // # run_1_1
	// 		'2099415', // # run_1_2
	// 		'2099416', // # run_1_3
	// 		'2099417', // # run_1_4
	// 		'2099418', // # run_1_5
	// 	],
	// 	{
	// 		optimizer: ['cwngd old correct backprops'],
	// 		batch_size: ['128', '512', '1024'],
	// 		learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
	// 		damping: ['1e-3', '1e-4', '1e-5', '1e-6'],
	// 	},
	// ],

	// [
	// 	[
	// 		'2100656', //# run_1_0
	// 		'2100657', //# run_1_1
	// 		'2100658', //# run_1_2
	// 		'2100659', //# run_1_3
	// 		'2100660', //# run_1_4
	// 		'2100661', //# run_1_5
	// 	],
	// 	{
	// 		optimizer: ['cwngd annealing'],
	// 		batch_size: ['128', '512', '1024'],
	// 		learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
	// 		damping: ['1e-3', '1e-4', '1e-5', '1e-6'],
	// 	},
	// ],

	// #Date label: 2023-07-03_18-58-04
// #git: 3a3e99983e93777a858adcd505bdf8cafe73baae
// #cwngd massive lr and damping: lr(9) x damping(9)
// 	[
// 		[
// 			'2103276', // # run_0
// 			'2103277', // # run_1
// 			'2103278', // # run_2
// 			'2103279', // # run_3
// 			'2103280', // # run_4
// 			'2103281', // # run_5
// 			'2103282', // # run_6
// 			'2103283', // # run_7
// 			'2103284', // # run_8
// 			'2103285', // # run_9
// 			'2103286', // # run_10
// 		],
// 		{
// 			optimizer: ['cwngd annealing'],
// 			learningRate: ['1e-4', '1e-3', '1e-2', '1e-1', '1', '10', '100', '1000', '10000'],
// 			damping: ['1e-4', '1e-3', '1e-2', '1e-1', '1', '10', '100', '1000', '10000'],
// 		}
// 	],
// 	[
// 		[
// 			'2103341', // # run_0
// 		],
// 		{
// 			optimizer: ['sgd', 'adam'],
// 			learningRate: ['1', '10', '100', '1000'],
// 		}
// 	],
	[
		[
			'2114256', // # run_0
			'2114257', // # run_1
			'2114258', // # run_2
			'2114259', // # run_3
			'2114260', // # run_4
			'2114261', // # run_5
			'2114262', // # run_6
			'2114263', // # run_7
			'2114264', // # run_8
			'2114265', // # run_9
			'2114266', // # run_10
			'2114267', // # run_11
			'2114268', // # run_12
			'2114269', // # run_13
			'2114270', // # run_14
			'2114271', // # run_15
		],
		{
			optimizer: ['cwngd'],
			damping: ['1e-6', '1e-5', '1e-4', '1e-3', '1e-2', '1e-1', '1', '10'],
			batch_size: ['32', '64', '128', '1024'],
			learningRate: ['1e-2', '1e-1', '1', '10'],
		}
	],
	[
		[
			'2117906', // # run_0
			'2117907', // # run_1
			'2117908', // # run_2
			'2117909', // # run_3
			'2117910', // # run_4
			'2117911', // # run_5
			'2117912', // # run_6
			'2117913', // # run_7
		],
		{
			optimizer: ['kfac', 'adam', 'sgd'],
			batch_size: ['32', '64', '128', '1024'],
			learningRate: ['1e-3', '1e-2', '1e-1', '1', '10'],
		}
	],
]
