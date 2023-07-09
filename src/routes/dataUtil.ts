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
		const data = rawData[jids[base >> 3]]?.[base & 7]
		if (data) yield {
			...parseRun(data),
			runName: `${jids[base >> 3]}.${base & 7}`,
			props,
		}
	}
}

export const rawLoopData = [
	// Date label: 2023-06-28_16-22-00
	// git: 066b5df46f3c25a78394ec6eeca62220579e94ae
	// msgd: weight_decay(2) x momentum(3) x lr(4)
	[
		[
			'2071790', // msgd_0
			'2071791', // msgd_1
			'2071792', // msgd_1
		],
		{
			optimizer: ['sgd'],
			dataset: ['cifar10'],
			batchSize: ['128'],
			weightDecay: ['0', '1e-4'],
			momentum: ['0', '0.9', '0.99'],
			learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
		},
	],
	// Date label: 2023-06-28_16-22-00
	// git: 066b5df46f3c25a78394ec6eeca62220579e94ae
	// #adam: weight_decay(2) x lr(4)
	[
		[
			'2071793', // adam_0
		],
		{
			optimizer: ['adam'],
			dataset: ['cifar10'],
			batchSize: ['128'],
			weightDecay: ['0', '1e-4'],
			learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
		},
	],

	// Date label: 2023-07-01_17-28-47
// git: f8ec2465dd9fde1621b48976f9cf1c83a2ae017b
// cwngd (simplify grad per sample): lr(4) x damping(4)
	// loss v1: sum, backprops: no scaled up, lls: mean, damping no scaling
	[
		[
			'2093571', // cwngd_0
			'2093572', // cwngd_1
		],
		{
			optimizer: ['cwngd'],
			dataset: ['cifar10'],
			batchSize: ['128'],
			learningRate: ['1e-4/bs', '1e-3/bs', '1e-2/bs', '1e-1/bs'],
			damping: ['1e-3/bs^2', '1e-4/bs^2', '1e-5/bs^2', '1e-6/bs^2'],
		},
	],
	// Date label: 2023-07-01_23-17-42
// git: 727e8920d7bbeb35313ba88f165eaa3c5e1ead98
// kfac (no clipping): lr(4) x damping(4)
	[
		[
			'2095114',
			'2095115',
		],
		{
			optimizer: ['kfac'],
			dataset: ['cifar10'],
			batchSize: ['128'],
			learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
			damping: ['1e-3', '1e-4', '1e-5', '1e-6'],
		},
	],
	// Date label: 2023-07-02_01-01-31
// git: 411a734a8e322cd12903532255d2c70db06f789f
// cwngd (old resnet full backward hook): lr(4) x damping(4)
	// loss v1: sum, backprops: no scaled up, lls: mean, damping no scaling
	[
		[
			'2095637',
			'2095638',
		],
		{
			optimizer: ['cwngd'],
			dataset: ['cifar10 (resnet18-old model)'],
			batchSize: ['128'],
			learningRate: ['1e-4/bs', '1e-3/bs', '1e-2/bs', '1e-1/bs'],
			damping: ['1e-3/bs^2', '1e-4/bs^2', '1e-5/bs^2', '1e-6/bs^2'],
		},
	],
	// Date label: 2023-07-02_10-47-32
// git: a00a03bd39c81999f37c2be55afa2c98e7817a63
// cwngd (out-node, no full backward): lr(4) x damping(4)
	[
		[
			'2097702',
			'2097703',
		],
		{
			optimizer: ['cwngd (out-node)'],
			dataset: ['cifar10'],
			batchSize: ['128'],
			learningRate: ['1e-4/bs', '1e-3/bs', '1e-2/bs', '1e-1/bs'],
			damping: ['1e-3/bs^2', '1e-4/bs^2', '1e-5/bs^2', '1e-6/bs^2'],
		},
	],
	// Date label: 2023-07-02_10-59-58
// git: 8ecb97c6fed74a9023661b14032fa07b5c7adb4d
// cwngd (full vmap): lr(4) x damping(4)
	// loss v1: sum, backprops: no scaled up, lls: mean, damping no scaling
	[
		[
			'2097739',
			'2097740',
		],
		{
			optimizer: ['cwngd (full vmap)'],
			dataset: ['cifar10'],
			batchSize: ['128'],
			learningRate: ['1e-4/bs', '1e-3/bs', '1e-2/bs', '1e-1/bs'],
			damping: ['1e-3/bs^2', '1e-4/bs^2', '1e-5/bs^2', '1e-6/bs^2'],
		},
	],


	// Date label: 2023-07-03_01-04-42
// git: d4d3a5683982772d229447d4c784aca5efbe39ba
// optimizer with damping: optimizer(2) x batch_size(3) x lr(4) x damping(4)
	// loss v1: sum, backprops: no scaled up, lls: mean, damping no scaling
	[
		[
			'2099069', // # run_1_0
			'2099070', // # run_1_1
			'2099071', // # run_1_2
			'2099072', // # run_1_3
			'2099073', // # run_1_4
			'2099074', // # run_1_5
		],
		{
			dataset: ['cifar10'],
			optimizer: ['cwngd'],
			batchSize: ['128', '512', '1024'],
			learningRate: ['1e-4/bs', '1e-3/bs', '1e-2/bs', '1e-1/bs'],
			damping: ['1e-3/bs^2', '1e-4/bs^2', '1e-5/bs^2', '1e-6/bs^2'],
		},
	],
	[
		[
			'2099075', // # run_1_6
			'2099076', // # run_1_7
			'2099077', // # run_1_8
			'2099078', // # run_1_9
			'2099079', // # run_1_10
			'2099080', // # run_1_11
		],
		{
			dataset: ['cifar10'],
			optimizer: ['kfac'],
			batchSize: ['128', '512', '1024'],
			learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
			damping: ['1e-3', '1e-4', '1e-5', '1e-6'],
		},
	],
	// Date label: 2023-07-03_01-04-42
// git: d4d3a5683982772d229447d4c784aca5efbe39ba
	// optimizer without damping: optimizer(2) x batch_size(3) x lr(4)
	[
		[
			'2099081', // # run_2_0
			'2099082', // # run_2_1
			'2099083', // # run_2_2
		],
		{
			dataset: ['cifar10'],
			optimizer: ['adam', 'sgd'],
			batchSize: ['128', '512', '1024'],
			learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
		},
	],
	// Date label: 2023-07-03_08-48-48
// git: 01093ef7bf418fb3c0373bbfff83056b0f2ae4f1
// cwngd old behavior: batch_size(3) x lr(4) x damping(4)
	// loss v2: avg, backprops: scaled by bs, lls: sum, damping scaled up by bs^2
	[
		[
			'2099385', //# run_1_0
			'2099386', //# run_1_1
			'2099387', //# run_1_2
			'2099388', //# run_1_3
			'2099389', //# run_1_4
			'2099390', //# run_1_5
		],
		{
			dataset: ['cifar10'],
			optimizer: ['cwngd'],
			batchSize: ['128', '512', '1024'],
			learningRate: ['1e-4', '1e-3', '1e-2', '1e-1'],
			damping: ['1e-3', '1e-4', '1e-5', '1e-6'],
		},
	],
	// Date label: 2023-07-03_09-18-51
// git: e7b0ef10cdc3a5c20c2ba544b6cfdf52f2436fce
// cwngd old with correct backprops: batch_size(3) x lr(4) x damping(4)
	// loss v3: avg, backprops: no scale, lls: sum, damping scaled up by bs^2
	[
		[
			'2099413', // # run_1_0
			'2099414', // # run_1_1
			'2099415', // # run_1_2
			'2099416', // # run_1_3
			'2099417', // # run_1_4
			'2099418', // # run_1_5
		],
		{
			dataset: ['cifar10'],
			optimizer: ['cwngd'],
			batchSize: ['128', '512', '1024'],
			learningRate: ['bs e-4', 'bs e-3', 'bs e-2', 'bs e-1'],
			damping: ['bs^2e-3', 'bs^2e-4', 'bs^2e-5', 'bs^2e-6'],
		},
	],

	// Date label: 2023-07-03_12-34-33
// git: 92372a78eb515fbbb45d48c3e76975d3f3c01871
// cwngd annealing: batch_size(3) x lr(4) x damping(4)
	// loss v4: sum, backprops: no scale, lls: mean, damping scaled up by bs^2
	[
		[
			'2100656', //# run_1_0
			'2100657', //# run_1_1
			'2100658', //# run_1_2
			'2100659', //# run_1_3
			'2100660', //# run_1_4
			'2100661', //# run_1_5
		],
		{
			dataset: ['cifar10'],
			optimizer: ['cwngd'],
			batchSize: ['128', '512', '1024'],
			learningRate: ['1e-4/bs', '1e-3/bs', '1e-2/bs', '1e-1/bs'],
			damping: ['1e-3', '1e-4', '1e-5', '1e-6'],
		},
	],

	// Date label: 2023-07-03_18-58-04
// git: 3a3e99983e93777a858adcd505bdf8cafe73baae
// cwngd massive lr and damping: lr(9) x damping(9)
	// loss v5: sum, backprops: no scale, lls: mean, damping no scale
	[
		[
			'2103276', // # run_0
			'2103277', // # run_1
			'2103278', // # run_2
			'2103279', // # run_3
			'2103280', // # run_4
			'2103281', // # run_5
			'2103282', // # run_6
			'2103283', // # run_7
			'2103284', // # run_8
			'2103285', // # run_9
			'2103286', // # run_10
		],
		{
			dataset: ['cifar10'],
			batchSize: ['128'],
			optimizer: ['cwngd'],
			learningRate: ['1e-4/bs', '1e-3/bs', '1e-2/bs', '1e-1/bs', '1/bs', '10/bs', '100/bs', '1000/bs', '10000/bs'],
			damping: ['1e-4/bs^2', '1e-3/bs^2', '1e-2/bs^2', '1e-1/bs^2', '1/bs^2', '10/bs^2', '100/bs^2', '1000/bs^2', '10000/bs^2'],
		}
	],
	// Date label: 2023-07-03_19-07-38
// git: 0555533d8eb58d8aacce67de916a4544d4670263
// more adam sgd: optimizer(2) x lr(4)
	[
		[
			'2103341', // # run_0
		],
		{
			dataset: ['cifar10'],
			batchSize: ['128'],
			optimizer: ['sgd', 'adam'],
			learningRate: ['1', '10', '100', '1000'],
		}
	],
	// Date label: 2023-07-04_21-00-14
// git: cb7f31e4be04feaad3213109bd4442726f13a38a
// cwngd mean grad with various batch size: damping(8) x batch_size(4) x lr(4)
	// loss v0: mean, backprops: no scale, lls: mean, damping no scale
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
			dataset: ['cifar10'],
			optimizer: ['cwngd'],
			damping: ['1e-6', '1e-5', '1e-4', '1e-3', '1e-2', '1e-1', '1', '10'],
			batchSize: ['32', '64', '128', '1024'],
			learningRate: ['1e-2', '1e-1', '1', '10'],
		}
	],
	// Date label: 2023-07-05_16-40-35
