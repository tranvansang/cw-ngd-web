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
			'2043975', // cwngd_0
			'2043976', // cwngd_1
			'2043977', // cwngd_2
			'2043978', // cwngd_3
			'2043979', // cwngd_4
			'2043980', // cwngd_5
			'2043981', // cwngd_6
			'2043982', // cwngd_7
			'2043983', // cwngd_8
			'2043984', // cwngd_9
			'2043985', // cwngd_10
			'2043986', // cwngd_11
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
	[
		[
			// all models: optimizer(4) x model(6)
			'2006071', // kfac_0
			'2006072', // kfac_1
			'2006073', // kfac_2
		],
		{
			optimizer: ['msgd', 'adam', 'cwngd', 'kfac'],
			model: ['resnet20', 'resnet32', 'resnet44', 'resnet56', 'resnet110', 'resnet1202'],
		},
		{}
	]
]
