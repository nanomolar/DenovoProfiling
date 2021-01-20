// Create an element on grid for charting purposes

(function (){

  GRID_DEFAULTS = {
    id: null,
    className: null,
    pos: {x: 0, y: 0},
    css: { },
    draggable: true,
    resizable: true,
    clear: true,         // Allow clearing element when setView is called
    el: null,
    $el: null
  }

  GridView = function (options){
    _.extend(this, GRID_DEFAULTS)
    _.extend(this, options || {})

    var id = this.id

    if (id && $('#' + id).length > 0) {
      this.$el = $('#' + id)
      if (this.clear) this.$el.empty()
    } else {
      this.$el = $("<div id='" + (id || "") + "'></div>")
      $('#grid-window').append(this.$el)
    }

    this.$el.attr('class', 'gridview ' + (this.className || ""))

    this.css.left = this.pos.x + 52
    this.css.top = this.pos.y + 28

    this.$el.css(this.css)

    // target elements with the "draggable" class
    if (this.draggable) {
      interact(this.$el[0])
        .draggable({
          // enable inertial throwing
          inertia: true,
          // keep the element within the area of it's parent
          restrict: {
            restriction: "#grid-window",
            endOnly: true,
            elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
          },
          // enable autoScroll
          autoScroll: true,

          // call this function on every dragmove event
          onmove: dragMoveListener,
          // call this function on every dragend event
          onend: function (event) {
            var textEl = event.target.querySelector('p');

            textEl && (textEl.textContent =
              'moved a distance of '
              + (Math.sqrt(event.dx * event.dx +
                           event.dy * event.dy)|0) + 'px');
          }
        });
    }

    // this is used later in the resizing and gesture demos
    window.dragMoveListener = dragMoveListener;

    return this.$el[0]
  }

  GridView.prototype.destroy = function (){
    this.$el.remove()
  }

  function dragMoveListener (event) {
    var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform =
    target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }

  NxSheet.GridView = GridView

})()