// git: 66b27f7addae2bf281a7675de250719538c2041f
// cwngd cifar100: bs(4) x damping(6) x lr(5)
	// loss v0: mean, backprops: no scale, lls: mean, damping no scale
	[
		[
			'2123117', // # run_0
			'2123118', // # run_1
			'2123119', // # run_2
			'2123120', // # run_3
		],
		{
			dataset: ['cifar100-resnet56-for-cifar10'], // -resnet56 (non-standard)
			optimizer: ['cwngd'],
			batchSize: ['32', '64', '128', '1024'],
			damping: ['1e-5', '1e-4', '1e-3', '1e-2', '1e-1', '1'],
			learningRate: ['1e-3', '1e-2', '1e-1', '1', '10'],
		}
	],
	// resnet for cifar100
	// Date label: 2023-07-05_21-14-13
// git: f86cca85e3646a93996ced02ebce3f85ce10015e
// cifar100, resnet for cifar100
// 	cwngd: damping(6)
	// loss v0: mean, backprops: no scale, lls: mean, damping no scale
	[
		[
			'2125247', // # run_0
		],
		{
			dataset: ['cifar100'], // resnet50 for cifar100
			optimizer: ['cwngd'],
			batchSize: ['32'],
			learningRate: ['1'],
			damping: ['1e-5', '1e-4', '1e-3', '1e-2', '1e-1', '1', '10', '100'],
		}
	],

	// Date label: 2023-07-05_05-39-04
