// État de l'application
let currentExercise = 1;
let totalScore = 0;
let payslipScore = 0;
let quizScore = 0;
let studentEmail = '';
let exerciseResults = {
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false
};

// Machine à états pour chaque exercice
let exerciseStates = {
    1: 'pending',
    2: 'pending',
    3: 'pending',
    4: 'pending',
    5: 'pending',
    6: 'pending',
    7: 'pending',
    8: 'pending',
    9: 'pending',
    10: 'pending'
};

// État de sélection pour le mode fallback tactile
let selectedItem = null;

// Réponses correctes du quiz
const quizAnswers = {
    q1: 'b',  // Le montant avant toute déduction
    q2: 'b',  // Le salaire brut plus les cotisations patronales
    q3: 'b',  // Une avance sur l'impôt qui sera versée à l'État
    q4: 'c',  // Le montant effectivement versé après toutes les déductions
    q5: 'b'   // L'ONSS de l'ouvrier est calculée avec un coefficient de 108%
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initializeLoginForm();
    initializeDragAndDrop();
    initializeQuizForm();
});

// Login Form
function initializeLoginForm() {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('email');
        const email = emailInput.value.trim();
        
        // Validation du format email
        const emailPattern = /^[a-zA-Z]+\.[a-zA-Z]+@istlm\.org$/;
        if (!emailPattern.test(email)) {
            showMessage('Veuillez entrer une adresse email valide au format prenom.nom@istlm.org', 'error');
            return;
        }
        
        studentEmail = email;
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('payslips-section').classList.remove('hidden');
        showExercise(1);
        updateProgress();
    });
}

// Drag and Drop
function initializeDragAndDrop() {
    const draggableItems = document.querySelectorAll('.draggable-item');
    const dropZones = document.querySelectorAll('.drop-zone');

    draggableItems.forEach(item => {
        // Support pour souris
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);

        // Support tactile
        item.addEventListener('touchstart', handleTouchStart, { passive: false });
        item.addEventListener('touchmove', handleTouchMove, { passive: false });
        item.addEventListener('touchend', handleTouchEnd, { passive: false });
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('drop', handleDrop);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('click', handleZoneClick);
    });
}

let draggedElement = null;

function handleDragStart(e) {
    if (this.classList.contains('used')) {
        e.preventDefault();
        return;
    }
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('drag-over');
    return false;
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    e.preventDefault();
    
    this.classList.remove('drag-over');
    
    if (draggedElement && !this.classList.contains('filled')) {
        const value = draggedElement.getAttribute('data-value');
        const displayText = draggedElement.textContent;
        
        this.textContent = displayText;
        this.setAttribute('data-filled-value', value);
        this.classList.add('filled');
        
        draggedElement.classList.add('used');
        draggedElement.draggable = false;
    }
    
    return false;
}

function handleZoneClick(e) {
    if (this.classList.contains('filled')) {
        const value = this.getAttribute('data-filled-value');
        this.textContent = '';
        this.removeAttribute('data-filled-value');
        this.classList.remove('filled', 'correct', 'incorrect');
        
        // Réactiver l'élément draggable correspondant
        const draggableItems = document.querySelectorAll('.draggable-item');
        draggableItems.forEach(item => {
            if (item.getAttribute('data-value') === value && item.classList.contains('used')) {
                item.classList.remove('used');
                item.draggable = true;
            }
        });
    }
}

