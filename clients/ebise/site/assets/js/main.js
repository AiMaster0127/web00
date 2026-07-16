/* 海老勢 HP — main.js
   宴会相談フォームの入力チェックと送信。
   JSが無効でも <form> の通常POST（Netlify Forms）で送信できる。 */
(() => {
  "use strict";

  const form = document.querySelector("[data-consult-form]");
  if (!form) return;

  // JSが動く環境ではブラウザ標準の検証を止め、日本語の文言で項目の隣に出す
  form.setAttribute("novalidate", "");

  const doneBox = document.getElementById("form-done");
  const failBox = document.getElementById("form-fail");

  const setError = (fieldEl, inputEl, message) => {
    const errorEl = fieldEl.querySelector(".field__error");
    if (message) {
      fieldEl.classList.add("is-error");
      if (errorEl) errorEl.textContent = message;
      inputEl.setAttribute("aria-invalid", "true");
    } else {
      fieldEl.classList.remove("is-error");
      inputEl.removeAttribute("aria-invalid");
    }
  };

  const validators = [
    {
      input: form.elements["name"],
      validate: (v) => (v.trim() ? "" : "お名前を入力してください"),
    },
    {
      input: form.elements["tel"],
      validate: (v) => {
        const digits = v.replace(/[\s-]/g, "");
        if (!digits) return "お電話番号を入力してください";
        if (!/^0\d{9,10}$/.test(digits)) return "電話番号はハイフンなしの数字で入力してください";
        return "";
      },
    },
    {
      input: form.elements["date"],
      validate: (v) => {
        const undecided = form.elements["date-undecided"];
        if (v || (undecided && undecided.checked)) return "";
        return "ご希望日を選ぶか、「まだ決まっていない」を選んでください";
      },
    },
  ];

  const validateAll = () => {
    let firstInvalid = null;
    for (const { input, validate } of validators) {
      if (!input) continue;
      const field = input.closest(".field");
      const message = validate(input.value);
      setError(field, input, message);
      if (message && !firstInvalid) firstInvalid = input;
    }
    return firstInvalid;
  };

  // 入力し直したらその場でエラーを消す
  for (const { input, validate } of validators) {
    if (!input) continue;
    input.addEventListener("input", () => {
      const field = input.closest(".field");
      if (field.classList.contains("is-error") && !validate(input.value)) {
        setError(field, input, "");
      }
    });
  }
  const undecided = form.elements["date-undecided"];
  if (undecided) {
    undecided.addEventListener("change", () => {
      const dateInput = form.elements["date"];
      const field = dateInput.closest(".field");
      if (undecided.checked) setError(field, dateInput, "");
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (failBox) failBox.classList.remove("is-visible");

    const firstInvalid = validateAll();
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "送信しています…";

    try {
      const body = new URLSearchParams(new FormData(form)).toString();
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.hidden = true;
      if (doneBox) {
        doneBox.classList.add("is-visible");
        doneBox.focus();
      }
    } catch (_err) {
      if (failBox) {
        failBox.classList.add("is-visible");
      }
      submitBtn.disabled = false;
      submitBtn.textContent = "この内容で相談する";
    }
  });
})();
