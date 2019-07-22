module.exports = (source)=> {
	
	return source.match(/(function [a-zA-Z_{1}][a-zA-Z0-9_]+)(?=\()/g).map(f=>f.replace('function ', ''))
}