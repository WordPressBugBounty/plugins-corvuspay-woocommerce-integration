jQuery(function ($) {
    "use strict";

    if (typeof window.wc === 'undefined') {
        return;
    }

    function waitForElm(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });

            // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

  function getCorvusPaySettings() {
    return window.wc?.wcSettings?.getPaymentMethodData?.('corvuspay', {}) || {};
  }

  function isCorvusPaySelectedClassic() {
    return $('input[name="payment_method"]:checked').val() === 'corvuspay';
  }

  async function applySaveOptionState() {
    const settings = getCorvusPaySettings();

    if (!settings.disableAndCheckSaveOption) {
      return;
    }

    const isBlocks = !!document.querySelector('.wc-block-checkout') || !!document.querySelector('.wc-block-components-checkout');
    const isSelected = isBlocks
      ? true
      : isCorvusPaySelectedClassic();

    if (!isSelected) {
      return;
    }

    const selector = [
      '.wc-block-components-payment-methods__save-card-info input',
      '.woocommerce-SavedPaymentMethods-saveNew input',
      'input[name="wc-corvuspay-save-card"]'
    ].join(',');

    const elm = await waitForElm(selector);

    if (elm) {
      elm.checked = true;
      elm.disabled = true;
    }
  }

  // Classic checkout events
  $(document.body).on(
    'updated_checkout payment_method_selected change',
    'input[name="payment_method"]',
    applySaveOptionState
  );
  $(document.body).on('init_checkout updated_checkout', applySaveOptionState);

  // Blocks checkout event
  if (window.wp?.hooks?.addAction) {
    wp.hooks.addAction(
      'experimental__woocommerce_blocks-checkout-set-active-payment-method',
      'corvuspay',
      function (payment_method) {
        const settings = getCorvusPaySettings();

        if (payment_method?.value === 'corvuspay' && settings.disableAndCheckSaveOption) {
          applySaveOptionState();
        }
      }
    );
  }
});
