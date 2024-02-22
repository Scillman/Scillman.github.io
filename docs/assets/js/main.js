function openNav() {
    document.getElementById('sidenav').style.width = '350px';
}

function closeNav() {
    document.getElementById('sidenav').style.width = '0';
}

function onDocumentLoad() {
    const elems = document.getElementsByClassName('highlight');
    const filtered = Array.prototype.filter.call(
        elems,
        (elem) => elem.nodeName === 'PRE'
    );
    for (var index in filtered) {
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.textContent = 'COPY';
        button.addEventListener('click', onCopyClick);

        var elem = filtered[index];
        elem.append(button);
    }
}

function onCopyClick(event) {
    const elems = event.srcElement.parentNode.getElementsByClassName('rouge-code');
    const str = elems[0].children[0].innerHTML;
    const strippedString = str.replace(/(<([^>]+)>)/gi, '');
    navigator.clipboard.writeText(strippedString);

    event.srcElement.textContent = 'COPIED';
    window.setInterval(() => {
        event.srcElement.textContent = 'COPY';
    }, 1500);
}
