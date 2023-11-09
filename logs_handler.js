
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function logs_handler(dirname, async_line_handler) {

    await sleep(2000);

}

module.exports = {
  logs_handler: logs_handler,
};

