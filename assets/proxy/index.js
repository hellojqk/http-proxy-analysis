$(function () {

  $(".analysisResult").each(function (i, item) {
    var info = $(item).attr("data-info");
    var $item = $(item);
    if (info) {
      var infoObj = JSON.parse(info);
      if (infoObj) {
        var cls = infoObj.length > 0 ? "danger" : "";
        $(item).html('<p class="' + cls + '">' + infoObj.length + '</p>');

        var viewHtml = '<ul>';
        infoObj.forEach(item => {
          viewHtml += '<li style="border-bottom:1px solid #e3e3e3;"><span style="width:200px;display:inline-block;">' + item.Code + '</span><span>' + item.Field + '</span></li>';
        });
        viewHtml += '</ul>';
        $item.parents(".row").next().find(".analysis-result-view").html(viewHtml);
      }
    }
  });
  $("input").keydown(function (e) {
    var currKey = 0, e = e || event;
    currKey = e.keyCode || e.which || e.charCode;
    if (13 == currKey) {
      change();
    }
  });

  $("#prePage").click(function () {
    var pageIndex = parseInt($("#pageIndex").val());
    $("#pageIndex").val(pageIndex - 1);
    change();
  });
  $("#nextPage").click(function () {
    var pageIndex = parseInt($("#pageIndex").val());
    $("#pageIndex").val(pageIndex + 1);
    change();
  });
  $(".expand").click(function () {
    var $detail = $(this).parents(".row").next();
    if ($detail.css("display") == "none") {
      $detail.fadeIn();
    } else {
      $detail.fadeOut();
    }
  })

  $(".row").mouseenter(function () {
    $(this).addClass("row-hover");
  });
  $(".row").mouseleave(function () {
    $(this).removeClass("row-hover");
  })

  function change() {
    var restfulURL = $("#restfulURL").val();
    var requestMethod = $("#requestMethod").val();
    var requestMethod = $("#requestMethod").val();
    var mirrorResponseStatus = $("#mirrorResponseStatus").val();
    var pageIndex = $("#pageIndex").val();
    var pageSize = $("#pageSize").val();

    location.href = "/?restful_url=" + restfulURL + "&request_method=" + requestMethod + "&page_index=" + pageIndex + "&page_size=" + pageSize + "&mirror_response_status=" + mirrorResponseStatus;
  }
});

function retry(proxyLogID) {
  $.post("/detail/" + proxyLogID, null, function (result) {
    if (result.error) {
      alert(result.error);
      return
    }
    alert("成功");
  })
}