const puppeteer = require("puppeteer");

async function scrape(url, eventCb) {
  const browser = await puppeteer.launch({
    headless: true,
    // devtools: false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  eventCb({ name: "process_started", data: null });
  const page = await browser.newPage();

  await page.goto(url);
  eventCb({ name: "webpage_opened", data: null });

  let [questionsFound, answerObj] = await page.evaluate(async () => {
    // START
    var obj = [];

    let answerTempStr = "";
    let answerObj = [];
    let index = 0,
      start = false;

    let getTextByCopy = (node) => {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNode(node);
      selection.removeAllRanges();
      selection.addRange(range);
      return window.getSelection().toString();
    };

    const fn = (node) => {
      //  if (!hasNoChildEl(node)) {
      //    return;
      //  }

      if (node.textContent.endsWith("?")) {
        let text = getTextByCopy(node);
        obj.push(text);
      }
    };

    // check if element has no child nodes
    const hasNoChildEl = (node) => {
      //iterate over node.childnodes
      // for (let i = 0; i < node.childNodes.length; i++) {
      //   //if node is not text node
      //   if (node.childNodes[i].nodeType === Node.TEXT_NODE) {
      //     return true;
      //   }
      // }
      // return false
      return true;
    };

    await loop(document.querySelector("main") || document.querySelector("body"), fn); // populate obj with questions
    // eventCb({name: 'got_questions', data: obj});
    await loop(
      document.querySelector("main") || document.querySelector("body"), // populate answerObj with answers
      async (node) => {
        // if (!hasNoChildEl(node)) {
        //   return;
        // }
        console.log(node);
        let text = getTextByCopy(node);

        if (text === obj[index]) {
            ;
          // we found a question
          //scroll node into view
          node.parentNode.scrollIntoView();
          // click on parent node
          node.parentNode.click();

        //   sleep for 5 seconds
        async function sleep(ms) {
            return new Promise((resolve) => {
            setTimeout(resolve, ms);
            });
        }
        await sleep(1000)
        // alert();
        
          
          if (start) {
            answerObj.push(answerTempStr);
          }
          // console.log(obj[index], answerTempStr, node);
          // console.log('==============');
          // 
          answerTempStr = "";
          index++;
          start = true;
        } else {
          if (start) {
            answerTempStr += getTextByCopy(node);
          }
        }
      }
    );

    async function loop(node, cb) {
      // do some thing with the node here
      var nodes = node.childNodes;
      for (var i = 0; i < nodes.length; i++) {
        if (!nodes[i]) {
          continue;
        }

        if (nodes[i].childNodes.length > 0) {
          await loop(nodes[i], cb);
        } else {
          await cb(nodes[i]);
        }
      }
    }
    
    // END
    return Promise.resolve([obj, answerObj]);
  });

  


  eventCb({ name: "got_all", data: { questionsFound, answerObj } });
  browser.close();
  return { questionsFound, answerObj };
}


 module.exports =  { scrape };