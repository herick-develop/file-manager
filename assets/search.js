const lista = document.getElementById('lista');

function formatSize(bytes) {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + ' KB';
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }
}

async function sendData(e) {
  try {
    const response = await fetch('@search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload: e.value.trim() }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Data received:', data);
    lista.innerHTML = "";

    data.forEach((element, index) => {
      const liElement = document.createElement('li');
      liElement.classList.add('list-group-item');

      const label = document.createElement('label');
      label.setAttribute('for', `check${index}`);
      label.classList.add('stretched-invisible-label');

      const formCheck = document.createElement('div');
      formCheck.classList.add('form-check');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.classList.add('form-check-input', 'multi-select');
      checkbox.dataset.select = element.name;
      checkbox.dataset.selectSize = element.size;
      checkbox.dataset.selectType = element.isdirectory ? 'directory' : 'file';
      checkbox.id = `check${index}`;
      checkbox.addEventListener('click', () => {
        updateSelected();
      });

      const formCheckLabel = document.createElement('span');
      formCheckLabel.classList.add('form-check-label', 'd-flex', 'align-items-start', 'justify-content-between');

      if (element.isdirectory) {
        const nameLink = document.createElement('a');
        nameLink.classList.add('name');

        // Separe a parte destacada da URL da parte não destacada
        const parts = element.name.split(e.value.trim());
        nameLink.innerHTML = parts.join('<span class="blue-text">' + e.value.trim() + '</span>');

        // Defina a URL completa como o href da tag <a>.
        nameLink.href = `http://localhost:3030/${element.name}`;

        nameLink.addEventListener('click', (event) => {
          event.preventDefault();
          window.location.href = nameLink.href;
        });
        formCheckLabel.appendChild(nameLink);
      } else {
        if (element.error) {
          const nameLink = document.createElement('a');
          nameLink.classList.add('name');
          nameLink.title = element.error;

          // Separe a parte destacada da URL da parte não destacada
          const parts = element.name.split(e.value.trim());
          nameLink.innerHTML = parts.join('<span class="blue-text">' + e.value.trim() + '</span>');

          // Defina a URL completa como o href da tag <a>.
          nameLink.href = `http://localhost:3030/${element.name}`;

          nameLink.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = nameLink.href;
          });
          formCheckLabel.appendChild(nameLink);

          const errorBadge = document.createElement('span');
          errorBadge.classList.add('badge', 'rounded-pill', 'bg-danger', 'badge-alignment');
          errorBadge.innerText = 'err';
          formCheckLabel.appendChild(errorBadge);
        } else {
          const nameLink = document.createElement('a');
          nameLink.classList.add('name');

          // Separe a parte destacada da URL da parte não destacada
          const parts = element.name.split(e.value.trim());
          nameLink.innerHTML = parts.join('<span class="blue-text">' + e.value.trim() + '</span>');

          // Defina a URL completa como o href da tag <a>.
          nameLink.href = `http://localhost:3030/${element.name}`;

          nameLink.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = nameLink.href;
          });
          formCheckLabel.appendChild(nameLink);

          const sizeBadge = document.createElement('span');
          sizeBadge.classList.add('badge', 'rounded-pill', 'bg-secondary', 'badge-alignment');
          sizeBadge.innerText = formatSize(element.size);
          formCheckLabel.appendChild(sizeBadge);
        }
      }

      if (element.issmallimage) {
        const img = document.createElement('img');
        img.src = `./${element.name}`;
        img.classList.add('mt-2');
        img.style.maxHeight = '6em';
        img.style.maxWidth = '100%';
        formCheckLabel.appendChild(img);
      }

      formCheck.appendChild(checkbox);
      formCheck.appendChild(formCheckLabel);
      label.appendChild(formCheck);
      liElement.appendChild(label);
      lista.appendChild(liElement);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}
