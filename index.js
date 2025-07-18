console.log("start");

setTimeout(() => {
  console.log("setTimeout 1");
}, 0);

Promise.resolve()
  .then(
    console.log("promise 1"))
  .then(
    console.log("promise 2"))

setTimeout(() => {
  console.log("setTimeout 2");

  Promise.resolve().then(() => {
    console.log("promise inside setTimeout");
  });
}, 0);

(async function () {
  console.log("async function start");

  await Promise.resolve();

  console.log("async after await");
})();

console.log("end");
