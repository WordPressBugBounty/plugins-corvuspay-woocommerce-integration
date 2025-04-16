(function ($) {
  'use strict';
  $(document).on('click', '.check-order-status-button', function () {
    event.preventDefault();

    var $button = $(this);
    $button.prop('disabled', true);

    const orderId = $(this).data('order-id');

    $.ajax({
      url: corvuspay_check_status_vars.ajax_url,
      type: 'POST',
      data: {
        action: 'corvuspay_check_order_status',
        order_id: orderId,
        _nonce: corvuspay_check_status_vars.nonce,
      },
      success: function (response) {
        if (response.success) {
          // If successful, display the XML in a dialog
          var xmlResponse = response.data.xml;

          var parser = new DOMParser();
          var xmlDoc = parser.parseFromString(xmlResponse, "text/xml");
          var rows = "";

          $(xmlDoc).find("trans-status").children().each(function () {
            var tagName = $(this).prop("tagName");
            var value = $(this).text();
            rows += `<tr><td><strong>${tagName.replace(/-/g, " ")}</strong></td><td>${value}</td></tr>`;
          });

          var tableHtml = `
            <table class="wp-list-table widefat fixed striped">
                <tbody>${rows}</tbody>
            </table>`;

          var dialogWidth = $(window).width() <= 600 ? '90%' : '600px';  // 90% on mobile, 600px on larger screens

          jQuery('<div>' + tableHtml + '</div>').dialog({
            title: corvuspay_check_status_vars.dialog_title,
            width: dialogWidth,
            modal: true,
            draggable: false,
            resizable: false,
            position: {my: 'center', at: 'center', of: window},
            open: function () {
              // Ensure proper scroll position when the dialog opens
              $(this).parent().css('top', $(window).scrollTop() + ($(window).height() * 0.2));
              // Close the dialog when clicking outside of it
              var dialog = $(this);
              $(document).on('click', function (event) {
                if (!dialog.is(event.target) && dialog.has(event.target).length === 0) {
                  dialog.dialog('close');
                }
              });
            }
          });
        } else {
          alert(response.data || 'Unknown error');
        }
      },
      error: function (xhr, status, error) {
        alert(error);
      },
      complete: function () {
        $button.prop('disabled', false);
      }
    });
  });

  $("body").on("click", "div.ui-widget-overlay", function () {
    $("#dialog").dialog('close');
  })
})(jQuery);
