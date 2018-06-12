// const randomPromise = () => {
//     return new Promise((resolve) => {
//         setTimeout(() => resolve(5), 200)
//     });
// };
// async function test(num) {
//     const val = await randomPromise();
//     console.log('num', num);
//     console.log('val', val);
//     return val + num;
// }

// test(7).then(val => console.log('outside', val));

setInterval(() => console.log('running now'), 10 * 1000);