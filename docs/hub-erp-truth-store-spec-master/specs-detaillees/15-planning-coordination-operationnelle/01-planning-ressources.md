# Planning / Coordination opérationnelle - Planning et ressources

## Périmètre

Créer des activités planifiées et affecter des ressources humaines et matérielles au planning d'un projet ou d'une affaire.

## Écran / action

### Action 1 - Créer une activité planifiée

- Écran : Planning projet
- Action : Ajouter une activité

### Action 2 - Affecter une équipe et des moyens

- Écran : Détail activité
- Action : Affecter ressources

## Input

### Action 1 - Créer une activité planifiée

- Champ / donnée : projet/affaire, activité, site, dates prévisionnelles, dépendances
- Source : planificateur ou chef de projet
- Caractère obligatoire : projet/affaire, activité, dates
- Remarque : une activité doit être rattachée à un projet

### Action 2 - Affecter une équipe et des moyens

- Champ / donnée : équipe, technicien(s), véhicule(s), équipement(s)
- Source : planificateur
- Caractère obligatoire : équipe
- Remarque : vérifier la disponibilité des ressources

## Traitement système

### Action 1 - Créer une activité planifiée

1. Vérifier droits et rattachement au projet/affaire.
2. Enregistrer l'activité avec dates prévisionnelles.
3. Créer les dépendances avec d'autres activités si indiquées.
4. Mettre à jour la vue calendrier.
5. Tracer la création dans l'historique.

### Action 2 - Affecter une équipe et des moyens

1. Vérifier la disponibilité des ressources.
2. Réserver les ressources pour la période planifiée.
3. Mettre à jour l'activité avec les affectations.
4. Notifier les responsables si applicable.
5. Historiser l'affectation.

## Output

### Action 1 - Créer une activité planifiée

- Résultat visible : activité créée sur le planning
- Statut affiché : planifiée
- Trace créée : historique d'activité
- Notification éventuelle : alerte aux responsables

### Action 2 - Affecter une équipe et des moyens

- Résultat visible : ressources affectées
- Statut affiché : activité affectée
- Trace créée : journal d'affectation
- Notification éventuelle : notification équipe

## Règle métier

### Action 1 - Créer une activité planifiée

- Les activités planifiées doivent être rattachées à une affaire ou un projet.
- Les jalons doivent être suivables dans le temps.

### Action 2 - Affecter une équipe et des moyens

- Les équipes affectées doivent être identifiables sur le planning.
- La planification doit soutenir la coordination approvisionnement/travaux.

## Exception

### Action 1 - Créer une activité planifiée

- Cas : activité sans projet
  Effet attendu : blocage de la création
- Cas : conflit de dépendance
  Effet attendu : avertissement et confirmation

### Action 2 - Affecter une équipe et des moyens

- Cas : ressource indisponible
  Effet attendu : refus d'affectation et proposition d'alternative
- Cas : matériel non reçu
  Effet attendu : alerte et replanification suggérée
## Liens documentaires

- Relation -> [README du module](./README.md) : porte d’entrée du module Planning / Coordination opérationnelle
- Relation -> [Matrice 15-planning-coordination-operationnelle.md](../../matrices/15-planning-coordination-operationnelle.md) : correspondance consolidée entre concept, user story, règle métier et flux
- Relation -> [use-cases.md](../../use-cases.md) : cas d’usage de référence du module appliqués à cette fiche
- Relation -> [user-stories.md](../../user-stories.md) : attentes exprimées côté utilisateur appliqués à cette fiche
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences fonctionnelles à décliner appliqués à cette fiche
- Relation -> [business-rules.md](../../business-rules.md) : règles métier structurantes appliqués à cette fiche
- Relation -> [permissions.md](../../permissions.md) : habilitations et rôles associés appliqués à cette fiche
- Relation -> [state-transitions.md](../../state-transitions.md) : transitions d’état concernées appliqués à cette fiche
- Relation -> [edge-cases.md](../../edge-cases.md) : cas limites à rejouer en recette appliqués à cette fiche
- Relation -> [user-flows.md](../../user-flows.md) : parcours opérationnels de référence appliqués à cette fiche

## Liens inter-modules

- Relation -> [03-affaire-rattachement-vue-consolidee.md](../../03-contrats-affaires-projets/03-affaire-rattachement-vue-consolidee.md) : la planification doit rester rattachée au projet ou à l’affaire
- Relation -> [02-affectation-reservation.md](../../06-stock-logistique-magasin/02-affectation-reservation.md) : les ressources matérielles doivent être réservables pour les activités planifiées
- Relation -> [01-creation-planification-ot.md](../../07-execution-terrain-ordres-de-travail/01-creation-planification-ot.md) : le planning prépare la création et l’ordonnancement des OT

