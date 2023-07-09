import {isRunMatchedCondition, runList} from './routes/dataUtil'

const conditions = [
	{
		dataset: 'mnist',
		batchSize: '1024',
		optimizer: 'cwngd',
		learningRate: '1e-2',
		damping: '1e-3/bs',
	},
// 	...[		'cifar10',
// 		'cifar100',
// 		'stl10',
// 		'mnist',].flatMap(ds => [
// '1024', '512', '128', '64', '32'
// 	].map(bs => (
// 		{
// 			dataset: ds,
// 			batchSize: bs,
// 			optimizer: 'sgd',
// 			learningRate: '1e-1',
// 		}
// 	))),
	// ...['1024', '512', '128', '64', '32'].map(bs => (
	// 	{
	// 		dataset: 'cifar10',
	// 		batchSize: bs,
	// 		optimizer: 'adam',
	// 		learningRate: '1e-3',
	// 	}
	// )),
	// {
	// 	dataset: 'stl10',
	// 	batchSize: '32',
	// 	optimizer: 'adam',
	// 	learningRate: '1e-3',
	// },
	// ...['1024', '128', '64', '32'].map(bs => (
	// 	{
	// 		dataset: 'mnist',
	// 		batchSize: bs,
	// 		optimizer: 'adam',
	// 		learningRate: '1e-3',
	// 	}
	// )),
	// {
	// 	dataset: 'mnist',
	// 	batchSize: '64',
	// 	optimizer: 'adam',
	// 	learningRate: '1e-2',
	// }
	// // cwngd cifar10
	// {
	// 	dataset: 'cifar10',
	// 	batchSize: '1024',
	// 	optimizer: 'cwngd',
	// 	learningRate: '1e-2',
	// 	damping: '1e-5'
	// },
	// {
	// 	dataset: 'cifar10',
	// 	batchSize: '512',
	// 	optimizer: 'cwngd',
	// 	learningRate: '1e-2',
	// 	damping: '1e-5'
	// },
	// {
	// 	dataset: 'cifar10',
	// 	batchSize: '128',
	// 	optimizer: 'cwngd',
	// 	learningRate: '100/bs',
	// 	damping: '100/bs^2'
	// },
	// {
	// 	dataset: 'cifar10',
	// 	batchSize: '64',
	// 	optimizer: 'cwngd',
	// 	learningRate: '1e-2',
	// 	damping: '1e-2'
	// },
	// {
	// 	dataset: 'cifar10',
	// 	batchSize: '32',
	// 	optimizer: 'cwngd',
	// 	learningRate: '1',
	// 	damping: '1e-2'
	// },
	// // cwngd cifar100
	// {
	// 	dataset: 'cifar100',
	// 	batchSize: '128',
	// 	optimizer: 'cwngd',
	// 	learningRate: '1',
	// 	damping: '1/bs'
	// },
	// {
	// 	dataset: 'cifar100',
	// 	batchSize: '64',
	// 	optimizer: 'cwngd',
	// 	learningRate: '1',
	// 	damping: '1/bs'
	// },
	// {
	// 	dataset: 'cifar100',
	// 	batchSize: '32',
	// 	optimizer: 'cwngd',
	// 	learningRate: '1',
	// 	damping: '1'
	// },
	// // cwngd stl10
	// {
	// 	dataset: 'stl10',
	// 	batchSize: '32',
	// 	optimizer: 'cwngd',
	// 	learningRate: '1',
	// 	damping: '1/bs'
	// },
	// // cwngd mnist
	// {
	// 	dataset: 'mnist',
	// 	batchSize: '1024',
	// 	optimizer: 'cwngd',
	// 	learningRate: '1e-2',
	// 	damping: '1e-3/bs'
	// },
	// {
	// 	dataset: 'mnist',
	// 	batchSize: '128',
	// 	optimizer: 'cwngd',
	// 	learningRate: '1e-1',
	// 	damping: '1/bs'
	// },
	// {
	// 	dataset: 'mnist',
	// 	batchSize: '64',
	// 	optimizer: 'cwngd',
	// 	learningRate: '1',
	// 	damping: '10/bs'
	// },
	// {
	// 	dataset: 'mnist',
	// 	batchSize: '32',
	// 	optimizer: 'cwngd',
	// 	learningRate: '1',
	// 	damping: '10/bs'
	// },
]

for (const cond of conditions) {
	console.log(
		`${cond.dataset} - ${cond.batchSize} - ${cond.optimizer} - ${cond.learningRate}: `,
		runList
			.filter(
				({props}) => !Object.entries(cond).some(([key, val]) => props[key] !== val)
			)
			.map(({runName, props}) => ({runName, props}))
	)
}
