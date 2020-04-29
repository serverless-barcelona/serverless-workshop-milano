var clickStream = [];

const setIntervalAsync = (fn, ms) => {
  fn().then(() => {
    setTimeout(() => setIntervalAsync(fn, ms), ms);
  });
};

const waitFor = async sec => new Promise(res => setInterval(res, sec));

$(document).ready(() => {
  var customEvents = window.customEvents;

  // Set Up Events
  $('#register').click(function (ev) {
    ev.preventDefault();
    customEvents.emit('register', {
      email: $('#emailInputRegister').val(),
      password: $('#passwordInputRegister').val()
    })
  });

  $('#confirm').click(function (ev) {
    ev.preventDefault();
    customEvents.emit('confirm_user', {
      cognitoUser,
      code: $('#code').val()
    })
  });

  $('#signin').click(function (ev) {
    ev.preventDefault();
    customEvents.emit('login', {
      Username: $('#emailInputSignin').val(),
      Password: $('#passwordInputSignin').val()
    });
  });

  $('#signout').click(function (ev) {
    ev.preventDefault();
    customEvents.emit('sign_out');
  });

  $('#openapi').click(function (ev) {
    ev.preventDefault();
    req('publicapi');
  });

  $('#privateapi').click(function (ev) {
    ev.preventDefault();
    const buttonObj = {
      timestamp: Date.now(),
      type: 'private-api',
      x: ev.clientX,
      y: ev.clientY,
      toElement: ev.toElement.localName,
      year: new Date().getFullYear(),
      month: `${new Date().getMonth() + 1}`.padStart(2, '0'),
      day: `${new Date().getDate()}`.padStart(2, '0'),
      hour: `${new Date().getHours()}`.padStart(2, '0'),
    };
    req('privateapi',buttonObj);
  });

  $('#sendToFirehose').click((ev) => {
    ev.preventDefault();
  });

  document.addEventListener('click', (e) => {
    clickStream.push(e);
  });

  // Trigger Initialization Flow
  customEvents.emit('init_ready');

  setIntervalAsync(async () => {
    if (userPool.getCurrentUser() != null) {
      const currentClicks = clickStream;
      clickStream = [];

      await sendToFirehose(currentClicks.map(
        (click) => ({
          user: md5(userPool.getCurrentUser().username) + " - *" + userPool.getCurrentUser().username.split('@')[0] + "*",
          timestamp: Date.now(),
          type: click.type,
          x: click.x,
          y: click.y,
          toElement: click.srcElement.localName,
          year: new Date().getFullYear(),
          month: `${new Date().getMonth() + 1}`.padStart(2, '0'),
          day: `${new Date().getDate()}`.padStart(2, '0'),
          hour: `${new Date().getHours()}`.padStart(2, '0'),
        })
      ));
    }
  }, 3000);
});
