/* global One */
function one () {
  let partOne = document.querySelector('.part-one')
  let scrollHelper = document.querySelector('.scrollHelper img')

  let one = new One({
    root: partOne,
    scrollHelper: scrollHelper,
    scrollGrain: false
  })

  console.log(one)
}

document.onload = (function () {
  one()
})()