// git: 0f0ce6d85ce122bd1d16911fb65c4d2df19cd459
// scan lr bs: optimizer(3) x batch_size(4) x lr(5)
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
			dataset: ['cifar10'],
			optimizer: ['kfac', 'adam', 'sgd'], // damping: 1e-2
			batchSize: ['32', '64', '128', '1024'],
			damping: ['1e-2'],
			learningRate: ['1e-3', '1e-2', '1e-1', '1', '10'],
		}
	],
	// Date label: 2023-07-06_03-58-27
// git: a4bbea2e3b5b0dbf82f1db9854adb4b5f1f7ea94
// cifar100, resnet50-cifar100
// by lr: optimizer(3) x lr(5)
	[
		[
			'2127735', // # run_0
			'2127736'
		],
		{
			dataset: ['cifar100'],
			optimizer: ['kfac', 'adam', 'sgd'],
			damping: ['1e-3'],
			batchSize: ['32'],
			learningRate: ['1e-3', '1e-2', '1e-1', '1', '10'],
		}
	],
	// Date label: 2023-07-05_23-27-49
// git: 4ebb4b5ddd2f332a8e1316d4c44ca1e0385d1a31
// stl10, resnet18
// by lr: optimizer(3) x lr(5)
	[
		[
			'2125967', // # run_0
			'2125968'
		],
		{
			dataset: ['stl10'],
			optimizer: ['kfac', 'adam', 'sgd'],
			damping: ['1e-3'],
			batchSize: ['32'],
			learningRate: ['1e-3', '1e-2', '1e-1', '1', '10'],
		}
	],
	// 8 nodes
	// Date label: 2023-07-06_20-37-36
