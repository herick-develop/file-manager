/* jshint esversion: 6 */
// let $inputs = $(".input-group-digits");
// $inputs.each((i, input) => {
//   let cleanup = () => {
//     $(input)
//       .find("input")
//       .each((i, ele) => {
//         let cleaned = $(ele)
//           .val()
//           .replace(/[^0-9]/, "");
//         $(ele).val(cleaned);
//       });
//   };

  // let update = (e) => {
  //   $digits = $(input).find("input");

    // Cleanup
    //cleanup();

    // Shift characters
    // let excess = "";
    // $digits.each((i, ele) => {
    //   let now = excess + $(ele).val();
    //   $(ele).val(now.charAt(0));
    //   excess = now.substr(1);
    // });

    // Move cursor to empty
    // $digits.each((i, ele) => {
    //   if (!$(ele).val()) {
    //     $(ele).focus();
    //     if (e.which == 8) {
    //       $(ele).prev().focus().val("");
    //     }
    //     return false;
    //   }
    // });

    // Submit if last digit is filled
    // if ($($digits[$digits.length - 1]).val()) {
    //   let token = $.map($digits, (d) => $(d).val()).join("");
    //   let $value = $(input).parent().find("#login-token-value");
    //   $value.val(token);
    //   $value.closest("form").submit();
    // }
  // };
//  let teste = (e) => {
//   console.log('a');
//  }
  //$digits = $(input).find("input");
  //$digits.on("keyup", update);
  //$digits.on("change", update);
  //$digits.on("input", update);
//   $digits = $(input).find(".token");
//   console.log($digits);
//   $digits.on("input", teste);
//   $digits.on("change", teste);
// });

// async function send(e) {
//   window.alert("a");
//   try {
//     const response = await fetch('@login', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log('Data received:', data);

//   } catch (error) {
//     console.error('Error:', error);
//   }
// }