// Validation des exercices
function validateExercise(exerciseNumber) {
    const exercise = document.getElementById(`exercise-${exerciseNumber}`);
    const dropZones = exercise.querySelectorAll('.drop-zone');
    const exerciseType = exercise.getAttribute('data-type'); // 'amounts' ou 'labels'
    let allCorrect = true;
    let allFilled = true;

    dropZones.forEach(zone => {
        const filledValue = zone.getAttribute('data-filled-value');
        const correctAnswer = zone.getAttribute('data-answer');

        if (!filledValue) {
            allFilled = false;
            return;
        }

        // Pour les exercices de type "amounts", on compare des nombres
        // Pour les exercices de type "labels", on compare des chaînes
        let isCorrect = false;
        if (exerciseType === 'amounts') {
            const filled = parseFloat(filledValue);
            const correct = parseFloat(correctAnswer);
            isCorrect = Math.abs(filled - correct) < 0.01;
        } else {
            // Pour les labels, comparaison exacte (insensible à la casse et aux espaces)
            isCorrect = filledValue.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
        }

        if (isCorrect) {
            zone.classList.add('correct');
            zone.classList.remove('incorrect');
        } else {
            zone.classList.add('incorrect');
            zone.classList.remove('correct');
            allCorrect = false;
        }
    });

    if (!allFilled) {
        showMessage('Veuillez remplir toutes les cases avant de valider !', 'error');
        return;
    }

    if (allCorrect) {
        // Passer à l'état 'valid' et verrouiller l'exercice
        exerciseStates[exerciseNumber] = 'valid';

        if (!exerciseResults[exerciseNumber]) {
            exerciseResults[exerciseNumber] = true;
            payslipScore += 5;
            totalScore += 5;
            updateScore();
        }

        // Verrouiller l'exercice : désactiver le drag-and-drop
        lockExercise(exerciseNumber);

        showMessage('✅ Excellent ! Toutes vos réponses sont correctes ! (+5 points) Vous pouvez passer à la fiche suivante.', 'success');

        // Mettre à jour les boutons de navigation
        updateNavigationButtons();
    } else {
        // Rester en état 'pending' : l'élève peut corriger
        showMessage('❌ Certaines réponses sont incorrectes. Vous pouvez retirer les éléments incorrects et réessayer.', 'error');

        // Ajouter des boutons de retrait visuels sur les zones remplies
        addRemoveButtons(exerciseNumber);
    }
}

// Verrouiller un exercice validé
function lockExercise(exerciseNumber) {
    const exercise = document.getElementById(`exercise-${exerciseNumber}`);
    const draggableItems = exercise.querySelectorAll('.draggable-item');
    const dropZones = exercise.querySelectorAll('.drop-zone');
    const validateButton = exercise.querySelector('.validate-btn');

    // Désactiver tous les éléments draggables
    draggableItems.forEach(item => {
        item.draggable = false;
        item.classList.add('locked');
    });

    // Désactiver les zones de drop
    dropZones.forEach(zone => {
        zone.classList.add('locked');
        // Retirer les event listeners en clonant et remplaçant
        const newZone = zone.cloneNode(true);
        zone.parentNode.replaceChild(newZone, zone);
    });

    // Désactiver le bouton de validation
    if (validateButton) {
        validateButton.disabled = true;
        validateButton.textContent = '✓ Validé';
    }

    // Retirer tous les boutons de retrait
    exercise.querySelectorAll('.remove-btn').forEach(btn => btn.remove());
}

// Ajouter des boutons de retrait visuels
function addRemoveButtons(exerciseNumber) {
    const exercise = document.getElementById(`exercise-${exerciseNumber}`);
    const dropZones = exercise.querySelectorAll('.drop-zone.filled');

    dropZones.forEach(zone => {
        // Ne pas ajouter si déjà présent
        if (zone.querySelector('.remove-btn')) return;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '×';
        removeBtn.title = 'Retirer cet élément';
        removeBtn.onclick = (e) => {
            e.stopPropagation();
            removeItemFromZone(zone);
        };

        zone.appendChild(removeBtn);
    });
}

// Retirer un élément d'une zone
function removeItemFromZone(zone) {
    const value = zone.getAttribute('data-filled-value');

    // Vider la zone
    const removeBtn = zone.querySelector('.remove-btn');
    if (removeBtn) removeBtn.remove();

    zone.textContent = '';
    zone.removeAttribute('data-filled-value');
    zone.classList.remove('filled', 'correct', 'incorrect');

    // Réactiver l'élément draggable correspondant
    const draggableItems = document.querySelectorAll('.draggable-item');
    draggableItems.forEach(item => {
        if (item.getAttribute('data-value') === value && item.classList.contains('used')) {
            item.classList.remove('used');
            item.draggable = true;
        }
    });
}

