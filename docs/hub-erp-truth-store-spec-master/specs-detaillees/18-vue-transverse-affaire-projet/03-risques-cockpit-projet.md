# Vue transverse Affaire / Projet - Risques et cockpit projet

## Périmètre

Affichage des risques et blocages du projet et pilotage par statut de surveillance.

## Écran / action

### Action 1 - Consulter les risques et blocages

- Écran : Fiche projet - Cockpit
- Action : Ouvrir l'onglet risques

### Action 2 - Basculer en "Sous surveillance"

- Écran : Fiche projet - Cockpit
- Action : Marquer le projet en surveillance

## Input

### Action 1 - Consulter les risques et blocages

- Champ / donnée : Projet ; Source : utilisateur habilité ; Caractère obligatoire : oui ; Remarque : selon droits.

### Action 2 - Basculer en "Sous surveillance"

- Champ / donnée : Motif de surveillance ; Source : chef de projet ou direction ; Caractère obligatoire : oui ; Remarque : trace obligatoire.
- Champ / donnée : Niveau de risque ; Source : chef de projet ou direction ; Caractère obligatoire : non ; Remarque : optionnel.

## Traitement système

### Action 1 - Consulter les risques et blocages

1. Vérifier les droits de consultation.
2. Charger les risques ouverts et leurs statuts.
3. Afficher les risques, impacts et actions en cours.

### Action 2 - Basculer en "Sous surveillance"

1. Vérifier les droits de modification du statut global.
2. Enregistrer le motif et l'horodatage.
3. Mettre a jour le statut du dossier projet en "Sous surveillance".
4. Tracer l'action dans l'historique.
5. Notifier les parties prenantes si requis.

## Output

### Action 1 - Consulter les risques et blocages

- Résultat visible : Liste des risques et blocages.
- Statut affiché : Statut global du projet.
- Trace créée : Aucune.
- Notification éventuelle : Aucune.

### Action 2 - Basculer en "Sous surveillance"

- Résultat visible : Projet marque en surveillance.
- Statut affiché : Sous surveillance.
- Trace créée : Historique de changement d'etat.
- Notification éventuelle : Notification au management projet si parametre.

## Règle métier

### Action 1 - Consulter les risques et blocages

- Règle 1 : Les risques et blocages doivent etre visibles au niveau projet.
- Règle 2 : Le realisé a date reste accessible dans le cockpit.

### Action 2 - Basculer en "Sous surveillance"

- Règle 1 : L'etat "Sous surveillance" est utilisable quand des risques majeurs sont identifies.
- Règle 2 : Le changement de statut doit etre trace.

## Exception

### Action 1 - Consulter les risques et blocages

- Cas : Aucun risque en cours ; Effet attendu : liste vide avec message.
- Cas : Droits insuffisants ; Effet attendu : acces refuse.

### Action 2 - Basculer en "Sous surveillance"

- Cas : Motif absent ; Effet attendu : action refusee.
- Cas : Projet deja en cloture ; Effet attendu : action bloquee selon gouvernance.
## Liens documentaires

- Relation -> [README du module](./README.md) : porte d’entrée du module Vue transverse Affaire / Projet
- Relation -> [Matrice 18-vue-transverse-affaire-projet.md](../../matrices/18-vue-transverse-affaire-projet.md) : correspondance consolidée entre concept, user story, règle métier et flux
- Relation -> [use-cases.md](../../use-cases.md) : cas d’usage de référence du module appliqués à cette fiche
- Relation -> [user-stories.md](../../user-stories.md) : attentes exprimées côté utilisateur appliqués à cette fiche
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences fonctionnelles à décliner appliqués à cette fiche
- Relation -> [business-rules.md](../../business-rules.md) : règles métier structurantes appliqués à cette fiche
- Relation -> [permissions.md](../../permissions.md) : habilitations et rôles associés appliqués à cette fiche
- Relation -> [state-transitions.md](../../state-transitions.md) : transitions d’état concernées appliqués à cette fiche
- Relation -> [edge-cases.md](../../edge-cases.md) : cas limites à rejouer en recette appliqués à cette fiche
- Relation -> [user-flows.md](../../user-flows.md) : parcours opérationnels de référence appliqués à cette fiche

## Liens inter-modules

- Relation -> [03-suivi-ecarts-marge.md](../../04-budget-pilotage-financier-projet/03-suivi-ecarts-marge.md) : les dérives de marge sont un risque central du cockpit projet
- Relation -> [02-jalons-replanification.md](../../15-planning-coordination-operationnelle/02-jalons-replanification.md) : les décalages de planning se traduisent en risques projet
- Relation -> [03-blocage-controle-interne.md](../../16-gouvernance-validation-controle-interne/03-blocage-controle-interne.md) : les blocages de contrôle interne doivent être visibles dans le cockpit
- Relation -> [02-kpi-projet-finance.md](../../17-reporting-kpi-direction/02-kpi-projet-finance.md) : les risques projet s’analysent avec les KPI financiers et opérationnels

