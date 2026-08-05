# Exécution terrain / Ordres de travail - Création et planification OT

## Périmètre

Créer un OT et le planifier sur une équipe ou un prestataire avec les informations nécessaires à l'exécution.

## Écran / action

### Action 1 - Créer un OT

- Écran : Formulaire "Créer OT"
- Action : Enregistrer l'OT

### Action 2 - Planifier et affecter un OT

- Écran : Fiche OT / onglet Planification
- Action : Affecter une équipe et une date

## Input

### Action 1 - Créer un OT

- Champ / donnée : site / chantier / projet / affaire / ticket
- Source : sélection utilisateur
- Caractère obligatoire : oui
- Remarque : au moins un rattachement opérationnel est requis

- Champ / donnée : type d'OT / type d'intervention
- Source : sélection utilisateur
- Caractère obligatoire : oui
- Remarque : conditionne checklists et exigences de preuve

- Champ / donnée : description / tâches
- Source : saisie utilisateur
- Caractère obligatoire : oui
- Remarque : doit être exploitable par l'équipe terrain

### Action 2 - Planifier et affecter un OT

- Champ / donnée : date / créneau
- Source : sélection utilisateur
- Caractère obligatoire : oui
- Remarque : doit être cohérent avec le planning

- Champ / donnée : équipe interne ou prestataire
- Source : sélection utilisateur
- Caractère obligatoire : oui
- Remarque : doit être disponible selon le planning

## Traitement système

### Action 1 - Créer un OT

1. Vérifier les droits de création OT et les périmètres autorisés.
2. Vérifier les champs obligatoires et la cohérence du rattachement.
3. Générer une référence OT unique.
4. Créer l'OT au statut "Brouillon" ou "Créé".
5. Historiser la création.

### Action 2 - Planifier et affecter un OT

1. Vérifier les droits d'affectation et la disponibilité des ressources.
2. Vérifier que l'OT est dans un état planifiable.
3. Enregistrer date et équipe/prestataire.
4. Passer le statut à "Planifié" puis "Affecté" si applicable.
5. Notifier l'équipe ou le prestataire.

## Output

### Action 1 - Créer un OT

- Résultat visible : OT créé avec référence unique
- Statut affiché : Brouillon / Créé
- Trace créée : entrée d'historique OT
- Notification éventuelle : aucune

### Action 2 - Planifier et affecter un OT

- Résultat visible : OT planifié et affecté
- Statut affiché : Planifié / Affecté
- Trace créée : historisation de la planification
- Notification éventuelle : équipe/prestataire informé

## Règle métier

### Action 1 - Créer un OT

- Règle 1 : un OT doit être rattaché à un site, chantier, projet, affaire ou ticket.
- Règle 2 : les tâches doivent être suffisamment explicites pour exécution terrain.

### Action 2 - Planifier et affecter un OT

- Règle 1 : un OT doit être planifié avant exécution.
- Règle 2 : l'équipe/prestataire doit être identifié avant démarrage.

## Exception

### Action 1 - Créer un OT

- Cas : rattachement manquant ou objet inactif
  Effet attendu : blocage de création, message d'erreur.
- Cas : utilisateur non autorisé
  Effet attendu : action refusée, journalisée.

### Action 2 - Planifier et affecter un OT

- Cas : équipe indisponible ou conflit de planning
  Effet attendu : refus de planification, propositions d'alternatives si disponibles.
- Cas : OT dans un état non planifiable
  Effet attendu : action bloquée, statut affiché.

## Liens documentaires

- Relation -> [README du module](./README.md) : rattache cette fiche au périmètre global OT.
- Relation -> [Matrice du module](../../matrices/07-execution-terrain-ordres-de-travail.md) : aligne la fiche avec les objets métier et règles consolidés.
- Relation -> [permissions.md](../../permissions.md) : précise qui peut créer et planifier un OT.
- Relation -> [state-transitions.md](../../state-transitions.md) : formalise le passage brouillon -> planifié -> affecté.
- Relation -> [business-rules.md](../../business-rules.md) : rappelle les conditions de rattachement et de disponibilité.

## Liens inter-modules

- Relation -> [14-sav-maintenance-ticketing/01-creation-ticket.md](../14-sav-maintenance-ticketing/01-creation-ticket.md) : un ticket SAV peut déclencher la création d'un OT.
- Relation -> [15-planning-coordination-operationnelle/01-planning-ressources.md](../15-planning-coordination-operationnelle/01-planning-ressources.md) : la planification OT dépend du planning des équipes et moyens.
