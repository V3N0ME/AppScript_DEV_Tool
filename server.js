const app = require('express')();
const fs = require('fs');
const open = require('open')
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const extractFunctions = require('./utils/extractFunctions');

const RootPath = '/Users/vinoth/CodingMart_Taks/MailThatReport/';
const mainFilePath = 'html/main.html';

const libScript = `<script type="text/javascript">` + fs.readFileSync('lib.js') + '</script>';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const functions = getFunctionNames();

app.post('/run', (req, res)=>{

	const name = req.body.name;
	const params = req.body.params;

	exec(`cd ${RootPath} && clasp run ${name} -p ${params}`, (err, stdout, stderr)=>{

		if(err || stderr) {

			res.json({
				code: 500,
				res: err || stderr
			})
		}
		else {

			res.json({
				code: 200,
				res: stdout
			});
		} 

		res.end();

	});

});

app.get('/refresh', (req, res)=>{

	const watch = fs.watch(RootPath, { recursive: true }, (event, filename)=> {
    	
		//console.log(event);
		//console.log(filename);

		if(filename) {

			res.json({refresh: true});
			res.end();

			watch.close();
		}

	});

});

app.get('/', (req, res)=>{

	let mainFile = fs.readFileSync(RootPath + mainFilePath).toString();

	const regex = mainFile.match(/include\('(.*)'\);/g).map(item=>{

		item = item
				.replace(`include('`, '')
				.replace(`');`, '')

		const file = fs.readFileSync(RootPath + item + '.html').toString()

		mainFile = mainFile.replace(`<?!= include('${item}'); ?>`, file)

	});

	mainFile = mainFile.replace('react.production.min', 'react.development');
	mainFile = mainFile.replace('react-dom.production.min', 'react-dom.development');

	//Inject functions
	mainFile += 
	`
		<script type="text/javascript">
		window.funcs = ['${functions.join("','")}'];
		</script>
	`;
	mainFile += libScript;

	res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(mainFile);
    res.end();

});

function getFunctionNames() {

	const files = fs.readdirSync(RootPath)

	const functions = [];

	for(const file of files) {

		if(file.endsWith('.js')) {

			const source = fs.readFileSync(RootPath + file).toString()
			functions.push(...extractFunctions(source));
		}
	}

	return functions;
}

app.listen(8080, ()=> {

	console.log('Server Running !');
	open('http://localhost:8080');

});
