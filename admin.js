document.getElementById('generateTidBtn').addEventListener('click', () => {
    let bid = document.getElementById('bidSelect').value;
    let tid = 'TID' + Date.now();
    let tids = JSON.parse(localStorage.getItem('tids') || '{}');

    tids[tid] = {
        bid: parseInt(bid),
        status: 'active',
        start: parseInt(bid),
        final: null
    };

    localStorage.setItem('tids', JSON.stringify(tids));

    document.getElementById('newTidMsg').textContent = 'New TID: ' + tid;
});

document.getElementById('viewTidConfirm').addEventListener('click', () => {
    let tid = document.getElementById('viewTidInput').value.trim();
    let bid = parseInt(document.getElementById('viewBidSelect').value);
    let tids = JSON.parse(localStorage.getItem('tids') || '{}');

    if (tids[tid] && tids[tid].bid === bid) {
        if (tids[tid].status === 'locked') {
            document.getElementById('viewTidMsg').innerHTML =
                `Starting Purse: ${tids[tid].start}<br>Final Purse: ${tids[tid].final}<br>Gain/Loss: ${tids[tid].final - tids[tid].start}`;
        } else {
            document.getElementById('viewTidMsg').textContent = 'Status: Active';
        }
    } else {
        document.getElementById('viewTidMsg').textContent = 'Invalid TID or bid mismatch';
    }
});