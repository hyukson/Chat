(function () {
  // 특정 url 스페이스에 접속
  const socket = io.connect("/");

  const limitString = (str, limit = 300) => {
    return str.length > limit ? str.substring(0, limit) : str;
  };

  // 서버에서 소켓에 접속을 완료했을 때 신호를 보냄
  window.onload = () => {
    const name = window.prompt("이름을 입력해주세요!", "") || "익명";

    socket.emit("newUser", { name: limitString(name, 20) });

    // 유저수 갱신
    socket.on("userCount", (userCount) => {
      document.querySelector(".userCnt span").innerHTML = userCount;
    });

    // socket.on 함수로 서버에서 전달하는 신호를 수신
    socket.on("new message", ({ name, message, types }) => {
      const chat = document.querySelector(".chat");

      const nameTag = name && types !== "send" ? `<p>${name}</p>` : "";

      // 스크롤이 맨 아래에 있으면 자동 최하단 고정, 전송한 사람도 고정
      const eh = chat.clientHeight + chat.scrollTop;

      const isScroll = chat.scrollHeight <= eh || !nameTag;

      const html = `<div class="${types}">
        ${nameTag}
        <span>${message}</span>
      </div>`;

      chat.innerHTML += html;

      if (isScroll) {
        chat.scrollTop = chat.scrollHeight;
      }
    });

    // 메시지 보내기
    const $form = document.querySelector("form.bottom");

    $form.addEventListener("submit", (e) => {
      e.preventDefault();

      const $input = document.querySelector("#message");

      const message = $input.value.trim().replace(/</g, `&lt;`);

      if (!message) {
        return;
      }

      socket.emit("message", {
        message: limitString(message),
      });

      $input.value = "";
    });
  };
})();
