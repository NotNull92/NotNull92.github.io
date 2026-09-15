const room = location.pathname.endsWith('works.html') ? 'library' : 'hall';
location.replace(`./#${room}`);
