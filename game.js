document.addEventListener('DOMContentLoaded', function() {
    // Game state variables
    let selectedBid = null;
    let currentTID = '';
    let isPID = false;
    let purse = 0;
    let startingPurse = 0;
    let gameActive = false;

    // DOM elements
    const bidSelection = document.getElementById('bidSelection');
    const tidEntry = document.getElementById('tidEntry');
    const gameScreen = document.getElementById('gameScreen');
    const resultModal = document.getElementById('resultModal');
    const tidCheckModal = document.getElementById('tidCheckModal');
    const tidStatusMessage = document.getElementById('tidStatusMessage');
    const purseAmount = document.getElementById('purseAmount');
    const coin = document.getElementById('coin');
    const gameMessage = document.getElementById('gameMessage');
    const tidInput = document.getElementById('tidInput');

    // Initialize the game
    initGame();

    // Event listeners
    document.querySelectorAll('.bidBtn').forEach(button => {
        button.addEventListener('click', function() {
            selectedBid = parseInt(this.getAttribute('data-bid'));
            showScreen(tidEntry);
        });
    });

    document.getElementById('backToBid').addEventListener('click', function() {
        showScreen(bidSelection);
    });

    document.getElementById('startGameBtn').addEventListener('click', startGame);
    document.getElementById('flipBtn').addEventListener('click', flipCoin);
    document.getElementById('finishGameBtn').addEventListener('click', finishGame);
    document.getElementById('closeResult').addEventListener('click', resetGame);
    document.getElementById('closeTidCheck').addEventListener('click', function() {
        tidCheckModal.classList.add('hidden');
    });
    document.getElementById('checkTidBtn').addEventListener('click', checkTIDStatus);

    // Initialize game function
    function initGame() {
        // Reset all screens
        bidSelection.classList.remove('hidden');
        tidEntry.classList.add('hidden');
        gameScreen.classList.add('hidden');
        resultModal.classList.add('hidden');
        tidCheckModal.classList.add('hidden');
        
        // Reset game state
        selectedBid = null;
        currentTID = '';
        purse = 0;
        startingPurse = 0;
        gameActive = false;
        tidInput.value = '';
        gameMessage.textContent = '';
    }

    // Show specific screen
    function showScreen(screen) {
        bidSelection.classList.add('hidden');
        tidEntry.classList.add('hidden');
        gameScreen.classList.add('hidden');
        
        screen.classList.remove('hidden');
    }

    // Start game function
function startGame() {
    currentTID = tidInput.value.trim();
    
    if (!currentTID) {
        showMessage('Please enter a TID');
        return;
    }

    // Check for admin PIDs first
    const adminPIDs = {
        "ADMIN50": 50,
        "ADMIN100": 100,
        "ADMIN150": 150,
        "ADMIN200": 200
    };

    if (adminPIDs[currentTID]) {
        if (adminPIDs[currentTID] === selectedBid) {
            isPID = true;
            initializeGame();
            return;
        } else {
            showMessageAndReset(`This ADMIN PID is only valid for ${adminPIDs[currentTID]} point bids`);
            return;
        }
    }

    // Validate regular TID
    const tids = JSON.parse(localStorage.getItem('tids') || '{}');
    
    if (!tids[currentTID]) {
        showMessageAndReset('Invalid TID - Not found in our system');
        return;
    }
    
    if (tids[currentTID].bid !== selectedBid) {
        showMessageAndReset(`ERROR: This TID is for ${tids[currentTID].bid} point bids only!\nYou selected ${selectedBid} points.`);
        return;
    }
    
    if (tids[currentTID].status === 'completed') {
        showPastResult(currentTID);
        showMessageAndReset('This TID has already been used');
        return;
    }
    
    isPID = false;
    initializeGame();
}

// New helper function for showing messages and resetting
function showMessageAndReset(message) {
    // Create a temporary error modal
    const errorModal = document.createElement('div');
    errorModal.className = 'error-modal';
    errorModal.innerHTML = `
        <div class="error-content">
            <h3>Invalid TID</h3>
            <p>${message}</p>
            <button id="confirmError">OK</button>
        </div>
    `;
    document.body.appendChild(errorModal);
    
    document.getElementById('confirmError').addEventListener('click', function() {
        // Clear TID and return to bid selection
        tidInput.value = '';
        showScreen(bidSelection);
        document.body.removeChild(errorModal);
    });
}

    // Initialize game state
    function initializeGame() {
        purse = selectedBid;
        startingPurse = selectedBid;
        updatePurseDisplay();
        showScreen(gameScreen);
        gameActive = true;
        
        if (!isPID) {
            updateTIDStatus(currentTID, 'active');
        }
    }

    // Flip coin function
    function flipCoin() {
        if (!gameActive || purse < 5) {
            showMessage('Not enough points to play');
            return;
        }

        const flipBtn = document.getElementById('flipBtn');
        flipBtn.disabled = true;
        
        coin.classList.add('flipping');
        gameMessage.textContent = 'Flipping...';

        setTimeout(() => {
            const win = calculateWin();
            const result = win ? 'won' : 'lost';
            
            if (win) {
                purse += 5;
                showMessage('🎉 You won +5 points!');
            } else {
                purse -= 5;
                showMessage('😢 You lost -5 points!');
            }
            
            updatePurseDisplay();
            
            if (purse < 5) {
                finishGame();
            }
            
            coin.classList.remove('flipping');
            flipBtn.disabled = false;
            
            logFlipResult(result);
        }, 1000);
    }

    // Finish game function
    function finishGame() {
        if (!gameActive) return;
        
        gameActive = false;
        const gainLoss = purse - startingPurse;
        
        resultStart.textContent = `Starting Purse: ${startingPurse} points`;
        resultFinal.textContent = `Final Purse: ${purse} points`;
        resultGain.textContent = `Total ${gainLoss >= 0 ? 'Gain' : 'Loss'}: ${Math.abs(gainLoss)} points`;
        
        if (!isPID) {
            updateTIDStatus(currentTID, 'completed', purse);
        }
        
        resultModal.classList.remove('hidden');
    }

    // Reset game function
    function resetGame() {
        resultModal.classList.add('hidden');
        initGame();
    }

    // Check TID status function
    function checkTIDStatus() {
        const tid = prompt("Enter TID to check:");
        if (!tid) return;
        
        const tids = JSON.parse(localStorage.getItem('tids') || '{}');
        
        if (!tids[tid]) {
            tidStatusMessage.textContent = "Invalid TID - Not found";
        } else if (tids[tid].status === 'completed') {
            tidStatusMessage.textContent = `TID: ${tid}\nStatus: Completed\nBid: ${tids[tid].bid} points\nFinal: ${tids[tid].final} points`;
        } else {
            tidStatusMessage.textContent = `TID: ${tid}\nStatus: Active\nCurrent Bid: ${tids[tid].bid} points`;
        }
        
        tidCheckModal.classList.remove('hidden');
    }

    // Show past result function
    function showPastResult(tid) {
        const tids = JSON.parse(localStorage.getItem('tids') || '{}');
        const game = tids[tid];
        
        resultStart.textContent = `Starting Purse: ${game.bid} points`;
        resultFinal.textContent = `Final Purse: ${game.final} points`;
        resultGain.textContent = `Total ${game.final >= game.bid ? 'Gain' : 'Loss'}: ${Math.abs(game.final - game.bid)} points`;
        resultModal.classList.remove('hidden');
    }

    // Update TID status function
    function updateTIDStatus(tid, status, finalAmount = null) {
        const tids = JSON.parse(localStorage.getItem('tids') || '{}');
        
        tids[tid] = tids[tid] || {};
        tids[tid].status = status;
        tids[tid].bid = tids[tid].bid || selectedBid;
        
        if (finalAmount !== null) {
            tids[tid].final = finalAmount;
        }
        
        localStorage.setItem('tids', JSON.stringify(tids));
    }

    // Calculate win probability
    function calculateWin() {
        let baseWinChance = 0.5;
        const profit = purse - startingPurse;
        
        if (profit >= 20) baseWinChance = 0.45;
        if (profit >= 40) baseWinChance = 0.4;
        
        return Math.random() < baseWinChance;
    }

    // Update purse display
    function updatePurseDisplay() {
        purseAmount.textContent = purse;
    }

    // Show message
    function showMessage(msg) {
        gameMessage.textContent = msg;
        setTimeout(() => {
            if (gameMessage.textContent === msg) {
                gameMessage.textContent = '';
            }
        }, 3000);
    }

    // Log flip result
    function logFlipResult(result) {
        console.log(`Flip result: ${result} | Current purse: ${purse}`);
    }
});