const assert = require("assert");

// write simple tests here, for more depth grab Jest
async function test() {
  await describe("one plus two is three", async () => {
    assert(2 + 1 === 3);
  });

  await describe("this is global", async () => {
    assert(this === global);
  });
}

let count = 0;

async function describe(description, testPromise) {
  process.stdout.write(" > " + (++count) + ". " + description + "...");
  try {
    await testPromise();
    process.stdout.write("PASSED\n");
  } catch(e) {
    process.stdout.write("FAILED\n");
    throw e;
  };
}

if (module === require.main) {
  (async () => {
    try { await test(); } catch (e) {
      console.error("FAIL: " + (e && e.stack || e || "unknown error"));
      process.exit(1);
    }
    console.log("PASS: " + count + " tests passed");
    process.exit(0);
  })();
}