// Réinitialiser un exercice
function resetExercise(exerciseNumber) {
    const exercise = document.getElementById(`exercise-${exerciseNumber}`);
    const dropZones = exercise.querySelectorAll('.drop-zone');
    const draggableItems = exercise.querySelectorAll('.draggable-item');

    // Vider toutes les zones
    dropZones.forEach(zone => {
        const removeBtn = zone.querySelector('.remove-btn');
        if (removeBtn) removeBtn.remove();

        zone.textContent = '';
        zone.removeAttribute('data-filled-value');
        zone.classList.remove('filled', 'correct', 'incorrect');
    });

    // Réactiver tous les éléments
    draggableItems.forEach(item => {
        item.classList.remove('used');
        item.draggable = true;
    });

    showMessage('Exercice réinitialisé. Vous pouvez recommencer.', 'info');
}

// Navigation entre exercices
function goToPreviousExercise() {
    if (currentExercise > 1) {
        showExercise(currentExercise - 1);
    }
}

function goToNextExercise() {
    // Vérifier si l'exercice actuel est validé
    if (exerciseStates[currentExercise] !== 'valid') {
        showMessage('Vous devez d\'abord valider correctement cet exercice avant de passer au suivant.', 'error');
        return;
    }

    if (currentExercise < 10) {
        showExercise(currentExercise + 1);
    } else {
        showQuiz();
    }
}

// Mettre à jour l'état des boutons de navigation
function updateNavigationButtons() {
    const exercise = document.getElementById(`exercise-${currentExercise}`);
    if (!exercise) return;

    const prevBtn = exercise.querySelector('.nav-prev-btn');
    const nextBtn = exercise.querySelector('.nav-next-btn');

    if (prevBtn) {
        prevBtn.disabled = currentExercise === 1;
    }

    if (nextBtn) {
        // Désactiver le bouton suivant si l'exercice n'est pas validé
        nextBtn.disabled = exerciseStates[currentExercise] !== 'valid';

        if (exerciseStates[currentExercise] === 'valid') {
            nextBtn.classList.add('enabled');
            nextBtn.classList.remove('disabled');
        } else {
            nextBtn.classList.add('disabled');
            nextBtn.classList.remove('enabled');
        }
    }
}

// Affichage des exercices
function showExercise(exerciseNumber) {
    // Cacher tous les exercices
    for (let i = 1; i <= 10; i++) {
        const ex = document.getElementById(`exercise-${i}`);
        if (ex) ex.classList.add('hidden');
    }

    // Afficher l'exercice demandé
    const exercise = document.getElementById(`exercise-${exerciseNumber}`);
    if (exercise) {
        exercise.classList.remove('hidden');
        currentExercise = exerciseNumber;
        updateProgress();

        // NE PAS réinitialiser si l'exercice est déjà validé
        if (exerciseStates[exerciseNumber] !== 'valid') {
            // Réinitialiser le drag and drop uniquement pour les exercices non validés
            const draggableItems = exercise.querySelectorAll('.draggable-item');
            const dropZones = exercise.querySelectorAll('.drop-zone');

            draggableItems.forEach(item => {
                if (!item.classList.contains('locked')) {
                    item.classList.remove('used');
                    item.draggable = true;
                }
            });

            dropZones.forEach(zone => {
                if (!zone.classList.contains('locked')) {
                    const removeBtn = zone.querySelector('.remove-btn');
                    if (removeBtn) removeBtn.remove();

                    zone.textContent = '';
                    zone.removeAttribute('data-filled-value');
                    zone.classList.remove('filled', 'correct', 'incorrect');
                }
            });
        }

        // Mettre à jour les boutons de navigation
        updateNavigationButtons();
    }
}

// Quiz
function initializeQuizForm() {
    const quizForm = document.getElementById('quiz-form');
    quizForm.addEventListener('submit', (e) => {
        e.preventDefault();
        validateQuiz();
    });
}

