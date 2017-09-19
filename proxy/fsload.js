var fs   = require('fs');    
var mime = require('./mimetype').mime;  

function filesLoad(filePath, type, res){    
    fs.exists(filePath, exists => {    
        if ( !exists ) {  
            res.writeHead(404, {'Content-Type': 'text/plain'});    
            res.end();    
        } else {    
            fs.readFile(filePath, 'binary', function(err, file){    
                if ( err ) {    
                    res.writeHead(500, {'Content-Type': 'text/plain'});    
                    res.end();    
                } else {    
                    res.writeHead(200, {'Content-Type': mime[type] ? mime[type] : 'text/plain'});    
                    res.write(file, 'binary');    
                    res.end();    
                }    
            });    
        }
    })    
}    

exports.fsload = filesLoad