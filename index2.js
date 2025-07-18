async function a(b) {
  async function c(d) {
    return b + d;
  }
  return c;
}

const fun1 = await a(10);
console.log(await fun1(20));
