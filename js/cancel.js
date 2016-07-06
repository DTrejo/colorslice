module.exports = cancel

// pass in a browser event, prevents default and returns false.
// usage:
//      return cancel(event)
function cancel(event) {
  if (event.preventDefault) event.preventDefault()
  return false
}
