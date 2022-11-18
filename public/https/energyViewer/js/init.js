var ACCESS_TOKEN = null;


function init() {
  if (typeof window !== "undefined") {
    let token = localStorage.getItem('accessToken');
    if (token !== null) {
      ACCESS_TOKEN = token;
      validateTokenInput();
    }
  }


  initDOM();
}


function clearToken() {
  localStorage.removeItem('accessToken');
  window.location.href = window.location.href.split("?")[0];
}
