import {rawData} from './data'

function parseRun(raw: string) {
	const lines = raw.split('\n')
	return {
		train: lines.filter((_, i) => i % 2 === 0).map(Number),
		val: lines.filter((_, i) => i % 2 === 1).map(Number),
	}
}

export function* gen_run_list(
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
]
