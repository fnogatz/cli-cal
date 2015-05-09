module.exports = graph

var CliBox = require('cli-box')
var AnsiParser = require('ansi-parser')

const LEVELS = [
  '⬚',
  '▢',
  '▤',
  '▣',
  '■'
]
const DAYS = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat'
]
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

function graph (days) {
  var year = []
  var months = []
  var cWeek = [' ', ' ', ' ', ' ', ' ', ' ', ' ']
  var strYear = ''
  var strMonths = ''
  var w

  days = normalize(days)

  days.forEach(function (day, i) {
    var y = day.date
    var d = new Date(y)

    if (d.getDay() === 0 && Object.keys(cWeek).length) {
      year.push(cWeek)
      cWeek = [' ', ' ', ' ', ' ', ' ', ' ', ' ']
    }

    // Store the new month this week
    if (d.getDate() === 1) {
      months[year.length] = MONTHS[d.getMonth()]
    }

    cWeek[d.getDay()] = LEVELS[day.level]
  })

  if (cWeek.length) {
    year.push(cWeek)
  }

  for (var k = 0; k < 7; k++) {
    for (w = 0; w < year.length; ++w) {
      strYear += ' ' + year[w][k]
    }
    if (k < 6) {
      strYear += '\n'
    }
  }

  // Add day names
  strYear = strYear.split('\n').map(function (c, i) {
    if (i > 6) {
      return
    }
    return DAYS[i] + c
  }).join('\n')

  // Months label
  var monthHack = 'MMMM' // Left padding

  for (var i = 0; i < months.length; i++) {
    // The length of strMonths should always be 2*(i+1) (at the i-th column)
    if (!months[i]) {
      strMonths += new Array(2 * (i + 1) - strMonths.length + 1).join(' ')
    } else {
      strMonths += months[i]
    }
  }

  strYear = monthHack + strMonths + '\n' + strYear

  strYear = new CliBox({
    w: 10,
    h: 8,
    marks: {
      nw: '╔',
      n: '═',
      ne: '╗',
      e: '║',
      se: '╝',
      s: '═',
      sw: '╚',
      w: '║',
      b: ' '
    }
  }, {
    text: strYear,
    stretch: true,
    hAlign: 'left'
  }).toString()

  strYear = strYear.replace(monthHack, new Array(monthHack.length + 1).join(' '))

  strYear = AnsiParser.removeAnsi(strYear)

  return strYear
}

function normalize (days) {
  var max
  var first
  var last
  var d
  var date
  var y

  for (d in days) {
    if (typeof max === 'undefined' || max < days[d]) {
      max = days[d]
    }

    date = new Date(d)
    if (typeof first === 'undefined' || first > date) {
      first = date
    }
    if (typeof last === 'undefined' || last < date) {
      last = date
    }
  }

  var q = (LEVELS.length - 1) / max
  for (d in days) {
    days[d] = Math.ceil(days[d] * q)
  }

  var res = []
  var dayMs = 1000 * 60 * 60 * 24
  for (d = first.getTime(); d <= last.getTime() + dayMs; d += dayMs) {
    y = yyyymmdd(new Date(d))
    if (days[y]) {
      res.push({
        date: y,
        level: days[y]
      })
    } else {
      res.push({
        date: y,
        level: 0
      })
    }
  }

  return res
}

function yyyymmdd (date) {
  return date.toJSON().slice(0, 10).replace(/-/g, '/')
}
