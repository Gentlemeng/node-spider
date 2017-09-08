var http = require('http');


var cheerio = require('cheerio');
// var request=require('request');
var xlsx = require('node-xlsx');
var fs = require('fs');
var url = 'http://index.1688.com/alizs/market.htm?userType=purchaser&cat=122916001';

function fetchPage(x) {
    startRequest(x);
}

function startRequest(x) {
    http.get(x, function (res) {
        var html = '';

        res.on('data', function (chunk) {
            // console.log('')
            // console.log(html);
            html += chunk;
        });
        res.on('end', function () {

            var $ = cheerio.load(html); // 采用cheerio模块解析html

            var strValue = $('#main-chart-val').val(),
            text_title=$('.icon-right-arrow').next().text();
            console.log(text_title);
            //data 用来存放history数据
            var data = {},i = 1,arr=[];
            var strjson = JSON.parse(strValue);

            for (var k in strjson) {
                // console.log(strjson[k])
                var type = strjson[k]
                for (var m in type) {
                    
                    if (m == "index" && i == 1) {
                        data['1688采购指数'] = type[m].history;
                    } else if (m == 'index' && i == 2) {
                        data['1688供应指数'] = type[m].history;
                    } else if ((m == 'index' && i == 3)) {
                        data['淘宝采购指数'] = type[m].history;
                    }  
                }
                //i 在外层训话+1
                i++;
            }
            for(var j in data){
                arr.push(data[j])
            }
            const initTitle=['时间','1688采购指数','1688供应指数','淘宝供应指数'],items=[];
            items.push(initTitle);
            // for(var i=0;i<arr.length;i++){
                
                for(var j=0;j<arr[0].length;j++){
                    var two=[];
                    two.push(null,arr[0][j],arr[1][j],arr[2][j])
                    items.push(two)
                }
                
            // }
            savedContent($,text_title,data);
            // const data1 = [[1, 2, 3], [true, false, null, 'sheetjs'], ['foo', 'bar', new Date('2014-02-19T14:30Z'), '0.3'], ['baz', null, 'qux']];            
            saveXlsx($,text_title,[{name:'sheet',data:items}]);
        })
    }).on('error', function (error) {
        console.log(error)
    })
}
//生成文本格式
function savedContent ($,title,content) {
    // console.log(content)
    fs.appendFile('./data/'+title+'.txt',content,'utf-8',function(err){
        if(err){
            console.log(err);
        }
    })
}

//生成xlsx 格式
function saveXlsx($,title,content){
    var file = xlsx.build(content);
    fs.writeFileSync('./data/'+title+'.xlsx', file,{'flag':'w'});
}
fetchPage(url);