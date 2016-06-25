import assert from 'assert';
var fs = require('fs');
var cheerio = require('cheerio');

var HOMES_PER_PAGE = 26;
var total_home;
var result = {"homes" : [], "total" : 0};

function get_homes_detail(content) {
  var $ = cheerio.load(content);
  var total = 0;
  var homes = {"homes" : []};

  $('article').each(function(i, elem) {
    var latitude = $(this).attr('data-latitude');
    var longitude = $(this).attr('data-longitude');
    var id = $(this).attr('id');
    var zpid = $(this).attr('data-zpid');

    var addr = "";
    var url = "";
    var taga = $(this).find('a').each(function(index, element) {
      if (index == 0) {
        url = $(element).attr('href');
      }

      var temp = $(element).attr('data-address');
      if (typeof temp != 'undefined') {
        addr = temp;
      }
    });

    var record = {"data-latitude" : latitude, "data-longitude" : longitude,
                        "id" : id, "zpid" : zpid, "address" : addr, "url" : url
                 }
    homes['homes'].push(record);
    total += 1;
  });

  homes["total"] = total;
  console.log(JSON.stringify(homes));
  return homes;
}

function get_active_page_index(content) {
  var $ = cheerio.load(content);

  $('li.zsg-pagination_active').find('a').each(function(index, ele) {
    var index = $(ele).text();
    console.log("active page index: " + index);
    return index;
  });
};

function get_total_home(content) {

  console.log("input:" + content);
  var $ = cheerio.load(content);
  var total_desc = $('h2').text();
  console.log(total_desc);
  var re = /([\d|,]+) results/;
  var total = re.exec(total_desc)[1];
  return total;
}
describe('Zillow Data Crawling Agent', () => {
  //browser.timeouts('page load', 10*1000);
  before(function(done) {
    browser.windowHandleSize({width:1280, height:1024});
    browser.url('/', done);
    browser.waitForExist('.photo-cards');
    
  });

  
  it('has the correct page title', () => {
    var title = browser.getTitle();
    console.log(title);
    var expected = title.indexOf('Recently Sold Homes in Austin TX');
    assert(expected != -1, 'Recently Sold Homes in Austin TX');
    var html = browser.getHTML("#map-result-count-message");
    
    total_home = get_total_home(html);
    console.log("total homes: " + total_home);
    //assert.equal(title, 'Zillow: Real Estate, Apartments, Mortgages & Home Values');
    
  });

  it('collect correct home address info', () => {

    var pages = total_home / HOMES_PER_PAGE;
    var left = total_home % HOMES_PER_PAGE;
    if (left != 0) {
      pages += 1;
    }
    console.log("total pages" + pages);
    var i = 1;
    while (1) {
      if (i > pages) {
        break;
      }
      var html = browser.getHTML('.photo-cards');
      console.log("content:" + html);
      fs.writeFile("./result/output" + i + ".txt", html, function(err) {
        if (err) console.log(err);
      });

      var temp  = get_homes_detail(html);
      result["homes"].push(temp["homes"]);
      result["total"] += temp["total"];
      
      // get to the index page content
      i++;
      if (i <= pages) {
        browser.url("/" + i + "_p");
      }
    }
    var now = new Date();
    result["datetime"] = now.toUTCString(); 
    fs.writeFile("./result/result.json", JSON.stringify(result), function(err) {
      if (err) console.log(err);
    });

  });

});



