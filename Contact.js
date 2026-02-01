function addLiftEffect(buttonId) {
  const btn = document.getElementById(buttonId);

  btn.addEventListener("mousedown", () => {
    btn.classList.add("active");
  });

  btn.addEventListener("mouseup", () => {
    setTimeout(() => btn.classList.remove("active"), 150);
  });

  btn.addEventListener("mouseleave", () => {
    btn.classList.remove("active");
  });
}

addLiftEffect("btn-alex");
addLiftEffect("btn-amy");
