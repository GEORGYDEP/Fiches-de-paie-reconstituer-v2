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
    5: false
};

// Réponses correctes du quiz
const quizAnswers = {
    q1: 'b',  // Le montant avant toute déduction
    q2: 'b',  // Le salaire brut plus les cotisations patronales
    q3: 'b',  // Un impôt prélevé directement sur le salaire
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
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
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
    let allCorrect = true;
    let allFilled = true;
    
    dropZones.forEach(zone => {
        const filledValue = zone.getAttribute('data-filled-value');
        const correctAnswer = zone.getAttribute('data-answer');
        
        if (!filledValue) {
            allFilled = false;
            return;
        }
        
        const filled = parseFloat(filledValue);
        const correct = parseFloat(correctAnswer);
        
        if (Math.abs(filled - correct) < 0.01) {
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
        if (!exerciseResults[exerciseNumber]) {
            exerciseResults[exerciseNumber] = true;
            payslipScore += 5;
            totalScore += 5;
            updateScore();
        }
        
        showMessage('✅ Excellent ! Toutes vos réponses sont correctes ! (+5 points)', 'success');
        
        setTimeout(() => {
            if (exerciseNumber < 5) {
                showExercise(exerciseNumber + 1);
            } else {
                showQuiz();
            }
        }, 2000);
    } else {
        showMessage('❌ Certaines réponses sont incorrectes. Veuillez réessayer.', 'error');
    }
}

// Affichage des exercices
function showExercise(exerciseNumber) {
    // Cacher tous les exercices
    for (let i = 1; i <= 5; i++) {
        const ex = document.getElementById(`exercise-${i}`);
        if (ex) ex.classList.add('hidden');
    }
    
    // Afficher l'exercice demandé
    const exercise = document.getElementById(`exercise-${exerciseNumber}`);
    if (exercise) {
        exercise.classList.remove('hidden');
        currentExercise = exerciseNumber;
        updateProgress();
        
        // Réinitialiser le drag and drop pour ce nouvel exercice
        const draggableItems = exercise.querySelectorAll('.draggable-item');
        const dropZones = exercise.querySelectorAll('.drop-zone');
        
        draggableItems.forEach(item => {
            item.classList.remove('used');
            item.draggable = true;
        });
        
        dropZones.forEach(zone => {
            zone.textContent = '';
            zone.removeAttribute('data-filled-value');
            zone.classList.remove('filled', 'correct', 'incorrect');
        });
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
    const progress = (currentExercise / 5) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
}

// Affichage des résultats
function showResults() {
    document.getElementById('quiz-section').classList.add('hidden');
    document.getElementById('results-section').classList.remove('hidden');
    
    const percentage = Math.round((totalScore / 30) * 100);
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

// Empêcher le comportement par défaut du drag sur le document
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
});
