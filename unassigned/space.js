(() => {
  const field = document.querySelector("#field"),
    sheet = document.querySelector("#sheet");
  const ball = document.querySelector("#ball"),
    hole = document.querySelector("#hole");
  const other = document.querySelector("#other"),
    visitors = document.querySelector("#visitors");
  const status = document.querySelector("#status"),
    message = document.querySelector("#message");
  const exit = document.querySelector("#exit"),
    undo = document.querySelector("#undo");
  const third = document.querySelector("#third"),
    request = document.querySelector("#request"),
    allow = document.querySelector("#allow"),
    deny = document.querySelector("#deny");
  const returned = document.querySelector("#returned"),
    hatch = document.querySelector("#hatch"),
    drawer = document.querySelector("#drawer"),
    drawerBall = document.querySelector("#drawer-ball");
  const audit = document.querySelector("#audit"),
    observed = document.querySelector("#observed"),
    certify = document.querySelector("#certify"),
    miniRoom = document.querySelector("#mini-room");
  const miniHole = document.querySelector("#mini-hole"),
    miniBall = document.querySelector("#mini-ball"),
    miniUser = document.querySelector("#mini-user"),
    miniOther = document.querySelector("#mini-other"),
    ticketTray = document.querySelector("#ticket-tray");
  document.querySelector("#date").textContent = new Date()
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const bounds = () => field.getBoundingClientRect();
  const items = [...document.querySelectorAll("[data-feed]")];
  let damage = 0,
    fed = [],
    drops = 0,
    cursorVisible = false,
    cursorX = 0,
    cursorY = 0,
    goalX = 0,
    goalY = 0;
  let ballX = 0,
    ballY = -30,
    vx = 1,
    vy = 0,
    ballAlive = true,
    dragging = null,
    pointer = { x: 0, y: 0 },
    exitTries = 0,
    exitDrag = null,
    holeSize = 30,
    hungry = false,
    controlled = false,
    thirdVisible = false,
    denyCount = 0,
    pointerTrail = [],
    ticketNumber = 1;
  let last = performance.now(),
    lastCursorGoal = 0,
    lastNudge = 0,
    lastMessage = 0;
  const say = (s) => {
    message.textContent = s;
    lastMessage = performance.now();
  };
  const setBall = () => {
    ball.style.left = ballX + "px";
    ball.style.top = ballY + "px";
  };
  const setHole = () => {
    hole.style.width = holeSize + "px";
    hole.style.height = holeSize + "px";
  };
  function fieldPoint(e) {
    const r = bounds();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function holeCenter() {
    const r = hole.getBoundingClientRect(),
      f = bounds();
    return {
      x: r.left + r.width / 2 - f.left,
      y: r.top + r.height / 2 - f.top,
    };
  }
  function swallow(el) {
    if (el.classList.contains("consumed")) return;
    el.classList.add("consumed");
    fed.push(el);
    undo.hidden = false;
    holeSize = Math.min(120, holeSize + 12);
    setHole();
    if (el === returned) {
      returned.querySelector("strong").textContent = "STILL YOURS";
      setTimeout(() => {
        returned.classList.remove("consumed");
        returned.hidden = false;
        returned.style.right = 8 + Math.random() * 55 + "%";
        returned.style.bottom = 8 + Math.random() * 38 + "%";
      }, 850);
    } else if (el !== ball && el !== other) {
      setTimeout(() => {
        returned.hidden = false;
      }, 1100);
    }
    if (el === ball) {
      ballAlive = false;
      goalX = holeCenter().x;
      goalY = holeCenter().y;
      say("");
      setTimeout(createThirdVisitor, 1300);
    }
    if (el === exit) {
      exit.style.transform = "";
      say("");
    }
    if (el === other) {
      cursorVisible = false;
      other.style.opacity = 0;
      visitors.textContent = "1 PERSON HERE";
    }
    if (fed.length >= 3) {
      hungry = true;
      sheet.dataset.hungry = "true";
      status.textContent = "CONDITION: FAILURE NOW SELF-SUSTAINING";
    }
  }
  function nearHole(x, y, pad = 0) {
    const h = holeCenter();
    return Math.hypot(x - h.x, y - h.y) < holeSize / 2 + pad;
  }
  function bounce() {
    drops++;
    damage = Math.min(8, drops);
    sheet.dataset.damage = damage;
    status.textContent =
      damage < 3
        ? "CONDITION: DISAPPOINTING WITHIN TOLERANCE"
        : damage < 6
          ? "CONDITION: WORSE UNDER OBSERVATION"
          : "CONDITION: NO LONGER PLAUSIBLY ACCIDENTAL";
    if (drops === 3) say("");
    if (drops === 4) hatch.hidden = false;
    if (drops === 3 || drops === 6) {
      issueTicket("AVOIDABLE FAILURE OBSERVED", "HAVE ALREADY BEEN BETTER");
    }
    if (drops >= 6 && !hungry) {
      hungry = true;
      sheet.dataset.hungry = "true";
    }
    vy = -Math.max(4, 6 - drops * 0.12);
    vx = (Math.random() - 0.5) * 5;
  }
  function toss() {
    if (!ballAlive) return;
    vy = -Math.max(8, Math.abs(vy) + 3);
    vx += (Math.random() - 0.5) * 2;
    ball.focus({ preventScroll: true });
  }
  function issueTicket(reason, action) {
    const ticket = document.createElement("div");
    ticket.className = "citation item";
    ticket.dataset.feed = "citation";
    ticket.style.left = 7 + Math.random() * 68 + "%";
    const settledTop = 12 + Math.random() * 58 + "%";
    const settledTurn = -8 + Math.random() * 16 + "deg";
    ticket.style.setProperty("--ticket-top", settledTop);
    ticket.style.setProperty("--ticket-turn", settledTurn);
    const heading = document.createElement("strong");
    heading.textContent =
      "CORRECTION " + String(ticketNumber++).padStart(3, "0");
    const copy = document.createElement("span");
    copy.textContent = reason + " / REQUIRED ACTION: " + action;
    ticket.append(heading, copy);
    ticketTray.append(ticket);
    ticket.addEventListener(
      "animationend",
      () => {
        ticket.style.top = settledTop;
        ticket.style.transform = `rotate(${settledTurn})`;
        ticket.style.animation = "none";
      },
      { once: true },
    );
  }
  function grantControl() {
    if (controlled) return;
    controlled = true;
    request.hidden = true;
    sheet.dataset.controlled = "true";
    status.textContent = "CONDITION: REPLACED WITHOUT IMPROVEMENT";
    issueTicket("RELIEF REQUESTED", "RETAIN ALL RESPONSIBILITY");
    goalX = ballAlive ? ballX : holeCenter().x;
    goalY = ballAlive ? ballY : holeCenter().y;
  }
  function createThirdVisitor() {
    if (thirdVisible) return;
    thirdVisible = true;
    third.style.opacity = 1;
    visitors.textContent = "3 PEOPLE HERE";
    const h = holeCenter();
    third.style.left = h.x + "px";
    third.style.top = h.y + "px";
    audit.hidden = false;
    miniRoom.hidden = false;
    setTimeout(
      () => issueTicket("ADDITIONAL WITNESS", "LEAVE DEFECT UNCHANGED"),
      500,
    );
  }
  function animate(t) {
    const dt = Math.min((t - last) / 16.67, 2);
    last = t;
    const r = bounds();
    if (hungry && !dragging) {
      hole.style.left = 72 + Math.sin(t / 2700) * 14 + "%";
      hole.style.top = 67 + Math.cos(t / 3400) * 11 + "%";
    }
    if (ballAlive && dragging?.el !== ball) {
      vy += 0.23 * dt;
      ballX += vx * dt;
      ballY += vy * dt;
      if (ballX < 0 || ballX > r.width - 23) {
        ballX = clamp(ballX, 0, r.width - 23);
        vx *= -0.84;
      }
      if (ballY > r.height - 23) {
        ballY = r.height - 23;
        bounce();
      }
      if (nearHole(ballX + 11, ballY + 11, 4)) swallow(ball);
      setBall();
    }
    if (cursorVisible) {
      if (t - lastCursorGoal > 2400) {
        lastCursorGoal = t;
        const targets = [
          ...items.filter(
            (el) => !el.classList.contains("consumed") && !el.hidden,
          ),
          ballAlive ? ball : hole,
        ].filter(Boolean);
        const target =
          controlled && ballAlive && Math.random() < 0.72
            ? ball
            : targets[Math.floor(Math.random() * targets.length)];
        const rect = target.getBoundingClientRect();
        goalX = clamp(rect.left - r.left + rect.width / 2, 10, r.width - 24);
        goalY = clamp(rect.top - r.top + rect.height / 2, 10, r.height - 32);
      }
      const chase = Math.hypot(pointer.x - cursorX, pointer.y - cursorY);
      if (chase < 70 && t - lastNudge > 400) {
        lastNudge = t;
        goalX = clamp(
          cursorX + (cursorX - pointer.x) * 2 + (Math.random() - 0.5) * 120,
          6,
          r.width - 25,
        );
        goalY = clamp(
          cursorY + (cursorY - pointer.y) * 2 + (Math.random() - 0.5) * 120,
          5,
          r.height - 30,
        );
      }
      cursorX += (goalX - cursorX) * 0.024 * dt;
      cursorY += (goalY - cursorY) * 0.024 * dt;
      other.style.left = cursorX + "px";
      other.style.top = cursorY + "px";
      if (
        ballAlive &&
        Math.hypot(cursorX - ballX, cursorY - ballY) < 22 &&
        t - lastNudge > 1200
      ) {
        vy -= controlled ? 7 : 3;
        vx += ballX - cursorX > 0 ? 1.8 : -1.8;
        lastNudge = t;
      }
      if (
        exitTries > 0 &&
        exitTries < 3 &&
        Math.hypot(cursorX - (r.width - 70), cursorY - (r.height - 28)) < 36
      ) {
        exitTries = 3;
        exit.style.transform = "";
      }
      if (nearHole(cursorX + 7, cursorY + 8, 3) && fed.length >= 2) {
        swallow(other);
      }
    }
    if (thirdVisible) {
      const delayed = pointerTrail.find((point) => point.t >= t - 950);
      if (delayed) {
        third.style.left = clamp(delayed.x + 18, 4, r.width - 25) + "px";
        third.style.top = clamp(delayed.y + 12, 4, r.height - 32) + "px";
      }
      const miniField = miniRoom.querySelector(".mini-field");
      const mw = miniField.clientWidth;
      const mh = miniField.clientHeight;
      const placeMini = (el, x, y) => {
        el.style.left = clamp((x / r.width) * mw, 1, mw - 10) + "px";
        el.style.top = clamp((y / r.height) * mh, 1, mh - 11) + "px";
      };
      const h = holeCenter();
      placeMini(miniHole, h.x, h.y);
      if (ballAlive) {
        miniBall.style.opacity = 1;
        placeMini(miniBall, ballX, ballY);
      } else {
        miniBall.style.opacity = 0;
      }
      placeMini(miniUser, pointer.x, pointer.y);
      placeMini(miniOther, cursorX, cursorY);
    }
    if (message.textContent && t - lastMessage > 3500) message.textContent = "";
    if (hungry && t - lastNudge > 12000) {
      const left = items.filter(
        (el) =>
          !el.classList.contains("consumed") &&
          !el.hidden &&
          el.dataset.feed !== "footer",
      );
      if (left.length) {
        lastNudge = t;
        swallow(left[Math.floor(Math.random() * left.length)]);
      }
    }
    requestAnimationFrame(animate);
  }
  setTimeout(() => {
    cursorVisible = true;
    cursorX = bounds().width * 0.65;
    cursorY = bounds().height * 0.25;
    goalX = cursorX;
    goalY = cursorY;
    other.style.opacity = 1;
    visitors.textContent = "2 PEOPLE HERE";
  }, 4200);
  setTimeout(() => {
    if (!controlled && cursorVisible) {
      request.hidden = false;
      const rect = allow.getBoundingClientRect();
      const r = bounds();
      goalX = rect.left - r.left + rect.width / 2;
      goalY = rect.top - r.top + rect.height / 2;
      setTimeout(() => {
        if (!request.hidden) grantControl();
      }, 7000);
    }
  }, 10500);
  setTimeout(() => {
    const r = bounds();
    ballX = r.width * 0.48;
    ballY = -23;
    ballAlive = true;
    ball.style.opacity = 1;
    setBall();
  }, 5800);
  ball.style.opacity = 0;
  ballAlive = false;
  requestAnimationFrame(animate);
  field.addEventListener("pointermove", (e) => {
    pointer = fieldPoint(e);
    pointerTrail.push({ ...pointer, t: performance.now() });
    pointerTrail = pointerTrail.filter(
      (point) => point.t > performance.now() - 1300,
    );
    if (dragging) {
      const p = fieldPoint(e);
      const el = dragging.el;
      if (el === ball) {
        ballX = clamp(p.x - 11, 0, bounds().width - 23);
        ballY = clamp(p.y - 11, 0, bounds().height - 23);
        setBall();
      } else {
        el.style.transform = `translate(${e.clientX - dragging.x}px,${e.clientY - dragging.y}px) ${el.dataset.feed === "stamp" ? "rotate(-7deg)" : ""}`;
      }
    }
  });
  field.addEventListener("pointerdown", (e) => {
    const el = e.target.closest(".ball,.item,.hole,.drawer-ball");
    if (!el || el === hole || el.classList.contains("consumed")) return;
    if (el === ball && !ballAlive) return;
    dragging = { el, x: e.clientX, y: e.clientY };
    el.classList.add("dragging");
    el.setPointerCapture(e.pointerId);
    if (el === ball) {
      vx = 0;
      vy = 0;
      e.preventDefault();
    }
  });
  field.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    const { el, x, y } = dragging;
    el.classList.remove("dragging");
    const p = fieldPoint(e);
    const rect = el.getBoundingClientRect();
    const f = bounds();
    const center = {
      x: rect.left + rect.width / 2 - f.left,
      y: rect.top + rect.height / 2 - f.top,
    };
    dragging = null;
    if (
      nearHole(p.x, p.y, Math.max(30, el.offsetWidth * 0.15)) ||
      nearHole(center.x, center.y, Math.min(45, el.offsetWidth * 0.25))
    )
      swallow(el);
    else if (el === ball) {
      vx = clamp((e.clientX - x) * 0.09, -8, 8);
      vy = clamp((e.clientY - y) * 0.07 - 7, -15, 6);
    } else {
      el.style.transform = "";
    }
  });
  allow.addEventListener("click", grantControl);
  deny.addEventListener("click", () => {
    denyCount++;
    if (denyCount === 1) {
      deny.textContent = "DENY PRIVATELY";
      request.querySelector("strong").textContent =
        "VISITOR 2 has reviewed your objection and found the same problem.";
      const rect = allow.getBoundingClientRect();
      goalX = rect.left - bounds().left;
      goalY = rect.top - bounds().top;
    } else {
      grantControl();
    }
  });
  certify.addEventListener("click", () => {
    certify.disabled = true;
    certify.textContent = "FAULT CERTIFIED";
    issueTicket(
      "SELF-ASSESSMENT EXCEEDS AVAILABLE EVIDENCE",
      "REVISE DOWNWARD",
    );
    setTimeout(() => {
      observed.textContent = "WORSE THAN DECLARED";
      visitors.textContent = "4 PEOPLE HERE";
      certify.textContent = "CONFIRMED BY SOMEONE BETTER";
    }, 900);
  });
  hatch.addEventListener("click", () => {
    const open = drawer.classList.toggle("open");
    drawer.setAttribute("aria-hidden", String(!open));
    hatch.querySelector("span").textContent = open
      ? "STOP LOOKING FOR THE CAUSE"
      : "CAUSE OF FAILURE";
  });
  drawerBall.addEventListener("click", () => {
    if (drawerBall.style.opacity === "0") return;
    drawerBall.style.opacity = 0;
    drawer.querySelector("p").innerHTML = "0 EXCUSES<br>1 EXPECTED";
    if (!ballAlive) {
      ball.classList.remove("consumed");
      ballAlive = true;
      ballX = bounds().width * 0.42;
      ballY = drawer.getBoundingClientRect().top - bounds().top;
      vx = 2;
      vy = -6;
      setBall();
    } else {
      drops += 2;
      createThirdVisitor();
    }
  });
  ball.addEventListener("click", toss);
  ball.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toss();
    }
  });
  hole.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (ballAlive) swallow(ball);
    }
  });
  undo.addEventListener("click", () => {
    fed.forEach((el) => {
      el.classList.remove("consumed");
      el.style.transform = "";
    });
    fed = [];
    undo.hidden = true;
    holeSize = 30;
    setHole();
    hungry = false;
    sheet.dataset.hungry = "false";
    if (!ballAlive) {
      ballAlive = true;
      ballX = bounds().width * 0.48;
      ballY = -23;
      vx = 1;
      vy = 0;
      setBall();
    }
    if (!cursorVisible) {
      cursorVisible = true;
      other.style.opacity = 1;
      visitors.textContent = "2 PEOPLE HERE";
    }
    status.textContent = "CONDITION: RESTORED TO PREVIOUS FAILURE";
  });
  function evade() {
    if (exitTries >= 3 || exit.classList.contains("consumed")) return;
    exitTries++;
    const directions = [
      "translate(-55px,-36px)",
      "translate(-100px,0)",
      "translate(-24px,-58px)",
    ];
    exit.style.transform = directions[exitTries - 1];
    if (exitTries === 3)
      setTimeout(() => {
        exit.style.transform = "";
      }, 900);
  }
  exit.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") evade();
  });
  exit.addEventListener("pointerdown", (e) => {
    if (exitTries < 3) {
      e.preventDefault();
      evade();
      return;
    }
    exitDrag = { x: e.clientX, y: e.clientY, moved: false };
    exit.setPointerCapture(e.pointerId);
  });
  exit.addEventListener("click", (e) => {
    if (exitTries < 3 || exitDrag?.moved || exit.classList.contains("consumed"))
      e.preventDefault();
    exitDrag = null;
  });
  exit.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") exitTries = 3;
  });
  // After it stops running, the exit can be offered to the hole.
  exit.addEventListener("pointermove", (e) => {
    if (!exitDrag) return;
    const dx = e.clientX - exitDrag.x,
      dy = e.clientY - exitDrag.y;
    if (Math.hypot(dx, dy) > 8) exitDrag.moved = true;
    if (exitDrag.moved) {
      e.preventDefault();
      exit.style.transform = `translate(${dx}px,${dy}px)`;
      const p = fieldPoint(e);
      if (nearHole(p.x, p.y, 25)) swallow(exit);
    }
  });
  exit.addEventListener("pointerup", () => {
    if (exitDrag?.moved && !exit.classList.contains("consumed"))
      exit.style.transform = "";
    setTimeout(() => (exitDrag = null), 0);
  });
})();
