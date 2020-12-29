// import axios from "axios.js";

const XMLHttpRequestLoader = (path, callback) =>
{
	if (path == null || callback == null) { return; }

	const request = new XMLHttpRequest();
	const onLoad = e => {
		callback({ result: e.target.response });
		request.removeEventListener("load", onLoad);
	};
	request.addEventListener("load", onLoad);
	request.open('GET', path, true);
	request.send();
};

const loadAsset = (path, callback) =>
{
	XMLHttpRequestLoader(path, callback);
};

const loadJSON = (path, callback) =>
{
	XMLHttpRequestLoader(path, callback);
}

const loadCSV = (path, callback) =>
{
	XMLHttpRequestLoader(path, callback);
};

const convertCSVtoArray2D = (str, column = 3) =>
{
	if (str == null) { return []; }

	let result = [];
	const tmp = str.split("\n");

	for(let i = 0; i < tmp.length; i++)
	{
		result[i] = tmp[i].split(",");
	}

	return result;
};

export {
	loadAsset,
	loadJSON,
	loadCSV,
	convertCSVtoArray2D
}