function showQuiz() {
    document.getElementById('payslips-section').classList.add('hidden');
    document.getElementById('quiz-section').classList.remove('hidden');
    window.scrollTo(0, 0);
}

function validateQuiz() {
    let correctAnswers = 0;
    let allAnswered = true;
    
    // Vérifier si toutes les questions ont une réponse
    for (let i = 1; i <= 5; i++) {
        const answer = document.querySelector(`input[name="q${i}"]:checked`);
        if (!answer) {
            allAnswered = false;
            break;
        }
    }
    
    if (!allAnswered) {
        showMessage('Veuillez répondre à toutes les questions avant de terminer le quiz !', 'error');
        return;
    }
    
    // Valider les réponses
    for (let i = 1; i <= 5; i++) {
        const questionName = `q${i}`;
        const selectedAnswer = document.querySelector(`input[name="${questionName}"]:checked`);
        const labels = document.querySelectorAll(`input[name="${questionName}"]`);
        
        if (selectedAnswer) {
            const parentLabel = selectedAnswer.parentElement;
            
            if (selectedAnswer.value === quizAnswers[questionName]) {
                correctAnswers++;
                parentLabel.classList.add('correct');
            } else {
                parentLabel.classList.add('incorrect');
                // Marquer la bonne réponse
                labels.forEach(label => {
                    if (label.value === quizAnswers[questionName]) {
                        label.parentElement.classList.add('correct');
                    }
                });
            }
        }
    }
    
    quizScore = correctAnswers;
    totalScore += correctAnswers;
    updateScore();
    
    setTimeout(() => {
        showResults();
    }, 3000);
}

// Mise à jour du score
function updateScore() {
    document.getElementById('current-score').textContent = totalScore;
}

// Mise à jour de la barre de progression
function updateProgress() {
    const progress = (currentExercise / 10) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
}