// git: 6470542187994aff0dd8140f3a345bcfac078411
	[
		[
			'2023-07-06_20-37-36-Dimagenet-Mresnet18-Omsgd-LR0.1-BS256',
		],
		{
			dataset: ['imagenet'],
			optimizer: ['sgd'],
			batchSize: ['1024'],
			learningRate: ['1e-1'],
		}
	],
	// Date label: 2023-07-07_14-48-46
// git: 6dfdb0d46141ac152d98fefbb3dd5117cb81ccb7
// cwngd try mnist: optimizer(3) x batch_size(4) x lr(4)
	[
		[
			'2144465', // # run_0
			'2144466', // # run_1
			'2144467', // # run_2
			'2144468', // # run_3
			'2144469', // # run_4
			'2144470', // # run_5
		],
		{
			optimizer: ['kfac', 'adam', 'sgd'],
			dataset: ['mnist'],
			batchSize: ['32', '64', '128', '1024'],
			learningRate: ['1e-3', '1e-2', '1e-1', '1'],
			damping: ['1e-3'],
		}
	],

	// Date label: 2023-07-07_11-23-15
// git: f0595748243eea9f004c9f4e7f82fd9b652c1cf5
// cwngd scaling down damping by batch size: batch_size(4) x dataset(3)
	// loss v6: mean, backprops: no scale, lls: mean, damping scaled down by bs
	[
		[
			'2142274', // # run_0
			'2142275'
		],
		{
			optimizer: ['cwngd'],
			damping: ['1/bs'],
			learningRate: ['1'],
			batchSize: ['32', '64', '128', '512', '1024'],
			dataset: ['cifar10', 'cifar100', 'stl10'],
		}
	],
	// Date label: 2023-07-07_12-40-42
