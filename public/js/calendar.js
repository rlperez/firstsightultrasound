Date.prototype.addDays = function (days) {
  var dat = new Date(this.valueOf())
  dat.setDate(dat.getDate() + days);
  return dat;
}

function getDates(startDate, stopDate) {
  var dateArray = new Array();
  var currentDate = startDate;
  while (currentDate <= stopDate) {
    dateArray.push(currentDate.getTime())
    currentDate = currentDate.addDays(1);
  }
  return dateArray;
}

var selectedDate = new Date();
selectedDate.setHours(0);
selectedDate.setMinutes(0);
selectedDate.setSeconds(0);
selectedDate.setMilliseconds(0);
var weeks30To35 = getDates(selectedDate.addDays(-35), selectedDate);
var weeks25To30 = getDates(selectedDate.addDays(-70), selectedDate.addDays(-35));
var weeks20To25 = getDates(selectedDate.addDays(-105), selectedDate.addDays(-70));
var weeks15To20 = getDates(selectedDate.addDays(-140), selectedDate.addDays(-105));
var weeks10To15 = getDates(selectedDate.addDays(-175), selectedDate.addDays(-140));


$(document).ready(function () {
  $("[id^='ultrasound_calendar']").each(function () {
    var $this = $(this);
    var dt = {
      changeYear: false,
      changeMonth: false,
      numberOfMonths: [3, 3, 3],
      dateFormat: "mm/dd/yy",
      altFormat: "yy-mm-dd",
      altField: $this.attr('id') + "_alt",
      onSelect: function (i, o) {
        selectedDate = new Date(i);
        selectedDate.setHours(0);
        selectedDate.setMinutes(0);
        selectedDate.setSeconds(0);
        selectedDate.setMilliseconds(0);
        weeks30To35 = getDates(selectedDate.addDays(-35), selectedDate);
        weeks25To30 = getDates(selectedDate.addDays(-70), selectedDate.addDays(-35));
        weeks20To25 = getDates(selectedDate.addDays(-105), selectedDate.addDays(-70));
        weeks15To20 = getDates(selectedDate.addDays(-140), selectedDate.addDays(-105));
        weeks10To15 = getDates(selectedDate.addDays(-175), selectedDate.addDays(-140));
      },
      beforeShowDay: function (date) {
        if (selectedDate) {
          if (jQuery.inArray(date.getTime(), weeks30To35) != -1) {
            return [true, "highlighted-30-to-35", ""];
          } else if (jQuery.inArray(date.getTime(), weeks25To30) != -1) {
            return [true, "highlighted-25-to-30", ""];
          } else if (jQuery.inArray(date.getTime(), weeks20To25) != -1) {
            return [true, "highlighted-20-to-25", ""];
          } else if (jQuery.inArray(date.getTime(), weeks15To20) != -1) {
            return [true, "highlighted-15-to-20", ""];
          } else if (jQuery.inArray(date.getTime(), weeks10To15) != -1) {
            return [true, "highlighted-10-to-15", ""];
          }
        }
        return [true];
      }
    };
    $this.datepicker(dt);
  });
});