// Affichage des résultats
function showResults() {
    document.getElementById('quiz-section').classList.add('hidden');
    document.getElementById('results-section').classList.remove('hidden');

    const percentage = Math.round((totalScore / 55) * 100);
    let appreciation = '';

    if (percentage >= 90) {
        appreciation = '🏆 Excellent ! Vous maîtrisez parfaitement la matière !';
    } else if (percentage >= 75) {
        appreciation = '👏 Très bien ! Vous avez une bonne compréhension du sujet.';
    } else if (percentage >= 60) {
        appreciation = '👍 Bien ! Continuez à vous exercer pour améliorer vos résultats.';
    } else if (percentage >= 50) {
        appreciation = '📚 Passable. Revoyez les concepts importants.';
    } else {
        appreciation = '📖 Il est recommandé de revoir la matière en détail.';
    }

    document.getElementById('final-score').textContent = totalScore;
    document.getElementById('percentage').textContent = `Pourcentage : ${percentage}%`;
    document.getElementById('appreciation').textContent = appreciation;
    document.getElementById('payslip-score').textContent = payslipScore;
    document.getElementById('quiz-score').textContent = quizScore;
    document.getElementById('student-email').textContent = studentEmail;

    const now = new Date();
    const dateString = now.toLocaleDateString('fr-BE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('completion-date').textContent = dateString;

    window.scrollTo(0, 0);
}

// Affichage de messages
function showMessage(message, type) {
    // Supprimer les anciens messages
    const oldMessages = document.querySelectorAll('.message');
    oldMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const currentSection = document.querySelector('.section:not(.hidden)');
    if (currentSection) {
        currentSection.insertBefore(messageDiv, currentSection.firstChild);
        
        // Scroll vers le message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Supprimer le message après 5 secondes
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Support tactile (touch events)
let touchedElement = null;
let touchClone = null;

function handleTouchStart(e) {
    if (this.classList.contains('used')) {
        e.preventDefault();
        return;
    }

    touchedElement = this;
    this.classList.add('dragging');

    // Créer un clone visuel pour le drag
    touchClone = this.cloneNode(true);
    touchClone.style.position = 'fixed';
    touchClone.style.zIndex = '10000';
    touchClone.style.opacity = '0.8';
    touchClone.style.pointerEvents = 'none';
    touchClone.style.width = this.offsetWidth + 'px';
    document.body.appendChild(touchClone);

    const touch = e.touches[0];
    touchClone.style.left = (touch.clientX - this.offsetWidth / 2) + 'px';
    touchClone.style.top = (touch.clientY - 25) + 'px';

    e.preventDefault();
}

function handleTouchMove(e) {
    if (!touchedElement || !touchClone) return;

    const touch = e.touches[0];
    touchClone.style.left = (touch.clientX - touchedElement.offsetWidth / 2) + 'px';
    touchClone.style.top = (touch.clientY - 25) + 'px';

    e.preventDefault();
}

function handleTouchEnd(e) {
    if (!touchedElement) return;

    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

    // Trouver la drop zone la plus proche
    let dropZone = dropTarget;
    while (dropZone && !dropZone.classList.contains('drop-zone')) {
        dropZone = dropZone.parentElement;
    }

    if (dropZone && dropZone.classList.contains('drop-zone') && !dropZone.classList.contains('filled')) {
        const value = touchedElement.getAttribute('data-value');
        const displayText = touchedElement.textContent;

        dropZone.textContent = displayText;
        dropZone.setAttribute('data-filled-value', value);
        dropZone.classList.add('filled');

        touchedElement.classList.add('used');
        touchedElement.draggable = false;
    }

    touchedElement.classList.remove('dragging');

    if (touchClone) {
        touchClone.remove();
        touchClone = null;
    }

    touchedElement = null;
    e.preventDefault();
}

// Mode sélection pour fallback tactile
function selectItem(item) {
    // Désélectionner tous les autres
    document.querySelectorAll('.draggable-item').forEach(i => {
        i.classList.remove('selected');
    });

    // Sélectionner celui-ci
    if (!item.classList.contains('used') && !item.classList.contains('locked')) {
        item.classList.add('selected');
        selectedItem = item;
        showMessage('Élément sélectionné. Cliquez sur "Placer ici" dans une case pour le placer.', 'info');

        // Afficher les boutons "Placer ici"
        const exercise = item.closest('.payslip-exercise');
        if (exercise) {
            showPlaceButtons(exercise);
        }
    }
}

function showPlaceButtons(exercise) {
    // Retirer les anciens boutons
    exercise.querySelectorAll('.place-here-btn').forEach(btn => btn.remove());

    // Ajouter des boutons "Placer ici" sur les zones vides
    const dropZones = exercise.querySelectorAll('.drop-zone:not(.filled):not(.locked)');
    dropZones.forEach(zone => {
        const placeBtn = document.createElement('button');
        placeBtn.className = 'place-here-btn';
        placeBtn.textContent = 'Placer ici';
        placeBtn.onclick = (e) => {
            e.stopPropagation();
            placeSelectedItem(zone);
        };
        zone.appendChild(placeBtn);
    });
}

function placeSelectedItem(zone) {
    if (!selectedItem || zone.classList.contains('filled') || zone.classList.contains('locked')) {
        return;
    }

    const value = selectedItem.getAttribute('data-value');
    const displayText = selectedItem.textContent;

    zone.textContent = displayText;
    zone.setAttribute('data-filled-value', value);
    zone.classList.add('filled');

    selectedItem.classList.add('used');
    selectedItem.classList.remove('selected');
    selectedItem.draggable = false;

    // Retirer tous les boutons "Placer ici"
    document.querySelectorAll('.place-here-btn').forEach(btn => btn.remove());

    selectedItem = null;
}

function cancelSelection() {
    if (selectedItem) {
        selectedItem.classList.remove('selected');
        selectedItem = null;
    }

    // Retirer tous les boutons "Placer ici"
    document.querySelectorAll('.place-here-btn').forEach(btn => btn.remove());
}

// Empêcher le comportement par défaut du drag sur le document
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
});
