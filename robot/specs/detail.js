import assert from 'assert';
var fs = require('fs');
var cheerio = require('cheerio');
var home_list = [];
var result;

function get_home_history(content) {
  var $ = cheerio.load(content);
  
  var table = [];
  var table_head = [];
  console.log($('#hdp-price-history').text());
  $("table.zsg-table thead tr th", '#hdp-price-history').each(function(i, elem) {
    //console.log(i);
    //console.log($(elem).text()); 
    if (i < 4) {
      var headitem = $(elem).text();
      table_head.push(headitem);
    }
  });
  table.push(table_head);

  $('#hdp-price-history section table tbody tr').each(function(i, elem) {
    var table_item = []
    var taga = $(elem).find('td').each(function(index, element) {
      if (index < 4) {
        var temp = $(element).text();
        table_item.push(temp);
      }
    });
    table.push(table_item);

  });
  
  return table;
};

describe('Zillow Data Crawling Agent - get price detail', () => {

  before(function(done) {
    browser.timeouts("page load", 30*1000);
    var result = JSON.parse(fs.readFileSync('./result/result.json', 'utf8'));
    for (var i = 0; i < result["homes"].length; i++) {
      home_list = home_list.concat(result["homes"][i]);
    }
    var final_result = {"final_result" : home_list, "total" : result["total"]};

    fs.writeFile("./result/final_result.json", JSON.stringify(final_result), function(err) {
      if (err) console.log(err);
    });

  });

  
  it('get the price detail', () => {
    browser.windowHandleSize({width:1280, height:1024});
    var final_result = {"result" : []};

    for (var i = 0; i < home_list.length; i++) {
    //for (var i = 0; i < 1; i++) {
      browser.url(home_list[i]["url"]);
      //browser.waitForExist('#tax-price-history');
      browser.scroll('#hdp-price-history');
      browser.waitForExist('.ph-event', 10*1000);
      var html = browser.getHTML('#hdp-price-history');    
      var ret = home_list[i]["url"].split("/");
      var sub_file_name = ret.filter(function(e) {
        return e;
      })[1];
      fs.writeFile("./result/detail/" + sub_file_name + ".txt", html, function(err) {
        if (err) console.log(err);
      });

      var history = get_home_history(html)
      //console.log(home_list[i]);
      //console.log(history);

      home_list[i]["price-history"] = history;
      console.log(home_list[i]);
      final_result["result"].push(home_list[i]);
    }
    final_result["total"] = home_list.length;
    var now = new Date();
    final_result["datetime"] = now.toUTCString();
      
    fs.writeFile("./result/detail/result.json", JSON.stringify(final_result), function(err) {
      if (err) console.log(err);
    });
  });
});



