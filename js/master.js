var loader = document.querySelector('.loader')

window.onscroll = function () {
  // stickyElement(loader)
}

function getWidth () {
  return Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.documentElement.clientWidth
  )
}

function triggerPos (el, buffer) {
  return el.offsetTop - el.height + buffer
}

function stickyElement (element, className = 'sticky') {
  if (window.pageYOffset > element.offsetTop) {
    element.classList.add(className)
  } else {
    element.classList.remove(className)
  }
}

// var options = {
//   root: document.querySelector('.intro'),
//   rootMargin: '0px',
//   threshold: 1.0
// }
//
// function callback (entries, observer) {
//   entries.forEach(entry => {
//     console.log(entry)
//     console.log('hollaaa')
    // Each entry describes an intersection change for one observed
    // target element:
    //   entry.boundingClientRect
    //   entry.intersectionRatio
    //   entry.intersectionRect
    //   entry.isIntersecting
    //   entry.rootBounds
    //   entry.target
    //   entry.time
//   })
// }

// var observer = new IntersectionObserver(callback, options)
// var target = document.querySelector('#ok')
// observer.observe(target)

$(window).ready(function() {
  $('.slide')
  // .scrollie({
  //   scrollOffset : -50,
  //   scrollingInView : function(elem) {
  //     var bgColor = elem.data('background')
  //
  //     $('.slide').css('background-color', bgColor)
  //     // $(elem).find('p').css('opacity', 1)
  //   }
  // })

  // $('.slide p').scrollie({
  //   scrollOffset : -150,
  //   scrollingInView: function (elem) {
  //     $(elem).css('opacity', 1)
  //   },
  //   scrollingToTheTop: function (elem) {
  //     console.log('exiting', elem)
  //     $(elem).css('opacity', 0)
  //   }
  // })
})
