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
	[
		[
			//msgd: momentum(3) x lr(4)
			'2071790', // msgd_0
			'2071791', // msgd_1
			'2071792', // msgd_1
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
			// #adam: weight_decay(2) x lr(4)
			'2071793', // adam_0
		],
		{
			weightDecay: ['0', '1e-4'],
			learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
		},
		{optimizer: 'adam'}
	],
	[
		[
			// #cwngd: weight_decay(2) x momentum(3) x lr(4) x damping(4)
			'2071746', // cwngd_0
			'2071747', // cwngd_1
			'2071748', // cwngd_2
			'2071749', // cwngd_3
			'2071750', // cwngd_4
			'2071751', // cwngd_5
			'2071752', // cwngd_6
			'2071753', // cwngd_7
			'2071754', // cwngd_8
			'2071755', // cwngd_9
			'2071756', // cwngd_10
			'2071757', // cwngd_11

			'2073860', // # cwngd_0
			'2073861', // # cwngd_1
			'2073862', // # cwngd_2
			'2073863', // # cwngd_3
			'2073864', // # cwngd_4
			'2073865', // # cwngd_5
			'2073866', // # cwngd_6
			'2073867', // # cwngd_7
			'2073868', // # cwngd_8
			'2073869', // # cwngd_9
			'2073870', // # cwngd_10
			'2073871', // # cwngd_11
		],
		{
			strategy: ['inout', 'out'],
			weightDecay: ['0', '1e-4'],
			momentum: ['0', '0.9', '0.99'],
			learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
			damping: ['1e-3', '1e-4', '1e-5', '1e-6'],
		},
		{optimizer: 'cwngd'}
	],
	[
		[
			//#kfac: weight_decay(2) x momentum(2) x lr(3) x damping(4)
			'2073926', // kfac_0
			'2073927', // kfac_1
			'2073928', // kfac_2
			'2073929', // kfac_3
			'2073930', // kfac_4
			'2073931', // kfac_5
			'2073932', // kfac_6
			'2073933', // kfac_7
			'2073934', // kfac_8
			'2073935', // kfac_9
			'2073936', // kfac_10
			'2073937', // kfac_11
		],
		{
			weightDecay: ['0', '1e-4'],
			// clipping: ['0', '1e-1'],
			momentum: ['0', '0.9'],
			learningRate: ['1e-3', '1e-2', '1e-1'],
			damping: ['1e-3', '1e-4', '1e-5', '1e-6'],
		},
		{optimizer: 'kfac'}
	],
	[
		// #Date label: 2023-06-29_16-49-27
// #git: 2127164e728965fc00c0ba0b5c5543a6494abd5b
// #cwngd (adam-ngd): weight_decay(2) x lr(4) x damping(4)
		[
			'2078092', // cwngd_0
			'2078093', // cwngd_1
			'2078094', // cwngd_2
			'2078095', // cwngd_3
		],
		{
			weightDecay: ['0', '1e-4'],
			// clipping: ['0', '1e-1'],
			// momentum: ['0', '0.9'],
			learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
			damping: ['1e-3', '1e-4', '1e-5', '1e-6'],
		},
		{optimizer: 'adam-ngd'}
	],

// #Date label: 2023-06-29_19-09-53
// #git: b075c278a3bd0bb5b9cc805c4b9061c27d95aaca
// #cwngd (temp rollback to bs scaling): lr(4) x damping(4)
	[
		[
			'2083860', // cwngd_0
			'2083861', // cwngd_1
		],
		{
			learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
			damping: ['1e-3', '1e-4', '1e-5', '1e-6'],
		},
		{optimizer: 'cwngd-old-behavior'}
	]
	// [
	// 	[
	// 		// all models: optimizer(4) x model(6)
	// 		'2006071', // kfac_0
	// 		'2006072', // kfac_1
	// 		'2006073', // kfac_2
	// 	],
	// 	{
	// 		optimizer: ['msgd', 'adam', 'cwngd', 'kfac'],
	// 		model: ['resnet20', 'resnet32', 'resnet44', 'resnet56', 'resnet110', 'resnet1202'],
	// 	},
	// 	{}
	// ]
]
