
export class WorkerPool{
	constructor(){
		this.workers = {};
	}

	getWorker(url){
		if (!this.workers[url]){
			this.workers[url] = [];
		}

		if (this.workers[url].length === 0){
			let worker = new Worker(url);
			this.workers[url].push(worker);
		}

		let worker = this.workers[url].pop();

		return worker;
	}

	returnWorker(url, worker){
		this.workers[url].push(worker);
	}

	dispose() {
		for (let url in this.workers){
			for (let worker of this.workers[url]){
				worker.terminate();
			}
		}
	}
};

//Potree.workerPool = new Potree.WorkerPool();
