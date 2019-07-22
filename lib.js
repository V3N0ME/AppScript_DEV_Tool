
/*const orgError = console.error;

console.error = (err) => {

	orgError(err);
	alert(err);

};*/

class Run {

	constructor() {

		this.name = '';
		this.params = '[]';

		this.success = ()=>{};
		this.failure = ()=>{};
	}

	withSuccessHandler(callback) {

		this.success = callback;
		return this;
	}

	withFailureHandler(callback) {

		this.failure = callback;
		return this;
	}

	execute() {

		const params = this.params;
		const name = this.name;

		const xhr = new XMLHttpRequest();
		xhr.open('POST', '/run');
		xhr.onreadystatechange = ()=> {

			if(xhr.readyState === 4) {

				var response = xhr.responseText;

				try {

					response = JSON.parse(response);
				}
				catch(err) {

				}

				if(xhr.responseCode === 200) {

					this.success(response);
				}
				else {

					this.failure(response);
				}
			}

		};
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		//xhr.send('name=' + name + '&params=' + params);
	}
}

var google = {
	script: {
		run: new Run()
	}
};

for(const func of window.funcs) {

	Run.prototype[func] = (...args)=> {

		google.script.run.name = func;
		google.script.run.params = JSON.stringify(args);

		google.script.run.execute();
	};
}

function poll() {

	const xhr = new XMLHttpRequest();
	xhr.open('GET', '/refresh');
	xhr.onreadystatechange = ()=> {

		if(xhr.readyState === 4 && xhr.status === 200) {

			location.reload(false);
		}
	};
	xhr.send();
}

poll();