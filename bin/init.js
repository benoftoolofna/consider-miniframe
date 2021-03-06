const path = require('path')
const ncp = require('ncp')
const fs = require('fs');
const chalk = require('chalk');
const { spawn } = require('child_process');
const readline = require('readline');
let rl
const utils = require('./utils');
let projectID, slug, accessToken;
let rootDir;

module.exports = () => {
	rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	console.log(chalk.green('\n\nConsider.js initializing functions webhook project'))
	console.log(chalk.green("=================================\n"))

	exports.setProjectID()
		.then(exports.setProjectTitle)
		.then(exports.setAccessToken)
		.then(exports.cloneDirectory)
		.then(exports.cleanFiles)
		.then(exports.templateProjectSettings)
		.then(exports.npmInstall)
		.then(() => {
			rl.close();
			console.log(
				chalk.green('Project successfully initialized!  Please run')+
				chalk.white(' considerjs sync ')+
				chalk.green('to match your local dev environment to Dialogflow.')
			)
		})
}

exports.setProjectID = () => {
	return new Promise((resolve, reject) => {
		const tryToGetID = () => {
			rl.question('Please enter your Google Actions Project ID: ', (pID) => {
				if(pID.length === 0) return tryToGetID();
				projectID = pID;
				resolve();
			});
		}
		tryToGetID()
	})
}




exports.setProjectTitle = (pID) => {
	return new Promise((resolve, reject) => {
		const tryToGetSlug = () => {
			rl.question('Please choose a project slug: ', (projectslug) => {
				if(projectslug.length === 0) return tryToGetSlug();
				slug = projectslug;
				resolve();
			});
		}
		tryToGetSlug()
	})
}


exports.setAccessToken = () => {
	return new Promise((resolve, reject) => {
		const tryToGetAT = () => {
			rl.question('Please enter your Dialogflow Developer access token: ', (aT) => {
				if(aT.length === 0) return tryToGetAT();
				accessToken = aT;
				resolve();
			});
		}
		tryToGetAT()
	})
}

exports.cloneDirectory = (source, destination) => {
	return new Promise((resolve, reject) => {

		let source = path.resolve(__dirname, "../templates/functions/");
		let destination = path.resolve(process.cwd(),`functions/`);

		if (fs.existsSync(path.resolve(process.cwd(),`functions`))){ 
			return console.error(chalk.red(`!! Another functions folder already exists in this location. Please remove or change locations !!`))
		}
		fs.mkdirSync(path.resolve(process.cwd(),`functions`));
		ncp(source, destination, (err) => {
			if (err) return console.error(err);
			console.log(chalk.green('Project successfully scaffolded!\n\n'));
			rootDir = path.resolve(process.cwd(),'functions/')
			resolve()
		});
	})
}

exports.templateProjectSettings = () => {
	utils.openTemplateSave(`${rootDir}/.firebaserc`, {pID:projectID});
	utils.openTemplateSave(`${rootDir}/package.json`, {projectslug:slug, pID: projectID});
	// utils.openTemplateSave(`${rootDir}/.access_token`, {aT:accessToken});
	fs.writeFileSync(`${rootDir}/.access_tokens/${slug}`, accessToken)
	return Promise.resolve();
}


exports.cleanFiles = () => {
	// fs.unlinkSync(`${rootDir}/actions/.ignore`)
	fs.renameSync(`${rootDir}/_.gitignore`, `${rootDir}/.gitignore`)
	return Promise.resolve()
}


exports.npmInstall = () => {
	return new Promise((resolve, reject) => {
		console.log(chalk.yellow('Now installing dependencies...\n\n\n'));
		const install =  spawn('npm', ['--prefix', './functions', 'install', './functions'])
		install.stdout.on('data', (data) => {
		  console.log(`stdout: ${data}`);
		});

		install.stderr.on('data', (data) => {
		  console.log(`stderr: ${data}`);
		});

		install.on('close', (code) => {
		  console.log(`child process exited with code ${code}`);
		  resolve()
		});
	})
	
}