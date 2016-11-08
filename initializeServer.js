var variables = require('./variables');

exports.loadServer = function(){
    if(isServerLoaded)
        return;

    variables.http.createServer(function(request, respond) {
        var headers = request.headers,
            method = request.method,
            url = request.url,
            body = [],
            database = fs.readFileSync('betaDummy.json'),
            dbContent = JSON.parse(database);
        
        request.on('error', function(err){
            console.error(err);
        }).on('data', function(chunk){
            body.push(chunk);
        }).on('end', function(){
            body = Buffer.concat(body).toString();
            
            respond.on('error', function(err){
                console.error(err);
            });
            respond.statusCode = 200;
            respond.setHeader('Content-Type', 'application/json');
        
            respond.writeHead(200, {
            'Content-Type': 'text/html'
            });
    
            if(method == 'POST'){
                var jsonBody = JSON.parse(body);
                if(jsonBody.username && jsonBody.username != ' ')
                    dbContent['username'] += jsonBody.username;
                if(jsonBody.password && jsonBody.password != ' ')
                    dbContent['password'] += jsonBody.password;
                if(jsonBody.secretQuestion && jsonBody.secretQuestion != ' ')
                    dbContent['secretQuestion'] += jsonBody.secretQuestion;
            }
            
            var responseBody = {
                headers: headers,
                method: method,
                url: url,
                body: dbContent
            };
            
            res.write(JSON.stringify(responseBody));
            respond.end();
            fs.writeFileSync('betaDummy.json', JSON.stringify(dbContent));
        });
    }).listen(1234);
    
    console.log('Mamo ne se qdosvai');
    isServerLoaded = true;
}