// git: 53a008237c380f6fc8c843bd4e97cdd0fc0be213
// cwngd try mnist: bs(4) x damp(6) x lr(4)
	// loss v6: mean, backprops: no scale, lls: mean, damping scaled down by bs
	[
		[
			'2142998', // # run_0
			'2142999', // # run_1
			'2143000', // # run_2
			'2143001', // # run_3
			'2143002', // # run_4
			'2143003', // # run_5
			'2143004', // # run_6
			'2143005', // # run_7
			'2143006', // # run_8
			'2143008', // # run_9
			'2143010', // # run_10
			'2143011', // # run_11
		],
		{
			optimizer: ['cwngd'],
			dataset: ['mnist'],
			batchSize: ['32', '64', '128', '1024'],
			damping: ['1e-3/bs', '1e-2/bs', '1e-1/bs', '1/bs', '10/bs', '100/bs'],
			learningRate: ['1e-2', '1e-1', '1', '10'],
		}
	],
	// Date label: 2023-07-05_21-24-48
// git: d9b4cd8de525c954a9d95e1102992d88153b84ac
// stl10, resnet18
// cwngd: damping(6)
	[
		[
			'2125319', // # run_0
		],
		{
			dataset: ['stl10'],
			optimizer: ['cwngd'],
			damping: ['1e-5/bs', '1e-4/bs', '1e-3/bs', '1e-2/bs', '1e-1/bs', '1/bs', '10/bs', '100/bs'],
			batchSize: ['32'],
			learningRate: ['1'],
		}
	],
	[
		[
			'2023-07-08_07-14-56-Dimagenet-Oadam',
		],
		{
			dataset: ['imagenet'],
			optimizer: ['adam'],
			batchSize: ['1024'],
			learningRate: ['1e-3'],
		}
	],

	[
		[
			'2167066', // # run_0
			'2167067', // # run_1
			'2167068', // # run_2
			'2167069', // # run_3
			'2167070', // # run_4
			'2167071', // # run_5
			'2167072', // # run_6
			'2167073', // # run_7
			'2167074', // # run_8
			'2167075', // # run_9
			'2167076', // # run_10
			'2167077', // # run_11
			'2167078', // # run_12
			'2167079', // # run_13
			'2167080', // # run_14
			'2167081', // # run_15
		],
		{
			optimizer: ['adam-ngd'],
			dataset: ['cifar10'],
			batchSize: ['32', '64', '128', '1024'],
			damping: ['1e-8', '1e-6', '1e-4', '1e-3'],
			strategy: ['full', 'inout-node'],
			learningRate: ['1e-3', '1e-2', '1e-1', '1'],
		},
	],
	[
		[
			'2167300', // # run_0
			'2167301', // # run_1
			'2167302', // # run_2
			'2167303', // # run_3
			'2167304', // # run_4
			'2167305', // # run_5
			'2167307', // # run_6
			'2167309', // # run_7
			'2167311', // # run_8
			'2167313', // # run_9
			'2167315', // # run_10
			'2167317', // # run_11
			'2167319', // # run_12
			'2167321', // # run_13
			'2167323', // # run_14
			'2167325', // # run_15
		],
		{
			optimizer: ['adam-ngd'],
			dataset: ['cifar10'],
			batchSize: ['32', '64', '128', '1024'],
			damping: ['1e-8', '1e-6', '1e-4', '1e-3'],
			strategy: ['out-node', 'inout-node'],
			learningRate: ['1e-3', '1e-2', '1e-1', '1'],
		},
	],
]
// list
export const runList = rawLoopData.flatMap(([jids, matrix, props = {}]) => [...gen_run_list(jids, matrix, props)])
export type Condition = Record<string, Set<string>>

export function isRunMatchedCondition(condition: Condition, {props}: RunPayload) {
	return Object.entries(props).every(([key, value]) => condition[key]?.has?.(value))
}
