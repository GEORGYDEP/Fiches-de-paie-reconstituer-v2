# Exercice Fiches de Paie - Belgique

Application web interactive pour l'apprentissage des fiches de paie belges, destinée aux élèves de l'ISTLM.

## 📋 Description

Cette application permet aux élèves de :
- Compléter 5 fiches de paie réalistes belges en glissant-déposant les montants corrects
- Répondre à un quiz de 5 questions sur la théorie des salaires
- Obtenir un score détaillé sur 30 points (25 pour les fiches + 5 pour le quiz)

## 🎯 Fonctionnalités

### Authentification
- Les élèves doivent se connecter avec leur email ISTLM au format : `prenom.nom@istlm.org`

### Exercices de Fiches de Paie (25 points)

**Fiche 1 - Sophie Dubois (Employée - 2000€ brut)**
- Replacer : Salaire Brut et Salaire Net
- Points : 5

**Fiche 2 - Marc Legrand (Ouvrier - 2500€ brut)**
- Replacer : Coût Salarial Total et ONSS Patronale
- Points : 5

**Fiche 3 - Julie Martin (Employée - 3500€ brut)**
- Replacer : ONSS Personnelle et Précompte Professionnel
- Points : 5

**Fiche 4 - Pierre Dumont (Ouvrier - 4000€ brut)**
- Replacer : Salaire Imposable, Précompte Professionnel et Salaire Net
- Points : 5

**Fiche 5 - Isabelle Leroy (Employée - 4500€ brut)**
- Replacer : TOUS les montants (exercice complet)
- Points : 5

### Quiz Théorique (5 points)
- 5 questions à choix multiples sur les concepts clés
- 1 point par bonne réponse

## 💡 Calculs Appliqués

### Pour les Employés :
- **ONSS Personnelle** : 13,07% du salaire brut
- **ONSS Patronale** : 25% du salaire brut
- **Précompte Professionnel** : 30% du salaire imposable

### Pour les Ouvriers :
- **ONSS Personnelle** : 13,07% × 108% du salaire brut
- **ONSS Patronale** : 25% du salaire brut
- **Précompte Professionnel** : 30% du salaire imposable

### Formules :
```
Coût Salarial = Salaire Brut + ONSS Patronale
Salaire Imposable = Salaire Brut - ONSS Personnelle
Salaire Net = Salaire Imposable - Précompte Professionnel
```

## 🚀 Déploiement sur GitHub Pages

### Étape 1 : Créer un repository GitHub

1. Allez sur [GitHub](https://github.com) et connectez-vous
2. Cliquez sur le bouton "+" en haut à droite puis "New repository"
3. Nommez votre repository (par exemple : `fiches-paie-exercice`)
4. Choisissez "Public"
5. Cliquez sur "Create repository"

### Étape 2 : Uploader les fichiers

**Option A : Via l'interface web GitHub**
1. Dans votre nouveau repository, cliquez sur "Add file" > "Upload files"
2. Glissez-déposez les 4 fichiers :
   - `index.html`
   - `styles.css`
   - `script.js`
   - `README.md`
3. Cliquez sur "Commit changes"

**Option B : Via Git en ligne de commande**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/fiches-paie-exercice.git
git push -u origin main
```

### Étape 3 : Activer GitHub Pages

1. Dans votre repository, allez dans **Settings** (Paramètres)
2. Dans le menu de gauche, cliquez sur **Pages**
3. Sous "Source", sélectionnez la branche **main**
4. Gardez le dossier **/ (root)**
5. Cliquez sur **Save**
6. Attendez quelques minutes

### Étape 4 : Accéder à votre application

Votre application sera accessible à l'adresse :
```
https://VOTRE_USERNAME.github.io/fiches-paie-exercice/
```

## 📱 Utilisation

1. **Connexion** : Entrez votre email ISTLM (format : prenom.nom@istlm.org)
2. **Fiches de paie** : 
   - Lisez les instructions pour chaque fiche
   - Glissez-déposez les montants dans les cases appropriées
   - Cliquez sur "Valider cette fiche"
   - Si correct, vous passez automatiquement à la fiche suivante
3. **Quiz** : Répondez aux 5 questions théoriques
4. **Résultats** : Consultez votre score détaillé et votre appréciation

## 🎨 Fonctionnalités Techniques

- **Drag & Drop** : Interface intuitive de glisser-déposer
- **Validation temps réel** : Feedback immédiat sur les réponses
- **Responsive Design** : Fonctionne sur ordinateur, tablette et mobile
- **Animations** : Effets visuels pour une meilleure expérience utilisateur
- **Impression** : Possibilité d'imprimer les résultats
- **Score détaillé** : Barre de progression et score en temps réel

## 📊 Barème de Notation

| Score | Pourcentage | Appréciation |
|-------|-------------|--------------|
| 27-30 | 90-100% | 🏆 Excellent ! |
| 23-26 | 75-89% | 👏 Très bien ! |
| 18-22 | 60-74% | 👍 Bien ! |
| 15-17 | 50-59% | 📚 Passable |
| 0-14 | 0-49% | 📖 À revoir |

## 🛠️ Technologies Utilisées

- **HTML5** : Structure de l'application
- **CSS3** : Mise en page et animations
- **JavaScript (Vanilla)** : Logique interactive
- **GitHub Pages** : Hébergement gratuit

## 📝 Structure des Fichiers

```
fiches-paie-exercice/
│
├── index.html          # Page principale de l'application
├── styles.css          # Feuille de styles CSS
├── script.js           # Logique JavaScript
└── README.md           # Documentation (ce fichier)
```

## 🎓 Objectifs Pédagogiques

Les élèves apprennent à :
- Identifier les différents composants d'une fiche de paie belge
- Calculer les cotisations sociales (ONSS personnelle et patronale)
- Comprendre la différence entre salaire brut, imposable et net
- Distinguer le statut employé et ouvrier
- Calculer le coût salarial total pour l'employeur
- Maîtriser les concepts de précompte professionnel

## ⚙️ Personnalisation

Pour modifier les fiches de paie ou les questions du quiz, éditez les fichiers suivants :

- **Fiches de paie** : `index.html` (sections avec class "payslip-exercise")
- **Réponses du quiz** : `script.js` (variable `quizAnswers`)
- **Apparence** : `styles.css`

## 🐛 Support

Pour toute question ou problème :
1. Vérifiez que tous les fichiers sont bien uploadés
2. Vérifiez que GitHub Pages est bien activé
3. Attendez quelques minutes après l'activation
4. Videz le cache de votre navigateur (Ctrl+F5)

## 📄 Licence

Ce projet est destiné à un usage éducatif pour l'ISTLM.

## 👨‍🏫 Auteur

Application développée pour les cours d'économie de l'ISTLM - 2025

---

**Bonne chance aux élèves ! 🍀**
