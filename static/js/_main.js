(function (){

  NxSheet = function (options){
    this._noteView = null
    this._dataReady = false
    this._afterLoadDataFuncs = []
    this.gridViews = []
  }

  NxSheet.prototype.noteView = function (view) {
    if (typeof view != 'undefined') {
      this._noteView = view
    } else {
      return this._noteView
    }
  }

  NxSheet.prototype.createGridView = function (options) {
    var view = new NxSheet.GridView(options)

    this.gridViews.push(view)

    return view
  }

  // Add callbacks to queue for functions that need to wait for
  // sheet data to be loaded
  NxSheet.prototype.afterLoadData = function (callback) {
    if (typeof callback == 'function') {
      this._afterLoadDataFuncs.push(callback)
    }
  }

  // Call functions in the wait queue after sheet data is loaded
  NxSheet.prototype._runAfterLoadDataFuncs = function () {
    this._dataReady = true
    this._afterLoadDataFuncs.forEach(function (cb){
      if (cb) cb()
    })
  }

  NxSheet.prototype.rerun = function (){
    _.each(nxsheet.notebook.notes, function (note, i){
      note.runNote()
    })
  }

  NxSheet.typeToText = function (type){
    var text
    if (type == 'js') {
      text = 'javascript'
    } else if (type == 'css') {
      text = 'stylesheet'
    } else if (type == 'html') {
      text = 'html'
    } else if (type == 'md') {
      text = 'markdown'
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  NxSheet.textToType = function (text){
    var type
    text = text.toLowerCase()
    if (text == 'javascript') {
      type = 'js'
    } else if (text == 'stylesheet') {
      type = 'css'
    } else if (text == 'html') {
      type = 'html'
    } else if (text == 'markdown') {
      type = 'md'
    }
    return type
  }

  window.NxSheet = NxSheet
  window.nxsheet = new NxSheet()

  // backward compatible
  window.Dtab = window.NxSheet
  window.dtab = window.nxsheet

})()
